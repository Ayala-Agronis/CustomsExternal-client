import { CommonModule, FormatWidth, JsonPipe } from '@angular/common';
import { ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
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
import { ActivatedRoute, Route, Router } from '@angular/router';
import { ConfirmationService, Message, MessageService } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TooltipModule } from 'primeng/tooltip';
import { PaymentService } from '../../shared/services/payment.service';
import { take } from 'rxjs/operators';

@Component({
  selector: 'app-declaration-form-Ts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TabViewModule, TooltipModule, CardModule, ProgressSpinnerModule, MessagesModule, ButtonModule, InputTextModule, CalendarModule, InputTextareaModule, AutoCompleteModule, TableModule, ConfirmDialogModule],
  templateUrl: './declaration-form-Ts.component.html',
  styleUrl: './declaration-form-Ts.component.scss',
  providers: [ConfirmationService, MessageService],
})
export class DeclarationFormTsComponent implements OnInit {


  generalDeclarationForm!: FormGroup
  filteredCustomsProcess: any[] = [];
  filteredCountryOfExport: any[] = [];
  filteredChargingCountry: any[] = [];
  filteredUnpackingSite: any[] = [];
  currentFilteredChargingCountry: any[] = [];
  filteredCargoIDType: any[] = [];
  filteredCurrencyCode: any[] = [];
  filteredTradeTermsConditionCode: any[] = [];
  filteredInvoiceTypeCode: any[] = [];
  filteredSupplierID: any[] = [];
  filteredFacilityType: any[] = [];
  activeTabIndex: number = 0; // 0 = יצוא, 1 = יבוא

  importConsignmentData: any = null;
  exportConsignmentData: any = null;

  filteredChargingCountryImport: any[] = [];
  filteredChargingCountryExport: any[] = [];
  currentFilteredChargingCountryImport: any[] = [];
  currentFilteredChargingCountryExport: any[] = [];
  isExportCountrySelected: boolean = false;
  isImportCountrySelected: boolean = false;
  exportationCountryControlErrorImport: boolean = false;
  exportationCountryControlErrorExport: boolean = false;



  declarationCountryOfExport: any;
  declarationCustomsProcess: any;
  declarationChargingCountry: any;
  declarationCargoIDType: any;
  declarationCurrencyCode: any;
  declarationTradeTermsConditionCode: any;
  declarationSupplierID: any;
  declarationInvoiceTypeCode: any
  declarationFacilityID: any;

  ExportationCountrySelect: any;

  columns: any;

  private loadingChargingCountrySubject = new BehaviorSubject<boolean>(true);
  loadingChargingCountry$ = this.loadingChargingCountrySubject.asObservable();

  isCustomsChargingCountry: boolean = false;
  declarationUnpackingSite: any;
  exportationCountryControlError: any = true;
  perfectDecalartion: any;
  mode: any;
  declarationType: string = 'import';
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
  fieldLabels: any = {
    // משגור יבוא
    ImporterID: 'מזהה יבואן',
    CustomsProcess: 'תהליך מכס',
    TransportContractDocumentID: 'שנה (משגור יבוא)',
    SecondCargoID: 'מזהה מטען ראשי (משגור יבוא)',
    ThirdCargoID: 'מזהה מטען פנימי (משגור יבוא)',
    ExportationCountryCode: 'ארץ יצוא (משגור יבוא)',
    LoadingLocation: 'אתר טעינה (משגור יבוא)',
    UnloadingLocationID: 'אתר פריקה (משגור יבוא)',
    ArrivalDateTime: 'תאריך הגעת טובין (משגור יבוא)',
    TransportContractDocumentTypeCode: 'סוג מזהה מטען (משגור יבוא)',
    CargoDescription: 'תיאור טובין (משגור יבוא)',
    FacilityType: 'אתר מסירה (משגור יבוא)',

    // משגור יצוא
    ExportationCountryCode2: 'ארץ יצוא (משגור יצוא)',
    LoadingLocation2: 'אתר טעינה (משגור יצוא)',
    UnloadingLocationID2: 'אתר פריקה (משגור יצוא)',
    ArrivalDateTime2: 'תאריך הגעת טובין (משגור יצוא)',
    TransportContractDocumentID2: 'שנה (משגור יצוא)',
    TransportContractDocumentTypeCode2: 'סוג מזהה מטען (משגור יצוא)',
    SecondCargoID2: 'מזהה מטען ראשי (משגור יצוא)',
    ThirdCargoID2: 'מזהה מטען פנימי (משגור יצוא)',
    CargoDescription2: 'תיאור טובין (משגור יצוא)',
    FacilityType2: 'אתר מסירה (משגור יצוא)',

    // אחרים
    TotalPackageQuantity: 'כמות',
    GrossMassMeasure: 'משקל',
    InvoiceNumber: 'מספר חשבונית ספק',
    SupplierID: 'שם ספק',
    CurrencyCode: 'מטבע חשבון',
    IssueDateTime: 'תאריך חשבון מכר',
    LocationID: 'ארץ יצוא',
    TradeTermsConditionCode: 'תנאי מכר',
    InvoiceTypeCode: 'סוג חשבון',
    InvoiceAmount: 'סה"כ חשבון',
    ChargesTypeCode: 'סוג חיוב',
    CurrencyCodeValuation: 'מטבע חיוב',
    OtherChargeDeductionAmount: 'סה"כ (הובלה)',
    ClassificationID: 'מזהה סיווג',
    AmountType: 'כמות',
    CustomsValueAmount: 'ערך טובין',
    OriginCountryCode: 'ארץ מקור'
  };

