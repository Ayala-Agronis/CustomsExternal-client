import { CommonModule, FormatWidth, JsonPipe } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import { BehaviorSubject, forkJoin, map, min, of, Subject, takeUntil, tap } from 'rxjs';
import { CustomsDataService } from '../../shared/services/customs-data.service';
import { DeclarationService } from '../../shared/services/declaration.service';
import { StepService } from '../../shared/services/step.service';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'app-declaration-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TabViewModule, CardModule, ProgressSpinnerModule, MessagesModule, ButtonModule, InputTextModule, CalendarModule, InputTextareaModule, AutoCompleteModule, TableModule, ConfirmDialogModule],
  templateUrl: './declaration-form.component.html',
  styleUrl: './declaration-form.component.scss',
  providers: [ConfirmationService, MessageService],
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
  mode: any;
  customStatus: any;
  customsStatuses: any;

  showBtnCustoms = false
  loading: boolean = false;
  isLocked: boolean = false;
  msgs1: Message[] = [];
  customsErrorsContent: any;
  customsError: any;

  private destroy$ = new Subject<void>();
  secondCargoIDError: any;
  showCustomsValuation: boolean[] = [];

  constructor(private formBuilder: FormBuilder, private route: ActivatedRoute, private cd: ChangeDetectorRef, private confirmationService: ConfirmationService, private customsDataService: CustomsDataService, private decService: DeclarationService, private stepService: StepService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.mode = params['Mode'];
      if (this.mode !== 'e') {
        this.initForm()
        this.customsDataService.GetSeq$('Customs').pipe(
          tap(res => { localStorage.setItem('AgentFileReferenceID', res) })).subscribe()
      }

      if (params['customsSend'] === "true") {
        this.showBtnCustoms = true;
      }
    })

    this.initForm();

    //data from cargo query
    this.decService.packageData$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      if (data) {
        (this.generalDeclarationForm.controls["ConsignmentPackagesMeasures"] as FormGroup).patchValue({
          TotalPackageQuantity: data.totalNumberOfPackeges,
          GrossMassMeasure: data.totalWeight,
        });
        (this.generalDeclarationForm.controls["Consignments"] as FormGroup).patchValue({
          UnloadingLocationID: data.unloadingLocation
        });
      }
    });

    forkJoin([
      this.customsDataService.getCustomsTableValues$('1354').pipe(
        map(res => this.declarationCustomsProcess = res.map((item: { Value2: any; Value1: any; }) => ({ name: item.Value2, code: item.Value1 })))),
      this.customsDataService.getCustomsTableValues$('1981').pipe(
        map(res => this.customsStatuses = res.map((item: { Value2: any; Value1: any; }) => ({ name: item.Value2, code: item.Value1 })))),
      // this.customsDataService.getCustomsTableValues$('2192').pipe(
      //   map(res => this.declarationUnpackingSite = res.map((item: { Value2: any; Value1: any; }) => ({ name: item.Value2, code: item.Value1 })))
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


    ]).subscribe(_ => {
      //init data of consignment
      this.consignmentInit();
      if (this.mode == 'e') {
        this.showBtnCustoms = true
        this.initElements();
      }
    }
    );

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

    if (this.mode != 'e') {
      this.customsDataService.GetSeq$('Customs').pipe(
        tap(res => { localStorage.setItem('AgentFileReferenceID', res) })).subscribe()
    }

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  consignmentInit() {
    this.loading = true
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
      (item: { Value2: any; Value1: any }) => ({ fullName: item.Value2, name: `${item.Value2.substring(0, 11)} (${item.Value1})`, code: item.Value1 })
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
      (item: { Value2: any; Value1: any; Value7: any }) => ({ name: `${item.Value2.substring(0, 7)} (${item.Value1})`, code: item.Value1, siteType: item.Value7 })
    ).pipe(
      map(res => this.declarationUnpackingSite = res)
    );
    // const customsUnpackingSite$ = getCustomsData(
    //   'customsUnpackingSite',
    //   '2192',
    //   (item: { Value2: any; Value1: any; Value7: any }) => item 
    // ).pipe(
    //   map(res => {
    //     console.log( res); 
    //     this.declarationUnpackingSite = res.map((item: { Value2: string; Value1: any; Value7: any; }) => ({
    //       name: `${item.Value2.substring(0, 7)} (${item.Value1})`,
    //       code: item.Value1,
    //       siteType: item.Value7
    //     }));
    //   })
    // );

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
      this.loading = false
      const exportationCountryControl = this.generalDeclarationForm.controls["Consignments"].get('ExportationCountryCode');

      exportationCountryControl?.valueChanges.subscribe(value => {
        this.exportationCountryControlError = this.getExportationCountryControlError(exportationCountryControl);
        this.setChargingCountryControlStatus();
      });
      if (this.mode == 'e') {
        // this.filterChargingCountryByExportCode();
        // this.initElements();
      }
    });
  }

  getOtherChargeDeductionAmountControl(suplierInvoiceIndex: any, index: number): FormControl {
    const control = this.getValuationValue(suplierInvoiceIndex).at(index).get('OtherChargeDeductionAmount');
    return control as FormControl;
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
      CustomsStatus: this.formBuilder.control(''),
      //AgentFileReferenceID: this.formBuilder.control(''),
      DeclarationNumber: this.formBuilder.control(''),
      VersionID: this.formBuilder.control(''),
      // DeclarationOfficeID: this.formBuilder.control({ name: 'בית מכס נתב"ג', code: '4' }, Validators.required),
      DeclarationOfficeID: this.formBuilder.control('4'),
      GovernmentProcedure: this.formBuilder.control({ name: 'יבוא מסחרי', code: '4000001' }),
      //TypeCode: this.formBuilder.control({ name: 'הצהרת יבוא ', code: '1' }),
      TypeCode: this.formBuilder.control('1'),
      //AutonomyRegionType: this.formBuilder.control({ name: '', code: '' }),
      //EntitlementTypeCode: this.formBuilder.control({ name: '', code: '' }),
      ImporterID: this.formBuilder.control(localStorage.getItem('userId') || '2', Validators.required),
      //AcceptanceDateTime: this.formBuilder.control(''),
      Consignments: this.formBuilder.group({
        ExportationCountryCode: this.formBuilder.control('', Validators.required),
        LoadingLocation: this.formBuilder.control('', Validators.required),
        // LoadingLocation: this.formBuilder.control({value: '', disabled: this.exportationCountryControlError}, Validators.required),
        UnloadingLocationID: this.formBuilder.control('', Validators.required),
        TransportContractDocumentTypeCode: this.formBuilder.control({ name: 'שטר מטען אווירי  ', code: '1' }, Validators.required),
        ArrivalDateTime: this.formBuilder.control(new Date(), Validators.required),
        TransportContractDocumentID: this.formBuilder.control(new Date().getFullYear().toString(), Validators.required),
        SecondCargoID: this.formBuilder.control('', Validators.required),
        ThirdCargoID: this.formBuilder.control('',),
        CargoDescription: this.formBuilder.control('', Validators.required),
        //FacilityID: this.formBuilder.control({ name: '', code: '' }),
        //FacilityType: this.formBuilder.control({ name: '', code: '' }, Validators.required)
      }),
      ConsignmentPackagesMeasures: this.formBuilder.group({
        //PackageMeasureQualifier: this.formBuilder.control({ name: 'כמות אריזות באתר אחסון', code: '2' }),
        PackageMeasureQualifier: this.formBuilder.control('2'),
        //TypeCode: this.formBuilder.control({ name: 'Package, paper wrapped', code: 'PP' }),
        TypeCode: this.formBuilder.control('PP'),
        TotalPackageQuantity: this.formBuilder.control(''),
        GrossMassMeasure: this.formBuilder.control(''),
        //MarksNumbers: this.formBuilder.control(''),
      }),
      // SupplierInvoices: this.formBuilder.group({
      //   InvoiceNumber: this.formBuilder.control('', Validators.required),
      //   SupplierID: this.formBuilder.control({ name: '', code: '' }, Validators.required),
      //   IssueDateTime: this.formBuilder.control(new Date(), Validators.required),
      //   InvoiceAmount: this.formBuilder.control('', Validators.required),
      //   InvoiceTypeCode: this.formBuilder.control({ name: 'חשבון מכר', code: '380' }, Validators.required),
      //   CurrencyCode: this.formBuilder.control({ name: '', code: '' }, Validators.required),
      //   LocationID: this.formBuilder.control({ name: '', code: '' }, Validators.required),
      //   TradeTermsConditionCode: this.formBuilder.control({ name: '', code: '' }, Validators.required),
      //   Id: this.formBuilder.control(null),
      //   CustomsValuation: this.formBuilder.array([
      //     this.formBuilder.group({
      //       ID: this.formBuilder.control(null),
      //       ChargesTypeCode: this.formBuilder.control({ name: 'ביטוח', code: '67' }),
      //       CurrencyCode: this.formBuilder.control({ name: 'USD', code: 'USD' }),
      //       OtherChargeDeductionAmount: this.formBuilder.control(0)
      //     }),
      //     this.formBuilder.group({
      //       ID: this.formBuilder.control(null),
      //       ChargesTypeCode: this.formBuilder.control({ name: 'הובלה', code: '144' }),
      //       CurrencyCode: this.formBuilder.control({ name: 'USD', code: 'USD' }),
      //       OtherChargeDeductionAmount: this.formBuilder.control(0)
      //     })
      //   ]),
      //   SupplierInvoiceItems: this.formBuilder.array([])
      // })
      SupplierInvoices: this.formBuilder.array([this.createSupplierInvoice()])
    });
    // if (this.mode != 'e')
    //   this.addNewInvoiceItem(0);
  }

  createSupplierInvoice(): FormGroup {
    return this.formBuilder.group({
      InvoiceNumber: this.formBuilder.control('', Validators.required),
      SupplierID: this.formBuilder.control({ name: '', code: '' }, Validators.required),
      IssueDateTime: this.formBuilder.control(new Date(), Validators.required),
      InvoiceAmount: this.formBuilder.control('', Validators.required),
      InvoiceTypeCode: this.formBuilder.control({ name: 'חשבון מכר', code: '380' }, Validators.required),
      CurrencyCode: this.formBuilder.control({ name: '', code: '' }, Validators.required),
      LocationID: this.formBuilder.control({ name: '', code: '' }, Validators.required),
      TradeTermsConditionCode: this.formBuilder.control({ name: '', code: '' }, Validators.required),
      Id: this.formBuilder.control(null),
      CustomsValuation: this.formBuilder.array([
        this.formBuilder.group({
          ID: this.formBuilder.control(null),
          ChargesTypeCode: this.formBuilder.control({ name: 'ביטוח', code: '67' }),
          CurrencyCode: this.formBuilder.control({ name: 'USD', code: 'USD' }),
          OtherChargeDeductionAmount: this.formBuilder.control(0, Validators.min(0))
        }),
        this.formBuilder.group({
          ID: this.formBuilder.control(null),
          ChargesTypeCode: this.formBuilder.control({ name: 'הובלה', code: '144' }),
          CurrencyCode: this.formBuilder.control({ name: 'USD', code: 'USD' }),
          OtherChargeDeductionAmount: this.formBuilder.control(0, )
          // OtherChargeDeductionAmount: this.formBuilder.control(1, [Validators.required, Validators.min(1)])
        })
      ]),
      SupplierInvoiceItems: this.formBuilder.array([this.createSupplierInvoiceItem()]),
    });
  }
  
  get supplierInvoices(): FormArray {
    return this.generalDeclarationForm.get('SupplierInvoices') as FormArray;
  }

  addSupplierInvoice(): void {
    this.supplierInvoices.push(this.createSupplierInvoice());
  }

  removeSupplierInvoice(rowData: any, index: any) {
    if (rowData?.controls?.Id?.value) {
      this.confirmationService.confirm({
        message: 'האם אתה בטוח שברצונך למחוק?',
        accept: () => {
          rowData.patchValue({ Id: -rowData.controls.Id.value });
        }
      });
    }
    else {
      this.supplierInvoices.removeAt(index);
    }
    this.cd.detectChanges();
  }

  GetSupplierInvoiceItems(index: any): FormArray {
    return (this.generalDeclarationForm.get(`SupplierInvoices`) as FormArray).controls[index].get("SupplierInvoiceItems") as FormArray
  }

  addNewInvoiceItem(i: any): void {
    const invoiceItemsArray = this.GetSupplierInvoiceItems(i);
    invoiceItemsArray?.push(this.createSupplierInvoiceItem());
  }

  private createSupplierInvoiceItem(): FormGroup {
    return this.formBuilder.group({
      ClassificationID: this.formBuilder.control('', Validators.required),
      MeasureQualifier: this.formBuilder.control(null),
      CustomsValueAmount: this.formBuilder.control(null, Validators.required),
      AmountType: this.formBuilder.control('', Validators.required),
      OriginCountryCode: this.formBuilder.control(null, Validators.required)
    });
  }

  onDeleteRow(rowData: any, index: any, suplierInvoiceIndex: any): void {
    if (rowData?.controls?.Id?.value) {
      this.confirmationService.confirm({
        message: 'האם אתה בטוח שברצונך למחוק?',
        accept: () => {
          rowData.patchValue({ Id: -rowData.controls.Id.value });
        }
      });
    }
    else {
      const supplierInvoiceItems = this.GetSupplierInvoiceItems(suplierInvoiceIndex);

      supplierInvoiceItems.removeAt(index);

    }
  }

  onClassificationIDBlur(index: any, suplierInvoiceIndex: any) {
    const tableRowArray = this.GetSupplierInvoiceItems(suplierInvoiceIndex);
    // const tableRowArray = this.generalDeclarationForm.get('SupplierInvoices.SupplierInvoiceItems') as FormArray;
    const classificationID = tableRowArray.controls[index].get('ClassificationID');
    const MeasureQualifier = tableRowArray.controls[index].get('MeasureQualifier');

    if (classificationID && classificationID.value) {

      this.decService.GetClassificationID$(classificationID.value).subscribe({
        next: (responseData: any) => {
          if (responseData.customsItemField) {
            console.log(responseData);
            MeasureQualifier?.patchValue(responseData.customsItemField[0].statisticMeasurementUnitExternalIDField)
            MeasureQualifier?.setErrors(null);
          }
          // else {        
          // }
        },
        error: (err) => {
          console.error('Error fetching client data:', err);
        }
      });
    }
  }


  getValuationValue(index: any): FormArray {

    return (this.generalDeclarationForm.get(`SupplierInvoices`) as FormArray).controls[index].get("CustomsValuation") as FormArray
    // return this.generalDeclarationForm.get('SupplierInvoices.CustomsValuation') as FormArray;
  }

  convertToDecObj(dec: any) {
    dec.GovernmentProcedure = dec.GovernmentProcedure.code ? dec.GovernmentProcedure.code : dec.GovernmentProcedure
    dec.AgentFileReferenceID = localStorage.getItem('AgentFileReferenceID')
    const consignments = dec.Consignments;

    consignments.ExportationCountryCode = consignments.ExportationCountryCode.code ? consignments.ExportationCountryCode.code : consignments.ExportationCountryCode
    consignments.LoadingLocation = consignments.LoadingLocation.code ? consignments.LoadingLocation.code : consignments.LoadingLocation
    consignments.UnloadingLocationID = consignments.UnloadingLocationID.code ? consignments.UnloadingLocationID.code : consignments.UnloadingLocationID
    consignments.TransportContractDocumentTypeCode = consignments.TransportContractDocumentTypeCode.code ? consignments.TransportContractDocumentTypeCode.code : consignments.TransportContractDocumentTypeCode

    const supplierInvoices = dec.SupplierInvoices;

    supplierInvoices.forEach((invoice: any) => {
      // invoice.InvoicesAndGoods ? invoice.InvoicesAndGoods = invoice.InvoicesAndGoods?.code : '';
      invoice.InvoiceTypeCode ? invoice.InvoiceTypeCode = invoice.InvoiceTypeCode?.code : '';
      invoice.LocationID ? invoice.LocationID = invoice.LocationID?.code : '';
      invoice.SupplierID ? invoice.SupplierID = invoice.SupplierID?.code : '';
      invoice.TradeTermsConditionCode ? invoice.TradeTermsConditionCode = invoice.TradeTermsConditionCode?.code : '';
      invoice.CurrencyCode ? invoice.CurrencyCode = invoice.CurrencyCode?.code : '';

      const customValuation = invoice.CustomsValuation ? invoice.CustomsValuation : null;
      if (customValuation) {
        customValuation.forEach((element: any) => {
          element.ChargesTypeCode = element.ChargesTypeCode?.code ? element.ChargesTypeCode?.code : element.ChargesTypeCode;
          element.CurrencyCode = element.CurrencyCode?.code ? element.CurrencyCode?.code : element.CurrencyCode;
        });
      }

      const SupplierInvoiceItems = invoice.SupplierInvoiceItems;

      if (SupplierInvoiceItems) {
        SupplierInvoiceItems?.forEach((element: any) => {
          element.Id == "" ? element.Id = null : element.Id = element.Id;
          // if (element.DutyRegimeCode?.code == '')
          //   element.DutyRegimeCode = null
          // element.DutyRegimeCode = element.DutyRegimeCode?.code ? element.DutyRegimeCode?.code : element.DutyRegimeCode;
          element.OriginCountryCode = element.OriginCountryCode?.code ? element.OriginCountryCode?.code : element.OriginCountryCode;
        });
      }

      // invoice.SupplierInvoiceItems = invoice.SupplierInvoiceItems?.tableRowArray
    });

    dec.Id = localStorage.getItem('currentDecId')
    dec.RoleCode = '1'
    dec.TaxationDateTime = new Date()
    dec.CreateDateTime = new Date()

    this.perfectDecalartion = JSON.parse(JSON.stringify(dec));

    this.perfectDecalartion.Consignments = [dec.Consignments]
    this.perfectDecalartion.ConsignmentPackagesMeasures = [dec.ConsignmentPackagesMeasures]
    this.perfectDecalartion.SupplierInvoices = dec.SupplierInvoices;
    return this.perfectDecalartion;
  }

  saveDeclaration() {
    if (this.mode != 'e') {
      this.loading = true
      const dec = this.generalDeclarationForm.value;
      const perfectDec = this.convertToDecObj(dec);

      this.decService.sendDeclarationToInternal(perfectDec).subscribe((res: any) => {
        console.log(res);
        localStorage.setItem('currentDecId', res.body?.Id)
        localStorage.setItem('currentDec', res.body)
        this.stepService.emitStepCompleted('+');
      })
    }
    else {
      this.stepService.emitStepCompleted('+');
    }
  }

  sendDeclaration() {
    this.loading = true
    const id = localStorage.getItem('currentDecId')
    const dec = this.generalDeclarationForm.value;
    const perfectDec = this.convertToDecObj(dec);

    this.decService.updateAndSendDeclaration$(id, perfectDec, false).subscribe((res: any) => {
      this.loading = false
      res = JSON.parse(res)
      console.log(res);
      if (res.responseField) {
        if (res.responseField.statusField.nameCodeField.valueField == 13) {
          //תשלום קופה
        }

        this.generalDeclarationForm.get("DeclarationNumber")?.setValue(res.responseField.declarationField.idField.valueField)
        this.generalDeclarationForm.get("VersionID")?.setValue(res.responseField.declarationField.dMExtensionsField.versionIDField.valueField)

        dec.DeclarationNumber = res.responseField.declarationField.idField.valueField
        dec.VersionID = res.responseField.declarationField.dMExtensionsField.versionIDField.valueField
        dec.CustomsStatus = res.responseField.statusField.nameCodeField.valueField

        if (+dec.VersionID > 0.5) {
          this.msgs1 = [{ severity: 'error', summary: 'נשלחו 6 טיוטות שגויות', detail: '"שחרור ההצהרה עובר לתהליך של "חבר בוואטסאפ' }]
        }
        if (res.responseField.errorField) {
          this.customsErrorsContent = res.responseField.errorField
          // res.responseField.errorField[0].validationCodeField.nameField
          // res.responseField.errorField[1].validationCodeField.valueField
        }


      }
      else if (res.responseContentHeaderField) {
        this.customsError = res.responseContentHeaderField.exceptionField;
      }
    })

  }

  initElements() {
    const decId = localStorage.getItem('currentDecId');
    let currentDec: any;
    this.decService.getDeclaration(decId).subscribe(res => {
      console.log(res);
      currentDec = res[0];
      if (currentDec) {
        // --general--
        this.generalDeclarationForm.patchValue({ 'AgentFileReferenceID': currentDec?.AgentFileReferenceID })

        this.generalDeclarationForm.patchValue({
          'DeclarationNumber': currentDec?.DeclarationNumber
        })
        this.generalDeclarationForm.patchValue({
          'VersionID': currentDec?.VersionID
        })
        this.generalDeclarationForm.patchValue({
          'ImporterID': currentDec?.ImporterID
        })
        this.generalDeclarationForm.patchValue({
          'CustomsStatus': currentDec?.CustomsStatus
        })
        //this.onImporterIdBlur();
        //this.VersionID = currentDec?.VersionID

        const matchingElement1 = this.declarationCustomsProcess.find((element: any) => element.code == currentDec?.GovernmentProcedure);
        if (matchingElement1) {
          this.generalDeclarationForm.patchValue({
            'GovernmentProcedure': matchingElement1
          });
        }

        // --consignment--
        const consignmentForm = this.generalDeclarationForm.controls['Consignments']

        const currentConsignment = currentDec?.ConsignmentPackagesMeasures[0].Consignments;
        // const matchingExportationCountry = this.declarationCountryOfExport.find((element: any) => element.code == currentConsignment?.ExportationCountryCode);
        const matchingExportationCountry = this.declarationCountryOfExport.find((element: any) => element.code == currentConsignment?.ExportationCountryCode);
        this.ExportationCountrySelect = matchingExportationCountry.name
        if (matchingExportationCountry) {
          consignmentForm.patchValue({ 'ExportationCountryCode': matchingExportationCountry });
        }

        this.filterChargingCountryByExportCode();

        const matchingChargingCountry = this.declarationChargingCountry.find((element: { code: any }) => element.code == currentConsignment?.LoadingLocation);
        if (matchingChargingCountry) {
          consignmentForm.patchValue({ 'LoadingLocation': matchingChargingCountry });
        }

        const matchingUnpackingSite = this.declarationUnpackingSite.find((element: { code: any }) => element.code == currentConsignment?.UnloadingLocationID);
        if (matchingUnpackingSite) {
          consignmentForm.patchValue({ 'UnloadingLocationID': matchingUnpackingSite });
        }

        const matchingCargoIDType = this.declarationCargoIDType.find((element: { code: any }) => element.code == currentConsignment?.TransportContractDocumentTypeCode);
        if (matchingCargoIDType) {
          consignmentForm.patchValue({ 'TransportContractDocumentTypeCode': matchingCargoIDType });
        }

        consignmentForm.patchValue({
          'CargoDescription': currentConsignment?.CargoDescription,
          'TransportContractDocumentID': currentConsignment?.TransportContractDocumentID,
          'SecondCargoID': currentConsignment?.SecondCargoID,
          'ThirdCargoID': currentConsignment?.ThirdCargoID,
          'ArrivalDateTime': new Date(currentConsignment?.ArrivalDateTime)
        });

        // --ConsignmentPackagesMeasures--
        const consignmentPackagesMeasuresForm = this.generalDeclarationForm.controls['ConsignmentPackagesMeasures']

        consignmentPackagesMeasuresForm.patchValue({
          'TotalPackageQuantity': currentDec?.ConsignmentPackagesMeasures[0]?.TotalPackageQuantity,
          'GrossMassMeasure': currentDec?.ConsignmentPackagesMeasures[0]?.GrossMassMeasure,
        })

        // --SupplierInvoices--
        const supplierInvoicesFormArray = this.generalDeclarationForm.get('SupplierInvoices') as FormArray;

        supplierInvoicesFormArray.clear();

        currentDec.SupplierInvoices.forEach((invoice: any) => {
          const matchingSupplierID = this.declarationSupplierID.find((element: { code: any }) => element.code == invoice.SupplierID);
          const matchingCurrencyCode = this.declarationCurrencyCode.find((element: { code: any }) => element.code == invoice.CurrencyCode);
          const matchingLocationID = this.declarationCountryOfExport.find((element: { code: any }) => element.code == invoice.LocationID);
          const matchingTradeTermsConditionCode = this.declarationTradeTermsConditionCode.find((element: { code: any }) => element.code == invoice.TradeTermsConditionCode);

          const invoiceGroup = this.formBuilder.group({
            'SupplierID': [matchingSupplierID, Validators.required],
            'CurrencyCode': [matchingCurrencyCode, Validators.required],
            'LocationID': [matchingLocationID, Validators.required],
            'TradeTermsConditionCode': [matchingTradeTermsConditionCode, Validators.required],
            'InvoiceNumber': [invoice.InvoiceNumber, Validators.required],
            'IssueDateTime': [new Date(invoice.IssueDateTime), Validators.required],
            'InvoiceAmount': [invoice.InvoiceAmount, Validators.required],
            'Id': [invoice.Id],

            // --CustomsValuation--
            'CustomsValuation': this.formBuilder.array(invoice.CustomsValuation.map((item: any, index: any) => {
              const matchingCurrencyCode = this.declarationCurrencyCode.find((element: { code: any }) => element.code == item.CurrencyCode);
              return this.formBuilder.group({
                'ChargesTypeCode': !index ? { name: 'ביטוח', code: '67' } : { name: 'הובלה', code: '144' },
                'CurrencyCode': [matchingCurrencyCode, Validators.required],
                'OtherChargeDeductionAmount': [item.OtherChargeDeductionAmount,],
                // 'OtherChargeDeductionAmount': [item.OtherChargeDeductionAmount, [Validators.required, index ? Validators.min(1) : Validators.min(0)]],
                'ID': [item.ID],
              });
            })),

            // --SupplierInvoiceItems--

            'SupplierInvoiceItems': this.formBuilder.array(invoice.SupplierInvoiceItems.map((item: any) => {
              const matchingOriginCountryCode = this.declarationCountryOfExport.find((element: { code: any }) => element.code == item.OriginCountryCode);
              return this.formBuilder.group({
                'Id': [item.Id, Validators.required],
                'ClassificationID': [item.ClassificationID, Validators.required],
                'CustomsValueAmount': [item.CustomsValueAmount, Validators.required],
                'AmountType': [item.AmountType, Validators.required],
                'OriginCountryCode': [matchingOriginCountryCode, Validators.required]
              });
            }))
          });

          supplierInvoicesFormArray.push(invoiceGroup);
        });
      }
    });
  }

  checkVersion(): boolean {
    const version = +this.generalDeclarationForm.controls['VersionID'].value
    return version > 0.5
  }

  onCargoIDBlur(cargoIdNum: any) {
    if (cargoIdNum == 2) {
      const consignment = this.generalDeclarationForm.controls["Consignments"] as FormGroup
      let secondCargoID = consignment.controls['SecondCargoID'].value;
      secondCargoID = secondCargoID.trim();
      if (/^\d{11}$/.test(secondCargoID)) {
        secondCargoID = `${secondCargoID.substring(0, 3)}-${secondCargoID.substring(3)}`;
        consignment.controls['SecondCargoID'].setValue(secondCargoID);
        this.secondCargoIDError = '';
      }
      else if (/^\d{11,12}$/.test(secondCargoID.replace('-', ''))) {
        secondCargoID = secondCargoID.replace('-', '');
        secondCargoID = `${secondCargoID.substring(0, 3)}-${secondCargoID.substring(3)}`;
        consignment.controls['SecondCargoID'].setValue(secondCargoID);
        this.secondCargoIDError = '';
      }
      else {
        this.secondCargoIDError = 'מבנה לא תקין';
      }
    }
    const consignment = this.generalDeclarationForm.controls["Consignments"] as FormGroup
    const cargoType = consignment.controls['TransportContractDocumentTypeCode'].value?.code
    const firstCargoID = consignment.controls['TransportContractDocumentID'].value
    const secondCargoID = consignment.controls['SecondCargoID'].value
    const thirdCargoID = consignment.controls['ThirdCargoID'].value

    if (cargoType && firstCargoID && secondCargoID) {
      const params = { cargoType, firstCargoID, secondCargoID, thirdCargoID }
      this.decService.getCagroQueryMessage$(params).subscribe((res: any) => {
        console.log(res);
        if (res.cargoField) {
          const totalNumberOfPackeges = res.cargoField.totalNumberOfPackegesField
          const totalWeight = res.cargoField.totalWeightField;
          const typeCode = res.cargoItemField[0].packingTypeField
          const unloadingLocation = {
            code: res.cargoField.cargoAdditionalDataField[0].unloadingLocationIDField,
            name: res.cargoField.cargoAdditionalDataField[0].unloadingLocationNameField
          }

          this.decService.updatePackageData({
            totalNumberOfPackeges,
            totalWeight,
            typeCode,
            unloadingLocation
          });
        }
      })

    }
  }


  onExportationCountrySelect(event: any) {
    this.ExportationCountrySelect = event?.value.name;
    this.loadingChargingCountry$.subscribe(loading => {
      if (!loading) {
        this.filterChargingCountryByExportCode();
      }
    });
    this.generalDeclarationForm.get("Consignments.LoadingLocation")?.setValue('');
  }

  onTradeTermsSelect(event: any, i: any) {
    const code = event?.value.code;
    if (code) {
      const codes = ['FCA', 'FOB', 'EXW', 'FAS'];

      if (codes.includes(code)) {
        this.showCustomsValuation[i] = true;
        this.updateValuationValidators(i);
      } else {
        this.showCustomsValuation[i] = false
      }    
    }
  }

  updateValuationValidators(i: number) {
    const supplierInvoice = this.generalDeclarationForm.get('SupplierInvoices') as FormArray
    const customsValuation = supplierInvoice.at(i).get('CustomsValuation') as FormArray;
    const control = customsValuation.controls[1];
  
    const chargesTypeControl = control.get('ChargesTypeCode');
    const otherChargeControl = control.get('OtherChargeDeductionAmount');
  
    if (this.showCustomsValuation[i]) {
      if (chargesTypeControl?.value.name === 'הובלה') {
        otherChargeControl?.setValidators([Validators.required, Validators.min(1)]);
      } 
    }  
    otherChargeControl?.updateValueAndValidity();
  }
  

  filterChargingCountryByExportCode() {
    const exportCountryCode = this.generalDeclarationForm.get("Consignments")?.get("ExportationCountryCode")?.value.code;
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
    let query = event.query.toLowerCase();
    for (let i = 0; i < this.declarationCountryOfExport.length; i++) {
      let a = this.declarationCountryOfExport[i];
      if (a.fullName.indexOf(query) != -1 && a.code) {
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
    const preferredValues1 = ['ILSWS', 'ILMMN'];
    let preferred: any[] = [];
    let others: any[] = [];
    //let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.declarationUnpackingSite.length; i++) {
      let a = this.declarationUnpackingSite[i];
      // if (a.name.indexOf(query) != -1) {
      //   filtered.push(a);
      // }

      if (preferredValues1.includes(a.code) && a.name.indexOf(query) != -1) {
        preferred.push(a)
      }
      else if (a.name.indexOf(query) != -1) {
        others.push(a);

      }
    }
    // this.filteredUnpackingSite = filtered;
    this.filteredUnpackingSite = [...preferred, ...others];
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

  customStatusName() {
    if (this.customStatus && this.customsStatuses?.length) {
      for (let i = 0; i < this.customsStatuses.length; i++) {
        let a = this.customsStatuses[i];
        if (a.code == this.customStatus) {
          return a.name
        }
      }
    }
    else return "לא תקין"
  }
}
