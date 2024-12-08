import { CommonModule, FormatWidth } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { TableModule } from 'primeng/table';
import { BehaviorSubject, forkJoin, map, of, tap } from 'rxjs';
import { CustomsDataService } from '../../shared/services/customs-data.service';
import { DeclarationService } from '../../shared/services/declaration.service';
import { StepService } from '../../shared/services/step.service';

@Component({
  selector: 'app-declaration-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, CalendarModule, InputTextareaModule, AutoCompleteModule, TableModule],
  templateUrl: './declaration-form.component.html',
  styleUrl: './declaration-form.component.scss'
})
export class DeclarationFormComponent implements OnInit {
  
  generalDeclarationForm!: FormGroup
  filteredCustomsProcess: any[] = [];
  filteredCountryOfExport: any[] = [];
  filteredChargingCountry: any[] = [];
  filteredUnpackingSite: any[] = [];
  currentFilteredChargingCountry: any[] = [];
  filteredCargoIDType: any[] = [];
  filteredCurrencyCode: any[] = [];
  filteredTradeTermsConditionCode: any[] = [];
  filteredSupplierID: any[] = [];


  declarationCountryOfExport: any;
  declarationCustomsProcess: any;
  declarationChargingCountry: any;
  declarationCargoIDType: any;
  declarationCurrencyCode: any;
  declarationTradeTermsConditionCode: any;
  declarationSupplierID: any;

  ExportationCountrySelect: any;

  columns: any;

  private loadingChargingCountrySubject = new BehaviorSubject<boolean>(true);
  loadingChargingCountry$ = this.loadingChargingCountrySubject.asObservable();

  isCustomsChargingCountry: boolean = false;
  declarationUnpackingSite: any;
  exportationCountryControlError: any = true;
  perfectDecalartion: any;

  constructor(private formBuilder: FormBuilder, private customsDataService: CustomsDataService, private decService: DeclarationService,private stepService: StepService) { }

  ngOnInit(): void {
    forkJoin([
      this.customsDataService.getCustomsTableValues$('1354').pipe(
        map(res => this.declarationCustomsProcess = res.map((item: { Value2: any; Value1: any; }) => ({ name: item.Value2, code: item.Value1 })))),
      // this.customsDataService.getCustomsTableValues$('1136').pipe(
      //   map(res => this.declarationCountryOfExport = res.map((item: { Value2: any; Value1: any; }) => ({ name: item.Value2, code: item.Value1 })))
      // ),
      // this.customsDataService.getCustomsTableValues$('2192').pipe(
      //   map(res => this.declarationUnpackingSite = res.map((item: { Value2: any; Value1: any; }) => ({ name: item.Value2, code: item.Value1 })))
      // ),
      // this.customsDataService.getCustomsTableValues$('1344').pipe(
      //   map(res => this.declarationChargingCountry = res.map((item: { Value2: any; Value1: any; }) => ({ name: item.Value2, code: item.Value1 }))),
      //   tap(_ => this.loadingChargingCountrySubject.next(false))
      // ),
      this.customsDataService.getCustomsTableValues$('1259').pipe(
        map(res => this.declarationCargoIDType = res.map((item: { Value2: any; Value1: any; }) => ({ name: item.Value2, code: item.Value1 })))
      ),
      this.customsDataService.getCustomsTableValues$('1144').pipe(
        map(res => this.declarationCurrencyCode = res.map((item: { Value2: any; Value1: any; }) => ({ name: item.Value2, code: item.Value1 })))
      ),
      this.customsDataService.getCustomsTableValues$('1426').pipe(
        map(res => this.declarationTradeTermsConditionCode = res.map((item: { Value2: any; Value1: any; }) => ({ name: item.Value2, code: item.Value1 })))
      ),
      this.customsDataService.getVendor$().pipe(
        map(res => this.declarationSupplierID = res.map((item: { VendorName: any; VendorID: any }) => ({ name: item.VendorName, code: item.VendorID })))
      ),
      // this.customsDataService.getCustomsTableValues$('1426').pipe(
      //   map(res => res.map((item: { Value2: any; Value1: any; }) => ({ name: item.Value2, code: item.Value1 })))
      // ),


    ]).subscribe(

    );
    this.initForm();

    this.init();

    const exportationCountryControl = this.generalDeclarationForm.get('Consignments.ExportationCountryCode');

    this.setChargingCountryControlStatus()
    exportationCountryControl?.valueChanges.subscribe(value => {
      this.exportationCountryControlError = this.getExportationCountryControlError(exportationCountryControl);
      this.setChargingCountryControlStatus();
    });

    this.loadingChargingCountry$.subscribe(() => {
      this.setChargingCountryControlStatus();
    });

    this.columns = ["מוצר מיובא ", "כמות", "ערך טובין", "ארץ מקור"];
  }