  suplierErrorExist: boolean = false;
  suplierError: string = '';

  constructor(private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, private cd: ChangeDetectorRef, private confirmationService: ConfirmationService, private customsDataService: CustomsDataService, private decService: DeclarationService, private stepService: StepService, private paymentService: PaymentService) { }


  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.mode = params['Mode'];
      this.declarationType = params['type'] || 'import';
      if (this.mode !== 'e') {
        this.initForm()
        this.customsError = ''
        this.customsErrorsContent = ''
        const decId = localStorage.getItem('currentDecId');
        this.paymentService.isDecPaid(decId).subscribe(res => {
          console.log(res)
          if (!decId) this.showBtnCustoms = false
          if (res?.isPaid) {
            this.showBtnCustoms = true
          }
          else
            this.showBtnCustoms = false
        })
        this.customsDataService.GetSeq$('Customs').pipe(
          tap(res => { localStorage.setItem('AgentFileReferenceID', res) })).subscribe()
      }

      if (params['customsSend'] === "true") {
        this.msgs1 = [{ severity: 'success', summary: 'תשלום עמלה בוצע בהצלחה ', detail: "ניתן לשלוח טיוטה למכס" }]
      }
      // if (params['fromDocs'] === "true") {
      //   this.msgs1 = [{ severity: 'error', summary: '  טיוטה שגויה', detail: "יש להגיע לטיוטה תקינה קודם תשלום עמלה" }]
      // }
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
      this.customsDataService.getCustomsTableValues$('1404').pipe(
        map(res => this.declarationInvoiceTypeCode = res.map((item: { Value2: any; Value1: any; }) => ({ name: item.Value2, code: item.Value1 })))
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
        localStorage.setItem("maxIndex", "2");
        this.customStatus = localStorage.getItem('CustomsStatus');
        this.initElements();
        //check if declaration is paid
        const decId = localStorage.getItem('currentDecId');
        this.paymentService.isDecPaid(decId).subscribe(res => {
          console.log(res)
          if (res?.isPaid) {
            this.showBtnCustoms = true
          }
        })
      }
    }
    );

    const exportationCountryControlImport = this.generalDeclarationForm.get('Consignments.ExportationCountryCode');
    const exportationCountryControlExport = this.generalDeclarationForm.get('Consignments.ExportationCountryCode2');

    // הפעלה ראשונית
    this.exportationCountryControlErrorImport = !exportationCountryControlImport?.value?.code;
    this.setChargingCountryControlStatus('import');

    this.exportationCountryControlErrorExport = !exportationCountryControlExport?.value?.code;
    this.setChargingCountryControlStatus('export');

    // מעקב אחרי שינויי ערך ביבוא
    exportationCountryControlImport?.valueChanges.subscribe(value => {
      this.exportationCountryControlErrorImport = !value || !value.code;
      this.setChargingCountryControlStatus('import');
    });

    // מעקב אחרי שינויי ערך ביצוא
    exportationCountryControlExport?.valueChanges.subscribe(value => {
      this.exportationCountryControlErrorExport = !value || !value.code;
      this.setChargingCountryControlStatus('export');
    });

    // גם טעינת נתונים משפיעה על זמינות השדות
    this.loadingChargingCountry$.subscribe(() => {
      this.setChargingCountryControlStatus('import');
      this.setChargingCountryControlStatus('export');
    });


    this.columns = ["מוצר מיובא ", "כמות", "ערך טובין", "ארץ מקור"];

    if (this.mode != 'e') {
      this.customsError = ''
      this.customsErrorsContent = ''
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
      (item: { Value2: any; Value1: any }) => ({ fullName: item.Value2, name: `${item.Value2.substring(0, 23)} (${item.Value1})`, code: item.Value1 })
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
      (item: { Value2: any; Value1: any; Value7: any }) => ({ name: `${item.Value2.substring(0, 12)} (${item.Value1})`, code: item.Value1, siteType: item.Value7 })
    ).pipe(
      map(res => this.declarationUnpackingSite = res)
    );

    const customsFacilityID$ = getCustomsData(
      'customsFacilityID',
      '2012',
      (item: { Value2: any; Value1: any; Value7: any }) => ({ name: `${item.Value2.substring(0, 7)} (${item.Value1})`, code: item.Value1, siteType: item.Value7 })
    ).pipe(
      map(res => this.declarationFacilityID = res)
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
      customsFacilityID$
    ]).subscribe(() => {
      this.loading = false
      const exportationCountryControl = this.generalDeclarationForm.controls["Consignments"].get('ExportationCountryCode');
      exportationCountryControl?.valueChanges.subscribe(value => {
        this.exportationCountryControlError = this.getExportationCountryControlError(exportationCountryControl);
        this.setChargingCountryControlStatus('import');
      });

      // טפל ביצוא (אם את משתמשת בזה)
      const exportationCountryControl2 = this.generalDeclarationForm.controls["Consignments"].get('ExportationCountryCode2');
      exportationCountryControl2?.valueChanges.subscribe(value => {
        this.exportationCountryControlError = this.getExportationCountryControlError(exportationCountryControl2);
        this.setChargingCountryControlStatus('export');
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

  setChargingCountryControlStatus(mode: 'import' | 'export') {
    if (mode === 'import') {
      const chargingCountryControl = this.generalDeclarationForm.get('Consignments.LoadingLocation');
      if (this.exportationCountryControlErrorImport || this.loadingChargingCountrySubject.value) {
        chargingCountryControl?.disable();
      } else {
        chargingCountryControl?.enable();
      }
    } else {
      const chargingCountryControl2 = this.generalDeclarationForm.get('Consignments.LoadingLocation2');
      if (this.exportationCountryControlErrorExport || this.loadingChargingCountrySubject.value) {
        chargingCountryControl2?.disable();
      } else {
        chargingCountryControl2?.enable();
      }
    }
  }



  initForm() {
    this.generalDeclarationForm = this.formBuilder.group({
      CustomsStatus: this.formBuilder.control(''),
      AgentFileReferenceID: this.formBuilder.control(''),
      DeclarationNumber: this.formBuilder.control(''),
      VersionID: this.formBuilder.control(''),
      // DeclarationOfficeID: this.formBuilder.control({ name: 'בית מכס נתב"ג', code: '4' }, Validators.required),
      DeclarationOfficeID: this.formBuilder.control('4'),

      //TypeCode: this.formBuilder.control({ name: 'הצהרת יבוא ', code: '1' }),
      TypeCode: this.formBuilder.control('1'),
      //AutonomyRegionType: this.formBuilder.control({ name: '', code: '' }),
      //EntitlementTypeCode: this.formBuilder.control({ name: '', code: '' }),

      //AcceptanceDateTime: this.formBuilder.control(''),
      Consignments: this.formBuilder.group({
        ImporterID: this.formBuilder.control(localStorage.getItem('userId') || '2', Validators.required),
        GovernmentProcedure: this.formBuilder.control({ name: 'יבוא מסחרי', code: '4000001' }),

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
        FacilityType: this.formBuilder.control({ name: '', code: '' }, Validators.required),
        Quantity: this.formBuilder.control(''),
        UnitType: this.formBuilder.control(''),
        MarksAndNumbers: this.formBuilder.control(''),
        IsHazardous: this.formBuilder.control(''),


        ExportationCountryCode2: this.formBuilder.control('', Validators.required),
        LoadingLocation2: this.formBuilder.control('', Validators.required),
        // LoadingLocation: this.formBuilder.control({value: '', disabled: this.exportationCountryControlError}, Validators.required),
        UnloadingLocationID2: this.formBuilder.control('', Validators.required),
        TransportContractDocumentTypeCode2: this.formBuilder.control({ name: 'שטר מטען אווירי  ', code: '1' }, Validators.required),
        ArrivalDateTime2: this.formBuilder.control(new Date(), Validators.required),
        TransportContractDocumentID2: this.formBuilder.control(new Date().getFullYear().toString(), Validators.required),
        SecondCargoID2: this.formBuilder.control('', Validators.required),
        ThirdCargoID2: this.formBuilder.control('',),
        CargoDescription2: this.formBuilder.control('', Validators.required),
        //FacilityID: this.formBuilder.control({ name: '', code: '' }),
        FacilityType2: this.formBuilder.control({ name: '', code: '' }, Validators.required),
        Quantity2: this.formBuilder.control(''),
        UnitType2: this.formBuilder.control(''),
        MarksAndNumbers2: this.formBuilder.control(''),
        IsHazardous2: this.formBuilder.control('')
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

      SupplierInvoices: this.formBuilder.array([this.createSupplierInvoice()],
        { validators: this.invoiceAmountValidator })
    });

  }
  onTabChange(index: number) {
    const formGroup = this.generalDeclarationForm.get('Consignments') as FormGroup;

    // שלב 1 – שמירת ערכים מהטאב הנוכחי
    const currentData = formGroup.getRawValue(); // כולל disabled אם צריך

    if (this.activeTabIndex === 0) {
      this.importConsignmentData = { ...currentData }; // שמירה ליבוא
    } else if (this.activeTabIndex === 1) {
      this.exportConsignmentData = { ...currentData }; // שמירה ליצוא
    }

    this.activeTabIndex = index;

    // שלב 2 – טעינת ערכים לטאב הבא (בלי למחוק ערכים דיפולטיים)
    const newData =
      index === 0 ? this.importConsignmentData : this.exportConsignmentData;

    if (newData) {
      // רק משחזרים שדות שקיימים בשמירה (ולא מאפסים אחרים)
      Object.keys(newData).forEach((key) => {
        if (formGroup.contains(key)) {
          formGroup.get(key)?.patchValue(newData[key], { emitEvent: false });
        }
      });
    }
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
          OtherChargeDeductionAmount: this.formBuilder.control(0,)
          // OtherChargeDeductionAmount: this.formBuilder.control(1, [Validators.required, Validators.min(1)])
        })
      ]),
      SupplierInvoiceItems: this.formBuilder.array([this.createSupplierInvoiceItem()]),
      //   SupplierInvoiceItems: this.formBuilder.array([this.createSupplierInvoiceItem()]),
      // }, { validators: this.invoiceAmountValidator 
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

  invoiceAmountValidator(control: AbstractControl): any {
    const invoiceFormGroup = control as FormGroup;
    const supplierInvoiceItems = invoiceFormGroup.get('SupplierInvoiceItems')?.value || [];

    const totalCustomsValueAmount = supplierInvoiceItems.reduce((sum: any, item: any) => {
      return sum + (item.CustomsValueAmount || 0);
    }, 0);

    const invoiceAmount = invoiceFormGroup.get('InvoiceAmount')?.value;
    if (invoiceAmount) {
      console.log(invoiceAmount);

    } if (totalCustomsValueAmount) console.log(totalCustomsValueAmount);

    if (invoiceAmount && invoiceAmount !== totalCustomsValueAmount) {
      debugger
      // return true;
      console.log('סה"כ ערכי טובין לא שווה לסה"כ חשבון');
      invoiceFormGroup.setErrors({ 'invoiceAmountMismatch': true });

      return { 'invoiceAmountMismatch': 'סה"כ ערכי טובין לא שווה לסה"כ חשבון' };

    }

    return null;
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
    console.log('📦 Received dec object:', dec);
    dec.AgentFileReferenceID = localStorage.getItem('AgentFileReferenceID');

    const cons = dec.Consignments;
    cons.GovernmentProcedure = cons.GovernmentProcedure?.code ?? cons.GovernmentProcedure;

    // מזהים ייחודיים למשגורים
    const importId = crypto.randomUUID();
    const exportId = crypto.randomUUID();

    // בסיס החבילה
    const baseMeasure = dec.ConsignmentPackagesMeasures ?? {};

    const processFacilities = (facility: any, consignmentId: string, sequence: number) => {
      return facility?.code
        ? [{
          Id: null,
          FacilityID: facility.code,
          FacilityType: "004",
          FacilitySequenceNumeric: sequence,
          ConsignmentId: consignmentId
        }]
        : [];
    };

    // משגור יבוא
    const consignmentImport = {
      Id: importId,
      ImportExportConsigment: 'I',
      ExportationCountryCode: cons.ExportationCountryCode?.code ?? cons.ExportationCountryCode,
      LoadingLocation: cons.LoadingLocation?.code ?? cons.LoadingLocation,
      UnloadingLocationID: cons.UnloadingLocationID?.code ?? cons.UnloadingLocationID,
      TransportContractDocumentTypeCode: cons.TransportContractDocumentTypeCode?.code ?? cons.TransportContractDocumentTypeCode,
      ArrivalDateTime: cons.ArrivalDateTime,
      TransportContractDocumentID: cons.TransportContractDocumentID,
      SecondCargoID: cons.SecondCargoID,
      ThirdCargoID: cons.ThirdCargoID,
      CargoDescription: cons.CargoDescription,
      ConsignmentRegisteredFacilities: processFacilities(cons.FacilityType, importId, 1),
      ConsignmentPackagesMeasures: [{
        Id: null,
        ConsignmentId: importId,
        PackageMeasureQualifier: baseMeasure.PackageMeasureQualifier?.code ?? baseMeasure.PackageMeasureQualifier,
        TypeCode: baseMeasure.TypeCode?.code ?? baseMeasure.TypeCode,
        ...baseMeasure
      }]
    };

    // משגור יצוא
    const consignmentExport = {
      Id: exportId,
      ImportExportConsigment: 'E',
      ExportationCountryCode: cons.ExportationCountryCode2?.code ?? cons.ExportationCountryCode2,
      LoadingLocation: cons.LoadingLocation2?.code ?? cons.LoadingLocation2,
      UnloadingLocationID: cons.UnloadingLocationID2?.code ?? cons.UnloadingLocationID2,
      TransportContractDocumentTypeCode: cons.TransportContractDocumentTypeCode2?.code ?? cons.TransportContractDocumentTypeCode2,
      ArrivalDateTime: cons.ArrivalDateTime2,
      TransportContractDocumentID: cons.TransportContractDocumentID2,
      SecondCargoID: cons.SecondCargoID2,
      ThirdCargoID: cons.ThirdCargoID2,
      CargoDescription: cons.CargoDescription2,
      ConsignmentRegisteredFacilities: processFacilities(cons.FacilityType2, exportId, 2),
      ConsignmentPackagesMeasures: [{
        Id: null,
        ConsignmentId: exportId,
        PackageMeasureQualifier: baseMeasure.PackageMeasureQualifier?.code ?? baseMeasure.PackageMeasureQualifier,
        TypeCode: baseMeasure.TypeCode?.code ?? baseMeasure.TypeCode,
        ...JSON.parse(JSON.stringify(baseMeasure))
      }]
    };

    // חשבוניות
    const supplierInvoices = dec.SupplierInvoices ?? [];
    supplierInvoices.forEach((invoice: any) => {
      invoice.InvoiceTypeCode = invoice.InvoiceTypeCode?.code ?? invoice.InvoiceTypeCode;
      invoice.LocationID = invoice.LocationID?.code ?? invoice.LocationID;
      invoice.SupplierID = invoice.SupplierID?.code ?? invoice.SupplierID;
      invoice.TradeTermsConditionCode = invoice.TradeTermsConditionCode?.code ?? invoice.TradeTermsConditionCode;
      invoice.CurrencyCode = invoice.CurrencyCode?.code ?? invoice.CurrencyCode;

      invoice.CustomsValuation?.forEach((val: any) => {
        val.ChargesTypeCode = val.ChargesTypeCode?.code ?? val.ChargesTypeCode;
        val.CurrencyCode = val.CurrencyCode?.code ?? val.CurrencyCode;
      });

      invoice.SupplierInvoiceItems?.forEach((item: any) => {
        item.Id = item.Id || null;
        item.OriginCountryCode = item.OriginCountryCode?.code ?? item.OriginCountryCode;
      });
    });

    // פרטי דקלרציה כלליים
    dec.Id = localStorage.getItem('currentDecId');
    dec.RoleCode = '1';
    dec.TaxationDateTime = new Date();
    dec.CreateDateTime = new Date();

    // אובייקט סופי
    this.perfectDecalartion = {
      ...JSON.parse(JSON.stringify(dec)),
      Consignments: [consignmentImport, consignmentExport],
      SupplierInvoices: supplierInvoices
    };

    console.log('🚀 perfectDec:', this.perfectDecalartion);
    return this.perfectDecalartion;
  }

  saveDeclaration() {
    if (this.generalDeclarationForm.invalid) {
      const invoiceAmountError = this.generalDeclarationForm.get('SupplierInvoices')?.errors?.['invoiceAmountMismatch'];
      if (invoiceAmountError) {
        console.log('הסכום הכולל לא תואם לערך ב-"InvoiceAmount"');
      }
    }

    this.loading = true
    const dec = this.generalDeclarationForm.value;
    const perfectDec = this.convertToDecObj(dec);

    if (this.mode != 'e') {
      this.decService.sendDeclarationToInternal(perfectDec).subscribe((res: any) => {
        console.log(res);
        localStorage.setItem('currentDecId', res.body?.Id)
        localStorage.setItem('currentDec', res.body)
        this.stepService.emitStepCompleted('+');
      })
    }
    else {

      this.decService.updateDeclaration$(perfectDec.Id, perfectDec).subscribe((res: any) => {
        console.log(res);
        this.stepService.emitStepCompleted('+');
      });
    }
  }

  sendDeclaration() {
    this.loading = true
    const id = localStorage.getItem('currentDecId')
    const dec = this.generalDeclarationForm.value;
    const perfectDec = this.convertToDecObj(dec);
    console.log(perfectDec);

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
        this.customStatus = dec.CustomsStatus;
        localStorage.setItem('decVersion', dec.VersionID);
        localStorage.setItem('CustomsStatus', dec.CustomsStatus);

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

        localStorage.setItem('AgentFileReferenceID', currentDec?.AgentFileReferenceID)

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

        const mode = this.activeTabIndex === 0 ? 'import' : 'export';
        this.filterChargingCountryByExportCode(mode);

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

        const item = currentConsignment.ConsignmentRegisteredFacilities[0]?.FacilityType == "004" ? currentConsignment.ConsignmentRegisteredFacilities[0] : currentConsignment.ConsignmentRegisteredFacilities[1]
        const matchingFacilityID = this.declarationFacilityID.find((element: { code: any }) => element.code == item?.FacilityID);
        if (matchingFacilityID) {
          consignmentForm.patchValue({ 'FacilityType': matchingFacilityID });
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

        currentDec.SupplierInvoices.forEach((invoice: any, i: number) => {
          const matchingSupplierID = this.declarationSupplierID.find((element: { code: any }) => element.code == invoice.SupplierID);
          const matchingCurrencyCode = this.declarationCurrencyCode.find((element: { code: any }) => element.code == invoice.CurrencyCode);
          const matchingLocationID = this.declarationCountryOfExport.find((element: { code: any }) => element.code == invoice.LocationID);
          const matchingInvoiceTypeCode = this.declarationInvoiceTypeCode.find((element: { code: any }) => element.code == invoice.InvoiceTypeCode);
          const matchingTradeTermsConditionCode = this.declarationTradeTermsConditionCode.find((element: { code: any }) => element.code == invoice.TradeTermsConditionCode);

          const invoiceGroup = this.formBuilder.group({
            'SupplierID': [matchingSupplierID, Validators.required],
            'CurrencyCode': [matchingCurrencyCode, Validators.required],
            'LocationID': [matchingLocationID, Validators.required],
            'TradeTermsConditionCode': [matchingTradeTermsConditionCode, Validators.required],
            'InvoiceNumber': [invoice.InvoiceNumber, Validators.required],
            'IssueDateTime': [new Date(invoice.IssueDateTime), Validators.required],
            'InvoiceAmount': [invoice.InvoiceAmount, Validators.required],
            'InvoiceTypeCode': [matchingInvoiceTypeCode, Validators.required],
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
                'OriginCountryCode': [matchingOriginCountryCode, Validators.required],
                'MeasureQualifier': [item.MeasureQualifier]
              });
            }))
          });

          supplierInvoicesFormArray.push(invoiceGroup);
          const code = matchingTradeTermsConditionCode?.code;
          if (code) {
            const codes = ['FCA', 'FOB', 'EXW', 'FAS'];
            this.showCustomsValuation[i] = codes.includes(code);
            if (codes.includes(code))
              this.updateValuationValidators(i);
          }
        });
      }
    });
  }

  getFormErrors(checkInvoice: boolean) {
    let errors: string[] = [];

    if (checkInvoice) {
      const checkSupplierInvoiceConsistency = (invoice: FormGroup, parentKey: string) => {
        const invoiceAmount = invoice.get('InvoiceAmount')?.value;
        const supplierInvoiceItems = invoice.get('SupplierInvoiceItems') as FormArray;

        let customsValueAmountSum = 0;

        supplierInvoiceItems.controls.forEach((item: any) => {
          customsValueAmountSum += +item.get('CustomsValueAmount')?.value || 0;
        });

        if (customsValueAmountSum !== +invoiceAmount) {
          this.suplierErrorExist = true;
          this.suplierError = ` ${parentKey} - סה"כ ערכי טובין לא שווה לסה"כ חשבון`;
        }
        else {
          this.suplierErrorExist = false;
          this.suplierError = '';
        }
      };


      const supplierInvoices = this.generalDeclarationForm.get('SupplierInvoices') as FormArray;
      supplierInvoices.controls.forEach((invoice: any, index: number) => {
        checkSupplierInvoiceConsistency(invoice, `חשבונית ${index + 1}`);
      });
    }

    if ((!this.generalDeclarationForm || !this.generalDeclarationForm.controls) && !checkInvoice) {
      return '';
    }

    const checkErrors = (formGroup: any, parentKey: string = '') => {
      if (this.suplierErrorExist) {
        errors = [this.suplierError];
      }
      if (formGroup instanceof FormGroup) {
        Object.keys(formGroup.controls).forEach(key => {
          const control = formGroup.controls[key];
          const fieldPath = parentKey ? `${parentKey}.${key}` : key;
          const fieldName = key.split('.').pop() || key;

          const fieldLabel = this.fieldLabels[fieldName] || fieldName;

          if (control instanceof FormGroup || control instanceof FormArray) {
            checkErrors(control, fieldPath);
          } else if (control.errors !== null) {
            Object.keys(control.errors).forEach(errorKey => {

              switch (errorKey) {
                case 'required':
                  errors.push(`${fieldLabel}: שדה חובה`);
                  break;
                case 'min':
                  const minValue = control.errors?.['min'];
                  errors.push(`${fieldLabel}: חייב להכיל לפחות ${minValue.min}`);
                  break;
                case 'minlength':
                  errors.push(`${fieldLabel}: חייב להכיל לפחות ${control.errors ? control.errors['minlength'].requiredLength : null} תווים`);
                  break;
                // case 'maxlength':
                //     errors.push(`${fieldLabel}: לא יכול להכיל יותר מ-${control.errors['maxlength'].requiredLength} תווים`);
                //     break;
                case 'email':
                  errors.push(`${fieldLabel}: כתובת אימייל לא תקינה`);
                  break;
                default:
                  errors.push(`${fieldLabel}: שגיאה כללית`);
              }
            });
          }
        });
      } else if (formGroup instanceof FormArray) {
        formGroup.controls.forEach((control, index) => {
          checkErrors(control, `${parentKey}[${index}]`);
        });
      }
    };

    checkErrors(this.generalDeclarationForm);

    return errors.length > 0 ? errors.join('\n') : 'הטופס תקין';

  }

  checkVersion(): boolean {
    const version = +this.generalDeclarationForm.controls['VersionID'].value

    return version > 0.5
  }

  //get values by cargo Ids
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

  serchVendor() {
    this.router.navigateByUrl('/search-vendor');
  }

  onExportationCountrySelect(event: any) {
    const mode = this.activeTabIndex === 0 ? 'import' : 'export';
    const selected = !!event?.value;

    if (mode === 'import') {
      this.isImportCountrySelected = selected;
      this.generalDeclarationForm.get("Consignments.LoadingLocation")?.reset();
    } else {
      this.isExportCountrySelected = selected;
      this.generalDeclarationForm.get("Consignments.LoadingLocation2")?.reset();
    }

    this.loadingChargingCountry$.pipe(take(1)).subscribe(loading => {
      if (!loading) {
        this.filterChargingCountryByExportCode(mode);
      }
    });
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
        this.updateValuationValidators(i)
      }
    }
  }

  updateValuationValidators(i: number) {
    const supplierInvoice = this.generalDeclarationForm.get('SupplierInvoices') as FormArray
    const customsValuation = supplierInvoice.at(i).get('CustomsValuation') as FormArray;
    const control = customsValuation.controls[1];
    if (control) {
      const chargesTypeControl = control.get('ChargesTypeCode');
      const otherChargeControl = control.get('OtherChargeDeductionAmount');

      if (this.showCustomsValuation[i]) {
        if (chargesTypeControl?.value.name === 'הובלה' && this.showCustomsValuation[i]) {
          otherChargeControl?.setValidators([Validators.required, Validators.min(1)]);
          otherChargeControl?.setValue(1)
        }
        else {
          otherChargeControl?.clearValidators();
          otherChargeControl?.setErrors(null);
          otherChargeControl?.setValue(0)
        }
      } else {
        otherChargeControl?.clearValidators();
        otherChargeControl?.setErrors(null);
        otherChargeControl?.setValue(0)
      }
      otherChargeControl?.updateValueAndValidity();
    }
  }


  filterChargingCountryByExportCode(mode: 'import' | 'export') {
    const path = mode === 'import' ? 'ExportationCountryCode' : 'ExportationCountryCode2';
    const exportCountryCode = this.generalDeclarationForm.get("Consignments")?.get(path)?.value?.code;

    const filtered = this.declarationChargingCountry.filter((site: any) =>
      site.code?.startsWith(exportCountryCode)
    );

    if (mode === 'import') {
      this.filteredChargingCountryImport = filtered;
      this.currentFilteredChargingCountryImport = [...filtered];
    } else {
      this.filteredChargingCountryExport = filtered;
      this.currentFilteredChargingCountryExport = [...filtered];
    }
  }


  filterCustomsProcess(event: any) {
    let filtered: any[] = [];
    let query = event.query;

    const allowedOptions = [
      'יבוא אישי',
      'יבוא מסחרי',
      'שטעון מסחרי - שטעון באותו נמל'
    ];

    for (let i = 0; i < this.declarationCustomsProcess.length; i++) {
      let a = this.declarationCustomsProcess[i];

      // בודק גם שהשם קיים ברשימה וגם תואם לחיפוש
      if (
        allowedOptions.includes(a.name) &&
        a.name.toLowerCase().includes(query.toLowerCase())
      ) {
        filtered.push(a);
      }
    }

    this.filteredCustomsProcess = filtered;
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

  filterChargingCountry(event: any, mode: 'import' | 'export') {
    const query = event.query?.toLowerCase();
    const baseList = mode === 'import' ? this.filteredChargingCountryImport : this.filteredChargingCountryExport;

    const filtered: any[] = baseList.filter((location: any) =>
      location.name.toLowerCase().includes(query)
    );

    if (mode === 'import') {
      this.currentFilteredChargingCountryImport = filtered;
    } else {
      this.currentFilteredChargingCountryExport = filtered;
    }
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

  filterFacilityType(event: any) {
    const preferredValues11 = ['ILHFA', 'ILATP ', 'ILABF', 'ILASH'];
    const preferredValues1 = ['ILSWS', 'ILMMN'];
    let preferred: any[] = [];
    let others: any[] = [];

    let query = event.query;
    for (let i = 0; i < this.declarationFacilityID.length; i++) {
      let a = this.declarationFacilityID[i];

      const TransportContractDocumentTypeCode = this.generalDeclarationForm.get("Consignments.TransportContractDocumentTypeCode")?.value.code

      if (TransportContractDocumentTypeCode == "1") {
        if (preferredValues1.includes(a.code) && a.name.indexOf(query) != -1 && a.siteType === "24") {
          preferred.push(a)
        }
        else if (a.name.indexOf(query) != -1 && a.siteType === "24") {
          others.push(a);

        }
      }
      else if (TransportContractDocumentTypeCode == "11") {
        if (preferredValues11.includes(a.code) && a.name.indexOf(query) != -1 && a.siteType === "1") {
          preferred.push(a);
        }
        else if (a.name.indexOf(query) != -1 && a.siteType === "1") {
          others.push(a)
        }
      }
      else if (a.name.indexOf(query) != -1) {
        others.push(a);
      }
    }
    this.filteredFacilityType = [...preferred, ...others];
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

  filterInvoiceTypeCode(event: any) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.declarationInvoiceTypeCode.length; i++) {
      let a = this.declarationInvoiceTypeCode[i];
      if (a.name && a.name.indexOf(query) != -1) {
        filtered.push(a);
      }
    }
    this.filteredInvoiceTypeCode = filtered;
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
  i = 0
  customStatusName(status: any) {
    console.log(this.i++);

    // if (status ) {
    if (status && status !== this.customStatus) {
      this.customStatus = status;
      if (status == 7) {
        localStorage.setItem("maxIndex", "4");
        this.stepService.updateMaxIndex(4);
      }
      else {
        localStorage.setItem("maxIndex", "2");
        this.stepService.updateMaxIndex(2);
      }
    }

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