  init() {
    // get data from Local Storage or fetch it if not available
    const getCustomsData = (key: string, tableId: string, mappingFn: (item: any) => any) => {
      const localStorageData = localStorage.getItem(key);
      if (localStorageData) {
        return of(JSON.parse(localStorageData));  // Return stored data as an observable
      } else {
        return this.customsDataService.getCustomsTableValues$(tableId).pipe(
          map(res => {
            const mappedData = res.map(mappingFn);
            localStorage.setItem(key, JSON.stringify(mappedData));  // Save data to Local Storage
            return mappedData;
          })
        );
      }
    };

    const customsCountryExport$ = getCustomsData(
      'customsCountryExport',
      '1136',
      (item: { Value2: any; Value1: any }) => ({ name: `${item.Value2.substring(0, 7)} (${item.Value1})`, code: item.Value1 })
    ).pipe(
      map(res => this.declarationCountryOfExport = res)
    );

    const customsChargingCountry$ = getCustomsData(
      'customsChargingCountry',
      '1344',
      (item: { Value2: any; Value1: any }) => ({ name: item.Value1, code: item.Value1 })
    ).pipe(
      map(res => {
        this.declarationChargingCountry = res;
        this.loadingChargingCountrySubject.next(false);
      }),
      tap(() => {
        // if (this.UpdateMode === 'e' || this.UpdateMode === 'p') {
        //   this.filterChargingCountryByExportCode();
        // }
      })
    );

    const customsUnpackingSite$ = getCustomsData(
      'customsUnpackingSite',
      '2192',
      (item: { Value2: any; Value1: any }) => ({ name: `${item.Value2.substring(0, 7)} (${item.Value1})`, code: item.Value1 })
    ).pipe(
      map(res => this.declarationUnpackingSite = res)
    );

    const customsCargoIDType$ = getCustomsData(
      'customsCargoIDType',
      '1259',
      (item: { Value2: any; Value1: any }) => ({ name: item.Value2, code: item.Value1 })
    ).pipe(
      map(res => this.declarationCargoIDType = res)
    );
    // Use forkJoin to execute all requests or use cached data from Local Storage
    forkJoin([
      customsCountryExport$,
      customsChargingCountry$,
      customsUnpackingSite$,
      customsCargoIDType$,     
    ]).subscribe(() => {
      // if (this.UpdateMode === 'e') {
      //   this.initElements();
      // }
    });
  }

  getExportationCountryControlError(control: any) {
    const value = control?.value;
    const hasError = control?.hasError('required');
    const isEmpty = !value || (value.name === '' && value.code === '');
    return hasError || isEmpty;
  }

  setChargingCountryControlStatus() {
    const chargingCountryControl = this.generalDeclarationForm.get('Consignments.LoadingLocation');

    if (this.exportationCountryControlError || this.loadingChargingCountrySubject.value) {
      chargingCountryControl?.disable();
    } else {
      chargingCountryControl?.enable();
    }
  }

  initForm() {
    this.generalDeclarationForm = this.formBuilder.group({
      //CustomsStatus: this.formBuilder.control(''),
      //AgentFileReferenceID: this.formBuilder.control(''),
      //DeclarationNumber: this.formBuilder.control(''),
      //VersionID: this.formBuilder.control(''),
      //DeclarationOfficeID: this.formBuilder.control({ name: 'בית מכס נתב"ג', code: '4' }, Validators.required),
      GovernmentProcedure: this.formBuilder.control({ name: 'יבוא מסחרי', code: '4000001' }),
      //TypeCode: this.formBuilder.control({ name: 'הצהרת יבוא ', code: '1' }),
      //AutonomyRegionType: this.formBuilder.control({ name: '', code: '' }),
      //EntitlementTypeCode: this.formBuilder.control({ name: '', code: '' }),
      ImporterID: this.formBuilder.control('', Validators.required),
      //AcceptanceDateTime: this.formBuilder.control(''),
      Consignments: this.formBuilder.group({
        ExportationCountryCode: this.formBuilder.control('', Validators.required),
        LoadingLocation: this.formBuilder.control('', Validators.required),
        // LoadingLocation: this.formBuilder.control({value: '', disabled: this.exportationCountryControlError}, Validators.required),
        UnloadingLocationID: this.formBuilder.control('', Validators.required),
        TransportContractDocumentTypeCode: this.formBuilder.control({ name: 'שטר מטען אווירי  ', code: '1' }, Validators.required),
        ArrivalDateTime: this.formBuilder.control(new Date(), Validators.required),
        TransportContractDocumentID: this.formBuilder.control('', Validators.required),
        SecondCargoID: this.formBuilder.control('',),
        ThirdCargoID: this.formBuilder.control('',),
        CargoDescription: this.formBuilder.control(''),
        //FacilityID: this.formBuilder.control({ name: '', code: '' }),
        //FacilityType: this.formBuilder.control({ name: '', code: '' }, Validators.required)
      }),
      ConsignmentPackagesMeasures: this.formBuilder.group({
        //PackageMeasureQualifier: this.formBuilder.control({ name: 'כמות אריזות באתר אחסון', code: '2' }),
        //TypeCode: this.formBuilder.control({ name: 'Package, paper wrapped', code: 'PP' }),
        TotalPackageQuantity: this.formBuilder.control(''),
        GrossMassMeasure: this.formBuilder.control(''),
        //MarksNumbers: this.formBuilder.control(''),
      }),
      SupplierInvoices: this.formBuilder.group({
        InvoiceNumber: this.formBuilder.control('', Validators.required),
        SupplierID: this.formBuilder.control({ name: '', code: '' }, Validators.required),
        IssueDateTime: this.formBuilder.control(new Date(), Validators.required),
        InvoiceAmount: this.formBuilder.control('', Validators.required),
        InvoiceTypeCode: this.formBuilder.control({ name: 'חשבון מכר', code: '380' }, Validators.required),
        CurrencyCode: this.formBuilder.control({ name: '', code: '' }, Validators.required),
        LocationID: this.formBuilder.control({ name: '', code: '' }, Validators.required),
        TradeTermsConditionCode: this.formBuilder.control({ name: '', code: '' }, Validators.required),
        // CustomsValuation: this.formBuilder.array([]),
        SupplierInvoiceItems: this.formBuilder.array([])
      })
    });
    this.addNewInvoiceItem();
  }

  get SupplierInvoiceItems(): FormArray {
    return this.generalDeclarationForm.get('SupplierInvoices.SupplierInvoiceItems') as FormArray
  }

  addNewInvoiceItem(): void {
    const invoiceItemsArray = this.generalDeclarationForm.get(`SupplierInvoices.SupplierInvoiceItems`) as FormArray;
    invoiceItemsArray?.push(this.createSupplierInvoiceItem());
  }

  private createSupplierInvoiceItem(): FormGroup {
    return this.formBuilder.group({
      ClassificationID: this.formBuilder.control('', Validators.required),
      CustomsValueAmount: this.formBuilder.control(null, Validators.required),
      AmountType: this.formBuilder.control('', Validators.required),
      OriginCountryCode: this.formBuilder.control({ name: '', code: '' }, Validators.required)
    });
  }
  ff(){
    this.stepService.emitStepCompleted();
  }
  
  saveDeclaration() {    
    this.stepService.emitStepCompleted();
    const dec = this.generalDeclarationForm.value;
    console.log(dec); 

    dec.GovernmentProcedure = dec.GovernmentProcedure.code ? dec.GovernmentProcedure.code : dec.GovernmentProcedure

    const consignments = dec.Consignments;

    consignments.ExportationCountryCode = consignments.ExportationCountryCode.code ? consignments.ExportationCountryCode.code : consignments.ExportationCountryCode
    consignments.LoadingLocation = consignments.LoadingLocation.code ? consignments.LoadingLocation.code : consignments.LoadingLocation
    consignments.UnloadingLocationID = consignments.UnloadingLocationID.code ? consignments.UnloadingLocationID.code : consignments.UnloadingLocationID
    consignments.TransportContractDocumentTypeCode = consignments.TransportContractDocumentTypeCode.code ? consignments.TransportContractDocumentTypeCode.code : consignments.TransportContractDocumentTypeCode

    const supplierInvoices = dec.SupplierInvoices;

    supplierInvoices.SupplierID = supplierInvoices.SupplierID.code
      ? String(supplierInvoices.SupplierID.code)
      : String(supplierInvoices.SupplierID);
    supplierInvoices.CurrencyCode = supplierInvoices.CurrencyCode.code ? supplierInvoices.CurrencyCode.code : supplierInvoices.CurrencyCode;
    supplierInvoices.LocationID = supplierInvoices.LocationID.code ? supplierInvoices.LocationID.code : supplierInvoices.LocationID;
    supplierInvoices.TradeTermsConditionCode = supplierInvoices.TradeTermsConditionCode.code ? supplierInvoices.TradeTermsConditionCode.code : supplierInvoices.TradeTermsConditionCode;
    supplierInvoices.InvoiceTypeCode = supplierInvoices.InvoiceTypeCode.code ? supplierInvoices.InvoiceTypeCode.code : supplierInvoices.InvoiceTypeCode;

    const SupplierInvoiceItems = supplierInvoices.SupplierInvoiceItems
    if (SupplierInvoiceItems) {
      SupplierInvoiceItems?.forEach((element: any) => {
        element.OriginCountryCode = element.OriginCountryCode?.code;
      });
    }

    dec.RoleCode = '1'
    dec.TaxationDateTime = new Date()
    dec.CreateDateTime = new Date()
    // this.perfectDecalartion = dec
    this.perfectDecalartion = JSON.parse(JSON.stringify(dec));

    this.perfectDecalartion.Consignments = [dec.Consignments]
    this.perfectDecalartion.ConsignmentPackagesMeasures = [dec.ConsignmentPackagesMeasures]
    this.perfectDecalartion.SupplierInvoices = [dec.SupplierInvoices];

    this.decService.addDeclaration(this.perfectDecalartion).subscribe(res => console.log(res))
  }

  onExportationCountrySelect(event: any) {
    this.ExportationCountrySelect = event?.value.name;
    this.loadingChargingCountry$.subscribe(loading => {
      if (!loading) {
        this.filterChargingCountryByExportCode();
      }
    });
    this.generalDeclarationForm.get("LoadingLocation")?.setValue('');
  }

  filterChargingCountryByExportCode() {
    const exportCountryCode = this.generalDeclarationForm.get("Consignments.ExportationCountryCode")?.value.code;
    this.filteredChargingCountry = this.declarationChargingCountry.filter((site: any) =>
      site.code.startsWith(exportCountryCode)
    );
    if (this.filteredChargingCountry.length)
      this.isCustomsChargingCountry = true
  }

  filterCustomsProcess(event: any) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.declarationCustomsProcess.length; i++) {
      let a = this.declarationCustomsProcess[i];
      if (a.name.indexOf(query) != -1) {
        filtered.push(a);
      }
    }
    this.filteredCustomsProcess = filtered
  }

  filterCountryOfExport(event: any) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.declarationCountryOfExport.length; i++) {
      let a = this.declarationCountryOfExport[i];   
      if (a.name.indexOf(query) != -1 && a.code) {
        filtered.push(a);
      }
    }
    this.filteredCountryOfExport = filtered
  }

  filterChargingCountry(event: any) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.filteredChargingCountry.length; i++) {
      let a = this.filteredChargingCountry[i];
      if (a.name.indexOf(query) != -1) {
        filtered.push(a);
      }
    }
    this.currentFilteredChargingCountry = filtered;
  }

  filterUnpackingSite(event: any) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.declarationUnpackingSite.length; i++) {
      let a = this.declarationUnpackingSite[i];
      if (a.name.indexOf(query) != -1) {
        filtered.push(a);
      }
    }
    this.filteredUnpackingSite = filtered;
  }

  filterCargoIDType(event: any) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.declarationCargoIDType.length; i++) {
      let a = this.declarationCargoIDType[i];
      if (a.name.indexOf(query) != -1) {
        filtered.push(a);
      }
    }
    this.filteredCargoIDType = filtered;
  }

  filterCurrencyCode(event: any) {
    const preferredValues = ['USD', 'ILS'];

    let preferred: any[] = [];
    let others: any[] = [];

    let query = event.query;
    for (let i = 0; i < this.declarationCurrencyCode.length; i++) {
      let a = this.declarationCurrencyCode[i];
      if (preferredValues.includes(a.code) && a.code.indexOf(query) === 0) {
        preferred.push(a);
      } else if (a.code.indexOf(query) === 0) {
        others.push(a);
      }
    }
    this.filteredCurrencyCode = [...preferred, ...others];
  }

  filterTradeTermsConditionCode(event: any) {
    let query = event.query;

    const preferredValues = ['FOB', ''];

    let preferred: any[] = [];
    let others: any[] = [];

    for (let i = 0; i < this.declarationTradeTermsConditionCode.length; i++) {
      let a = this.declarationTradeTermsConditionCode[i];
      if (preferredValues.includes(a.code) && a.code.indexOf(query) === 0) {
        preferred.push(a);
      } else if (a.code.indexOf(query) === 0) {
        others.push(a);
      }
    }
    this.filteredTradeTermsConditionCode = [...preferred, ...others];
  }

  filterSupplierID(event: any) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.declarationSupplierID.length; i++) {
      let a = this.declarationSupplierID[i];
      if (a.name && a.name.indexOf(query) != -1) {
        filtered.push(a);
      }
    }
    this.filteredSupplierID = filtered;
  }
}
