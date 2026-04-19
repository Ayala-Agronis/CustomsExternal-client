import { CommonModule, FormatWidth, JsonPipe } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
} from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';
import {
  BehaviorSubject,
  forkJoin,
  map,
  min,
  Observable,
  of,
  Subject,
  takeUntil,
  tap,
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  filter,
  switchMap,
  catchError,
  startWith,
} from 'rxjs';
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
import { shareReplay } from 'rxjs/operators';
import { DocumentService } from '../../shared/services/document.service';
import { CourierService } from '../../shared/services/courier.service';
import { SearchVendorComponent } from '../search-vendor/search-vendor.component';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-declaration-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TabViewModule,
    TooltipModule,
    CardModule,
    ProgressSpinnerModule,
    MessagesModule,
    ButtonModule,
    InputTextModule,
    CalendarModule,
    InputTextareaModule,
    AutoCompleteModule,
    TableModule,
    ConfirmDialogModule,
    SearchVendorComponent,
    DialogModule,
  ],
  templateUrl: './declaration-form.component.html',
  styleUrl: './declaration-form.component.scss',
  providers: [ConfirmationService, MessageService],
})
export class DeclarationFormComponent implements OnInit {
  generalDeclarationForm!: FormGroup;
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

  declarationCountryOfExport: any;
  declarationCustomsProcess: any;
  declarationChargingCountry: any;
  declarationCargoIDType: any;
  declarationCurrencyCode: any;
  declarationTradeTermsConditionCode: any;
  declarationSupplierID: any;
  declarationInvoiceTypeCode: any;
  declarationFacilityID: any;

  isCopyMode = false;
  private pendingCopy = false;

  private readonly allowedCargoIDTypeCodes = ['1', '11', '17', '2', '3'];

  cargoFieldLabelsMap: {
    [key: string]: { year: string; main: string; inner: string };
  } = {
    '1': {
      year: 'שנה',
      main: '	מס שט"מ ישיר/ מאסטר',
      inner: 'שט"מ פנימי',
    },
    '11': {
      year: "מס' מצהר",
      main: "מס' עסקה",
      inner: '???',
    },
    '17': {
      year: 'ח.פ. בלדר',
      main: 'מס\' שט"מ בלדר',
      inner: 'תאריך הקמה',
    },
    '2': {
      year: "מס' חבילה",
      main: 'שנה',
      inner: '???',
    },
    '3': {
      year: "מס' חבילה",
      main: 'תאריך יצירה',
      inner: '???',
    },
  };

  // cargoCompanyOptionsForCode17 = [
  //   { name: 'UPS', code: '511919896' },
  //   { name: 'DHL', code: '510569379' },
  //   { name: 'FEDEX', code: '515929552' },
  //   { name: 'געש', code: '515308906' },
  // ];

  cargoCompanyOptionsForCode17: any[] = [];

  filteredCargoCompanyOptionsForCode17: any[] = [];

  courierLookupLoading = false;
  private lastCourierLookupKey = '';
  private isInitializingDeclaration = false;

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

  showBtnCustoms = false;
  loading: boolean = false;
  isLocked: boolean = false;
  msgs1: Message[] = [];
  customsErrorsContent: any;
  customsError: any;
  private errorTypesMap: { [key: string]: string } = {};
  formattedCustomsErrors: any[] = [];

  isLockedByBrokerRouting: boolean = false;
  brokerRoutingMessage: string = 'הצהרה נותבה לעמיל המכס להמשך טיפול';
  formDisabled: boolean = false;
  formErrorsMessage: string = '';

  isLockedBySbtEvent: boolean = false;
  sbtLockMessage: string = 'ההצהרה הועברה להמשך טיפול. ניתן לצפות בלבד';

  displayVendorDialog = false;
  currentVendorInvoiceIndex: number | null = null;

  private chargingCountryMap = new Map<string, any>();
  private chargingCountryByCountryCache = new Map<string, Observable<any[]>>();
  portsLoading: boolean = false;

  private destroy$ = new Subject<void>();
  secondCargoIDError: any;
  showCustomsValuation: boolean[] = [];
  fieldLabels: any = {
    ImporterID: 'מזהה יבואן',
    CustomsProcess: 'תהליך מכס',
    TransportContractDocumentID: 'שנה',
    SecondCargoID: 'מזהה מטען ראשי',
    ThirdCargoID: 'מזהה מטען פנימי',
    ExportationCountryCode: 'ארץ יצוא',
    ChargingCountry: 'אתר טעינה',
    UnloadingLocationID: 'אתר פריקה',
    ArrivalDateTime: 'תאריך הגעת טובין',
    TransportContractDocumentTypeCode: 'סוג מזהה מטען',
    CargoDescription: 'תיאור טובין',
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
    ChargesTypeCode: 'סוג:',
    CurrencyCodeValuation: 'מטבע:',
    OtherChargeDeductionAmount: 'סה"כ (הובלה)',
    ClassificationID: 'מזהה סיווג',
    AmountType: 'כמות ',
    CustomsValueAmount: 'ערך טובין',
    OriginCountryCode: 'ארץ מקור',
  };
  suplierErrorExist: boolean = false;
  suplierError: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private cd: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private customsDataService: CustomsDataService,
    private decService: DeclarationService,
    private documentsService: DocumentService,
    private stepService: StepService,
    private paymentService: PaymentService,
    private courierService: CourierService,
  ) {}

  ngOnInit(): void {
    this.initForm();

    const params = this.route.snapshot.queryParams;

    this.mode = params['Mode'];
    this.declarationType = params['type'] || 'import';
    this.isCopyMode = params['copyMode'] === 'true';

    if (this.isCopyMode) {
      this.pendingCopy = true;
    }

    console.log('is copy mode', this.isCopyMode);
    console.log('pendingCopy', this.pendingCopy);

    if (this.mode === 'copy') {
      this.loading = true;
    }

    if (this.mode === 'e') {
      this.loading = true;
    }

    if (this.mode !== 'e') {
      this.isLockedBySbtEvent = false;
      this.customsError = '';
      this.customsErrorsContent = '';

      this.customsDataService
        .GetSeq$('Customs')
        .pipe(
          tap((res) => {
            localStorage.setItem('AgentFileReferenceID', res);
            this.generalDeclarationForm?.patchValue({
              AgentFileReferenceID: res,
            });
          }),
        )
        .subscribe();
    }

    if (params['customsSend'] === 'true') {
      this.msgs1 = [
        {
          severity: 'success',
          summary: 'תשלום עמלה בוצע בהצלחה ',
          detail: 'ניתן לשלוח טיוטה למכס',
        },
      ];
    }

    forkJoin([
      this.courierService.getCourierCompanies$().pipe(
        map(
          (res) =>
            (this.cargoCompanyOptionsForCode17 = (res || []).map(
              (company: any) => ({
                name: company.Name,
                code: company.Code,
              }),
            )),
        ),
      ),
      this.customsDataService.getCustomsTableValues$('1354').pipe(
        map(
          (res) =>
            (this.declarationCustomsProcess = res.map(
              (item: { Value2: any; Value1: any }) => ({
                name: item.Value2,
                code: item.Value1,
              }),
            )),
        ),
      ),
      this.customsDataService.getCustomsTableValues$('1981').pipe(
        map(
          (res) =>
            (this.customsStatuses = res.map(
              (item: { Value2: any; Value1: any }) => ({
                name: item.Value2,
                code: item.Value1,
              }),
            )),
        ),
      ),
      this.customsDataService.getCustomsTableValues$('1259').pipe(
        map(
          (res) =>
            (this.declarationCargoIDType = res
              .map((item: { Value2: any; Value1: any }) => ({
                name: item.Value2,
                code: item.Value1,
              }))
              .filter((item: any) =>
                this.allowedCargoIDTypeCodes.includes(String(item.code)),
              )),
        ),
      ),
      this.customsDataService.getCustomsTableValues$('1144').pipe(
        map(
          (res) =>
            (this.declarationCurrencyCode = res.map(
              (item: { Value2: any; Value1: any }) => ({
                name: item.Value2,
                code: item.Value1,
              }),
            )),
        ),
      ),
      this.customsDataService.getCustomsTableValues$('1426').pipe(
        map(
          (res) =>
            (this.declarationTradeTermsConditionCode = res.map(
              (item: { Value2: any; Value1: any }) => ({
                name: item.Value2,
                code: item.Value1,
              }),
            )),
        ),
      ),
      this.customsDataService.getCustomsTableValues$('1404').pipe(
        map(
          (res) =>
            (this.declarationInvoiceTypeCode = res.map(
              (item: { Value2: any; Value1: any }) => ({
                name: item.Value2,
                code: item.Value1,
              }),
            )),
        ),
      ),
      this.customsDataService.getVendor$().pipe(
        map(
          (res) =>
            (this.declarationSupplierID = res.map(
              (item: { VendorName: any; VendorID: any }) => ({
                name: item.VendorName,
                code: item.VendorID,
              }),
            )),
        ),
      ),
      this.customsDataService.getCustomsTableValues$('1517').pipe(
        map((res) => {
          res.forEach((item: any) => {
            this.errorTypesMap[item.Value1] = item.Value2;
          });
          return res;
        }),
      ),
    ]).subscribe(() => {
      this.consignmentInit(() => {
        if (this.mode === 'e') {
          localStorage.setItem('maxIndex', '2');
          this.customStatus = localStorage.getItem('CustomsStatus');
          this.initElements();
        }
      });
    });

    // if (this.mode === 'copy') {
    //   return;
    // }

    // this.loadCourierCompanies();

    const initialCargoType = this.generalDeclarationForm.get(
      'Consignments.TransportContractDocumentTypeCode',
    )?.value;

    this.updateThirdCargoFieldState(initialCargoType);

    const initialCargoTypeCode = this.generalDeclarationForm.get(
      'Consignments.TransportContractDocumentTypeCode',
    )?.value?.code;

    this.updateSecondCargoIDValidators(initialCargoTypeCode);

    this.deferFormErrorsMessageUpdate();

    this.generalDeclarationForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.deferFormErrorsMessageUpdate();
      });

    this.generalDeclarationForm
      .get('VersionID')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateBrokerRoutingState();
      });

    this.generalDeclarationForm
      .get('Consignments.TransportContractDocumentTypeCode')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        const consignmentsGroup = this.generalDeclarationForm.get(
          'Consignments',
        ) as FormGroup;

        const firstControl = consignmentsGroup.get(
          'TransportContractDocumentID',
        );
        const secondControl = consignmentsGroup.get('SecondCargoID');
        const thirdControl = consignmentsGroup.get('ThirdCargoID');

        if (value?.code === '17') {
          firstControl?.setValue(null);
        } else {
          firstControl?.setValue('');
        }

        secondControl?.setValue('');
        // thirdControl?.setValue('');

        // thirdControl?.enable({ emitEvent: false });
        thirdControl?.setValue('', { emitEvent: false });
        this.updateThirdCargoFieldState(value);

        firstControl?.setErrors(null);
        // secondControl?.setErrors(null);
        thirdControl?.setErrors(null);

        firstControl?.markAsPristine();
        secondControl?.markAsPristine();
        thirdControl?.markAsPristine();

        firstControl?.markAsUntouched();
        secondControl?.markAsUntouched();
        thirdControl?.markAsUntouched();

        firstControl?.updateValueAndValidity({ emitEvent: false });
        secondControl?.updateValueAndValidity({ emitEvent: false });
        thirdControl?.updateValueAndValidity({ emitEvent: false });

        this.updateSecondCargoIDValidators(value?.code);

        this.filteredCargoCompanyOptionsForCode17 = [];
        this.secondCargoIDError = '';
        this.lastCourierLookupKey = '';
        this.courierLookupLoading = false;
      });
    //data from cargo query
    this.decService.packageData$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        if (data) {
          (
            this.generalDeclarationForm.controls[
              'ConsignmentPackagesMeasures'
            ] as FormGroup
          ).patchValue({
            TotalPackageQuantity: data.totalNumberOfPackeges,
            GrossMassMeasure: data.totalWeight,
          });
          (
            this.generalDeclarationForm.controls['Consignments'] as FormGroup
          ).patchValue({
            UnloadingLocationID: data.unloadingLocation,
          });
        }
      });

    const exportationCountryControl = this.generalDeclarationForm.get(
      'Consignments.ExportationCountryCode',
    );

    this.setChargingCountryControlStatus();
    exportationCountryControl?.valueChanges.subscribe((value) => {
      this.exportationCountryControlError =
        this.getExportationCountryControlError(exportationCountryControl);
      this.setChargingCountryControlStatus();
    });

    this.loadingChargingCountry$.subscribe(() => {
      this.setChargingCountryControlStatus();
    });

    this.columns = ['מוצר מיובא ', 'כמות', 'ערך טובין', 'ארץ מקור'];

    // if (this.mode != 'e') {
    //   this.customsError = '';
    //   this.customsErrorsContent = '';
    //   this.customsDataService
    //     .GetSeq$('Customs')
    //     .pipe(
    //       tap((res) => {
    //         localStorage.setItem('AgentFileReferenceID', res);
    //       }),
    //     )
    //     .subscribe();
    // }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // consignmentInit() {
  consignmentInit(onComplete?: () => void) {
    this.loading = true;
    // get data from Local Storage or fetch it if not available
    const getCustomsData = (
      key: string,
      tableId: string,
      mappingFn: (item: any) => any,
    ) => {
      const localStorageData = localStorage.getItem(key);
      if (localStorageData) {
        return of(JSON.parse(localStorageData)); // Return stored data as an observable
      } else {
        return this.customsDataService.getCustomsTableValues$(tableId).pipe(
          map((res) => {
            const mappedData = res.map(mappingFn);
            localStorage.setItem(key, JSON.stringify(mappedData)); // Save data to Local Storage
            return mappedData;
          }),
        );
      }
    };

    const customsCountryExport$ = getCustomsData(
      'customsCountryExport',
      '1136',
      (item: { Value2: any; Value1: any }) => ({
        fullName: item.Value2,
        name: `${item.Value2.substring(0, 23)} (${item.Value1})`,
        code: item.Value1,
      }),
    ).pipe(map((res) => (this.declarationCountryOfExport = res)));

    // const customsChargingCountry$ = getCustomsData(
    //   'customsChargingCountry',
    //   '1344',
    //   (item: { Value2: any; Value1: any }) => ({
    //     name: item.Value1,
    //     code: item.Value1,
    //   }),
    // ).pipe(
    //   map((res) => {
    //     this.declarationChargingCountry = res;
    //     this.loadingChargingCountrySubject.next(false);
    //   }),
    //   tap(() => {
    //     // if (this.UpdateMode === 'e' || this.UpdateMode === 'p') {
    //     //   this.filterChargingCountryByExportCode();
    //     // }
    //   }),
    // );

    const customsUnpackingSite$ = getCustomsData(
      'customsUnpackingSite',
      '2192',
      (item: { Value2: any; Value1: any; Value7: any }) => ({
        name: `${item.Value2.substring(0, 12)} (${item.Value1})`,
        code: item.Value1,
        siteType: item.Value7,
      }),
    ).pipe(map((res) => (this.declarationUnpackingSite = res)));

    const customsFacilityID$ = getCustomsData(
      'customsFacilityID',
      '2012',
      (item: { Value2: any; Value1: any; Value7: any }) => ({
        name: `${item.Value2.substring(0, 7)} (${item.Value1})`,
        code: item.Value1,
        siteType: item.Value7,
      }),
    ).pipe(map((res) => (this.declarationFacilityID = res)));

    // const customsCargoIDType$ = getCustomsData(
    //   'customsCargoIDType',
    //   '1259',
    //   (item: { Value2: any; Value1: any }) => ({
    //     name: item.Value2,
    //     code: item.Value1,
    //   }),
    // ).pipe(map((res) => (this.declarationCargoIDType = res)));
    const customsCargoIDType$ = getCustomsData(
      'customsCargoIDType',
      '1259',
      (item: { Value2: any; Value1: any }) => ({
        name: item.Value2,
        code: item.Value1,
      }),
    ).pipe(
      map(
        (res) =>
          (this.declarationCargoIDType = res.filter((item: any) =>
            this.allowedCargoIDTypeCodes.includes(String(item.code)),
          )),
      ),
    );
    // Use forkJoin to execute all requests or use cached data from Local Storage
    // forkJoin([
    //   customsCountryExport$,
    //   // customsChargingCountry$,
    //   customsUnpackingSite$,
    //   customsCargoIDType$,
    //   customsFacilityID$,
    // ]).subscribe(() => {
    //   this.loading = false;
    //   this.loadingChargingCountrySubject.next(false);
    //   const exportationCountryControl = this.generalDeclarationForm.controls[
    //     'Consignments'
    //   ].get('ExportationCountryCode');

    //   exportationCountryControl?.valueChanges.subscribe((value) => {
    //     this.exportationCountryControlError =
    //       this.getExportationCountryControlError(exportationCountryControl);
    //     this.setChargingCountryControlStatus();
    //   });
    //   if (this.mode == 'e') {
    //     // this.filterChargingCountryByExportCode();
    //     // this.initElements();
    //   }
    // });
    forkJoin([
      customsCountryExport$,
      customsUnpackingSite$,
      customsCargoIDType$,
      customsFacilityID$,
    ]).subscribe(() => {
      this.loading = false;
      this.loadingChargingCountrySubject.next(false);

      const exportationCountryControl = this.generalDeclarationForm.controls[
        'Consignments'
      ].get('ExportationCountryCode');

      exportationCountryControl?.valueChanges.subscribe(() => {
        this.exportationCountryControlError =
          this.getExportationCountryControlError(exportationCountryControl);
        this.setChargingCountryControlStatus();
      });

      if (onComplete) {
        onComplete();
      }
    });
  }

  getOtherChargeDeductionAmountControl(
    suplierInvoiceIndex: any,
    index: number,
  ): FormControl {
    const control = this.getValuationValue(suplierInvoiceIndex)
      .at(index)
      .get('OtherChargeDeductionAmount');
    return control as FormControl;
  }

  getExportationCountryControlError(control: any) {
    const value = control?.value;
    const hasError = control?.hasError('required');
    const isEmpty = !value || (value.name === '' && value.code === '');
    return hasError || isEmpty;
  }

  setChargingCountryControlStatus() {
    const chargingCountryControl = this.generalDeclarationForm.get(
      'Consignments.LoadingLocation',
    );

    if (
      this.exportationCountryControlError ||
      this.loadingChargingCountrySubject.value
    ) {
      chargingCountryControl?.disable();
    } else {
      chargingCountryControl?.enable();
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
        ImporterID: this.formBuilder.control(
          localStorage.getItem('userId') || '2',
          Validators.required,
        ),
        GovernmentProcedure: this.formBuilder.control({
          name: 'יבוא מסחרי',
          code: '4000001',
        }),

        ExportationCountryCode: this.formBuilder.control(
          '',
          Validators.required,
        ),
        LoadingLocation: this.formBuilder.control('', Validators.required),
        // LoadingLocation: this.formBuilder.control({value: '', disabled: this.exportationCountryControlError}, Validators.required),
        UnloadingLocationID: this.formBuilder.control('', Validators.required),
        TransportContractDocumentTypeCode: this.formBuilder.control(
          { name: 'שטר מטען אווירי  ', code: '1' },
          Validators.required,
        ),
        ArrivalDateTime: this.formBuilder.control(
          new Date(),
          Validators.required,
        ),
        // TransportContractDocumentID: this.formBuilder.control(
        //   new Date().getFullYear().toString(),
        //   Validators.required,
        // ),
        TransportContractDocumentID: this.formBuilder.control(
          '',
          Validators.required,
        ),
        SecondCargoID: this.formBuilder.control('', Validators.required),
        ThirdCargoID: this.formBuilder.control(''),
        CargoDescription: this.formBuilder.control('', Validators.required),
        //FacilityID: this.formBuilder.control({ name: '', code: '' }),
        FacilityType: this.formBuilder.control(
          { name: '', code: '' },
          Validators.required,
        ),
      }),
      ConsignmentPackagesMeasures: this.formBuilder.group({
        //PackageMeasureQualifier: this.formBuilder.control({ name: 'כמות אריזות באתר אחסון', code: '2' }),
        PackageMeasureQualifier: this.formBuilder.control('2'),
        //TypeCode: this.formBuilder.control({ name: 'Package, paper wrapped', code: 'PP' }),
        TypeCode: this.formBuilder.control('PP'),
        TotalPackageQuantity: this.formBuilder.control('', Validators.required),
        GrossMassMeasure: this.formBuilder.control('', Validators.required),
        //MarksNumbers: this.formBuilder.control(''),
      }),

      SupplierInvoices: this.formBuilder.array([this.createSupplierInvoice()], {
        validators: this.invoiceAmountValidator,
      }),
    });
  }

  createSupplierInvoice(): FormGroup {
    return this.formBuilder.group({
      InvoiceNumber: this.formBuilder.control('', Validators.required),
      SupplierID: this.formBuilder.control(
        { name: '', code: '' },
        Validators.required,
      ),
      IssueDateTime: this.formBuilder.control(new Date(), Validators.required),
      InvoiceAmount: this.formBuilder.control('', Validators.required),
      InvoiceTypeCode: this.formBuilder.control(
        { name: 'חשבון מכר', code: '380' },
        Validators.required,
      ),
      CurrencyCode: this.formBuilder.control(
        { name: '', code: '' },
        Validators.required,
      ),
      LocationID: this.formBuilder.control(
        { name: '', code: '' },
        Validators.required,
      ),
      TradeTermsConditionCode: this.formBuilder.control(
        { name: '', code: '' },
        Validators.required,
      ),
      Id: this.formBuilder.control(null),
      CustomsValuation: this.formBuilder.array([
        this.formBuilder.group({
          ID: this.formBuilder.control(null),
          ChargesTypeCode: this.formBuilder.control({
            name: 'ביטוח',
            code: '67',
          }),
          CurrencyCode: this.formBuilder.control({ name: 'USD', code: 'USD' }),
          OtherChargeDeductionAmount: this.formBuilder.control(
            0,
            Validators.min(0),
          ),
        }),
        this.formBuilder.group({
          ID: this.formBuilder.control(null),
          ChargesTypeCode: this.formBuilder.control({
            name: 'הובלה',
            code: '144',
          }),
          CurrencyCode: this.formBuilder.control({ name: 'USD', code: 'USD' }),
          OtherChargeDeductionAmount: this.formBuilder.control(0),
          // OtherChargeDeductionAmount: this.formBuilder.control(1, [Validators.required, Validators.min(1)])
        }),
      ]),
      SupplierInvoiceItems: this.formBuilder.array([
        this.createSupplierInvoiceItem(),
      ]),
      //   SupplierInvoiceItems: this.formBuilder.array([this.createSupplierInvoiceItem()]),
      // }, { validators: this.invoiceAmountValidator
    });
  }

  get supplierInvoices(): FormArray {
    return this.generalDeclarationForm.get('SupplierInvoices') as FormArray;
  }

  addSupplierInvoice(): void {
    if (this.formDisabled) return;
    this.supplierInvoices.push(this.createSupplierInvoice());
  }

  removeSupplierInvoice(rowData: any, index: any) {
    if (this.formDisabled) return;

    if (rowData?.controls?.Id?.value) {
      this.confirmationService.confirm({
        message: 'האם אתה בטוח שברצונך למחוק?',
        accept: () => {
          rowData.patchValue({ Id: -rowData.controls.Id.value });
        },
      });
    } else {
      this.supplierInvoices.removeAt(index);
    }
    this.cd.detectChanges();
  }

  GetSupplierInvoiceItems(index: any): FormArray {
    return (
      this.generalDeclarationForm.get(`SupplierInvoices`) as FormArray
    ).controls[index].get('SupplierInvoiceItems') as FormArray;
  }

  // isInvoiceItemFieldEmpty(
  //   invoiceIndex: number,
  //   rowIndex: number,
  //   fieldName: string,
  // ): boolean {
  //   const row = this.GetSupplierInvoiceItems(invoiceIndex).at(rowIndex);
  //   const value = row.get(fieldName)?.value;

  //   if (value === null || value === undefined) {
  //     return true;
  //   }

  //   if (typeof value === 'string') {
  //     return value.trim() === '';
  //   }

  //   if (typeof value === 'object') {
  //     return !value.code && !value.name;
  //   }

  //   return false;
  // }

  addNewInvoiceItem(i: any): void {
    if (this.formDisabled) return;

    const invoiceItemsArray = this.GetSupplierInvoiceItems(i);
    invoiceItemsArray?.push(this.createSupplierInvoiceItem());
  }

  invoiceAmountValidator(control: AbstractControl): any {
    const invoiceFormGroup = control as FormGroup;
    const supplierInvoiceItems =
      invoiceFormGroup.get('SupplierInvoiceItems')?.value || [];

    const totalCustomsValueAmount = supplierInvoiceItems.reduce(
      (sum: any, item: any) => {
        return sum + (item.CustomsValueAmount || 0);
      },
      0,
    );

    const invoiceAmount = invoiceFormGroup.get('InvoiceAmount')?.value;
    if (invoiceAmount) {
      console.log(invoiceAmount);
    }
    if (totalCustomsValueAmount) console.log(totalCustomsValueAmount);

    if (invoiceAmount && invoiceAmount !== totalCustomsValueAmount) {
      // return true;
      console.log('סה"כ ערכי טובין לא שווה לסה"כ חשבון');
      invoiceFormGroup.setErrors({ invoiceAmountMismatch: true });

      return { invoiceAmountMismatch: 'סה"כ ערכי טובין לא שווה לסה"כ חשבון' };
    }

    return null;
  }

  private createSupplierInvoiceItem(): FormGroup {
    return this.formBuilder.group({
      ClassificationID: this.formBuilder.control('', Validators.required),
      MeasureQualifier: this.formBuilder.control(null),
      CustomsValueAmount: this.formBuilder.control(null, Validators.required),
      AmountType: this.formBuilder.control('', Validators.required),
      OriginCountryCode: this.formBuilder.control(null, Validators.required),
    });
  }

  onDeleteRow(rowData: any, index: any, suplierInvoiceIndex: any): void {
    if (this.formDisabled) return;

    if (rowData?.controls?.Id?.value) {
      this.confirmationService.confirm({
        message: 'האם אתה בטוח שברצונך למחוק?',
        accept: () => {
          rowData.patchValue({ Id: -rowData.controls.Id.value });
        },
      });
    } else {
      const supplierInvoiceItems =
        this.GetSupplierInvoiceItems(suplierInvoiceIndex);

      supplierInvoiceItems.removeAt(index);
    }
  }

  onClassificationIDBlur(index: any, suplierInvoiceIndex: any) {
    const tableRowArray = this.GetSupplierInvoiceItems(suplierInvoiceIndex);
    // const tableRowArray = this.generalDeclarationForm.get('SupplierInvoices.SupplierInvoiceItems') as FormArray;
    const classificationID =
      tableRowArray.controls[index].get('ClassificationID');
    const MeasureQualifier =
      tableRowArray.controls[index].get('MeasureQualifier');

    if (classificationID && classificationID.value) {
      this.decService.GetClassificationID$(classificationID.value).subscribe({
        next: (responseData: any) => {
          if (responseData.customsItemField) {
            console.log(responseData);
            MeasureQualifier?.patchValue(
              responseData.customsItemField[0]
                .statisticMeasurementUnitExternalIDField,
            );
            MeasureQualifier?.setErrors(null);
          }
          // else {
          // }
        },
        error: (err) => {
          console.error('Error fetching client data:', err);
        },
      });
    }
  }

  getValuationValue(index: any): FormArray {
    return (
      this.generalDeclarationForm.get(`SupplierInvoices`) as FormArray
    ).controls[index].get('CustomsValuation') as FormArray;
    // return this.generalDeclarationForm.get('SupplierInvoices.CustomsValuation') as FormArray;
  }

  convertToDecObj(dec: any) {
    dec.GovernmentProcedure = dec.GovernmentProcedure?.code
      ? dec.GovernmentProcedure.code
      : dec.GovernmentProcedure;

    const consignments = dec.Consignments;

    consignments.ImporterID =
      consignments.ImporterID?.code ?? consignments.ImporterID;

    consignments.GovernmentProcedure =
      consignments.GovernmentProcedure?.code ??
      consignments.GovernmentProcedure;

    dec.ImporterID = consignments.ImporterID;
    dec.GovernmentProcedure = consignments.GovernmentProcedure;

    dec.AgentFileReferenceID = localStorage.getItem('AgentFileReferenceID');

    consignments.ExportationCountryCode =
      consignments.ExportationCountryCode?.code ??
      consignments.ExportationCountryCode;
    consignments.LoadingLocation =
      consignments.LoadingLocation?.code ?? consignments.LoadingLocation;
    consignments.UnloadingLocationID =
      consignments.UnloadingLocationID?.code ??
      consignments.UnloadingLocationID;
    consignments.TransportContractDocumentTypeCode =
      consignments.TransportContractDocumentTypeCode?.code ??
      consignments.TransportContractDocumentTypeCode;

    consignments.TransportContractDocumentID =
      consignments.TransportContractDocumentID?.code ??
      consignments.TransportContractDocumentID;

    consignments.SecondCargoID =
      consignments.SecondCargoID?.code ?? consignments.SecondCargoID;

    const ConsignmentRegisteredFacilitiesList = [];

    const facility1 = {
      Id: consignments.FacilityType?.id,
      FacilityID: consignments.FacilityType?.code,
      FacilityType: '004',
      FacilitySequenceNumeric: 2,
    };

    ConsignmentRegisteredFacilitiesList.push(facility1);
    dec.ConsignmentRegisteredFacilities = ConsignmentRegisteredFacilitiesList;

    const supplierInvoices = dec.SupplierInvoices;

    supplierInvoices.forEach((invoice: any) => {
      // invoice.InvoicesAndGoods ? invoice.InvoicesAndGoods = invoice.InvoicesAndGoods?.code : '';
      invoice.InvoiceTypeCode =
        invoice.InvoiceTypeCode?.code ?? invoice.InvoiceTypeCode;
      invoice.LocationID = invoice.LocationID?.code ?? invoice.LocationID;
      invoice.SupplierID = invoice.SupplierID?.code ?? invoice.SupplierID;
      invoice.TradeTermsConditionCode =
        invoice.TradeTermsConditionCode?.code ??
        invoice.TradeTermsConditionCode;
      invoice.CurrencyCode = invoice.CurrencyCode?.code ?? invoice.CurrencyCode;

      const customValuation = invoice.CustomsValuation
        ? invoice.CustomsValuation
        : null;
      if (customValuation) {
        customValuation.forEach((element: any) => {
          element.ChargesTypeCode =
            element.ChargesTypeCode?.code ?? element.ChargesTypeCode;
          element.CurrencyCode =
            element.CurrencyCode?.code ?? element.CurrencyCode;
        });
      }

      const SupplierInvoiceItems = invoice.SupplierInvoiceItems;

      if (SupplierInvoiceItems) {
        SupplierInvoiceItems?.forEach((element: any) => {
          element.Id == '' ? (element.Id = null) : (element.Id = element.Id);
          // if (element.DutyRegimeCode?.code == '')
          //   element.DutyRegimeCode = null
          // element.DutyRegimeCode = element.DutyRegimeCode?.code ? element.DutyRegimeCode?.code : element.DutyRegimeCode;
          element.OriginCountryCode =
            element.OriginCountryCode?.code ?? element.OriginCountryCode;
        });
      }

      // invoice.SupplierInvoiceItems = invoice.SupplierInvoiceItems?.tableRowArray
    });

    dec.Id = localStorage.getItem('currentDecId');
    dec.RoleCode = '1';
    dec.TaxationDateTime = new Date();
    dec.CreateDateTime = new Date();

    this.perfectDecalartion = JSON.parse(JSON.stringify(dec));

    this.perfectDecalartion.Consignments = [dec.Consignments];
    this.perfectDecalartion.ConsignmentPackagesMeasures = [
      dec.ConsignmentPackagesMeasures,
    ];
    this.perfectDecalartion.SupplierInvoices = dec.SupplierInvoices;
    return this.perfectDecalartion;
  }

  saveDeclaration() {
    if (this.generalDeclarationForm.invalid) {
      const invoiceAmountError =
        this.generalDeclarationForm.get('SupplierInvoices')?.errors?.[
          'invoiceAmountMismatch'
        ];
      if (invoiceAmountError) {
        console.log('הסכום הכולל לא תואם לערך ב-"InvoiceAmount"');
      }
    }

    this.loading = true;
    const dec = this.generalDeclarationForm.getRawValue();
    const perfectDec = this.convertToDecObj(dec);

    if (this.mode != 'e') {
      this.decService
        .sendDeclarationToInternal(perfectDec)
        .subscribe((res: any) => {
          console.log(res);
          // localStorage.setItem('currentDecId', res.body?.Id);
          // localStorage.setItem('currentDec', res.body);
          localStorage.setItem('currentDecId', String(res.body?.Id ?? ''));
          localStorage.setItem('currentDec', JSON.stringify(res.body ?? {}));
          this.loading = false; // ✅ הוסף כאן
          this.createEvent('OPEN');

          this.stepService.emitStepCompleted('+');
        });
    } else {
      this.decService
        .updateDeclaration$(perfectDec.Id, perfectDec)
        .subscribe((res: any) => {
          console.log(res);
          this.loading = false; // ✅ הוסף כאן

          this.stepService.emitStepCompleted('+');
        });
    }
  }

  sendDeclaration() {
    debugger;
    this.loading = true;
    const id = localStorage.getItem('currentDecId');
    const dec = this.generalDeclarationForm.getRawValue();
    const perfectDec = this.convertToDecObj(dec);
    console.log(perfectDec);

    this.decService
      .updateAndSendDeclaration$(id, perfectDec, false)
      .subscribe((res: any) => {
        this.loading = false;
        res = JSON.parse(res);
        console.log(res);
        if (res.responseField) {
          this.createEvent('DRFT', false);
          if (res.responseField.statusField.nameCodeField.valueField == 13) {
            //תשלום קופה
          }

          this.generalDeclarationForm
            .get('DeclarationNumber')
            ?.setValue(res.responseField.declarationField.idField.valueField);
          this.generalDeclarationForm
            .get('VersionID')
            ?.setValue(
              res.responseField.declarationField.dMExtensionsField
                .versionIDField.valueField,
            );
          this.updateBrokerRoutingState();

          dec.DeclarationNumber =
            res.responseField.declarationField.idField.valueField;
          dec.VersionID =
            res.responseField.declarationField.dMExtensionsField.versionIDField.valueField;
          dec.CustomsStatus =
            res.responseField.statusField.nameCodeField.valueField;
          this.customStatus = dec.CustomsStatus;
          localStorage.setItem('decVersion', dec.VersionID);
          localStorage.setItem('CustomsStatus', dec.CustomsStatus);

          if (+dec.VersionID > 0.5) {
            this.msgs1 = [
              {
                severity: 'error',
                summary: 'נשלחו 6 טיוטות שגויות',
                detail: '"שחרור ההצהרה עובר לתהליך של "חבר בוואטסאפ',
              },
            ];
          }
          // if (res.responseField.errorField) {
          //   this.customsErrorsContent = res.responseField.errorField;
          //   // res.responseField.errorField[0].validationCodeField.nameField
          //   // res.responseField.errorField[1].validationCodeField.valueField
          // }
          if (res.responseField.errorField) {
            this.customsErrorsContent = res.responseField.errorField;
            this.formattedCustomsErrors = this.formatCustomsErrors(
              res.responseField.errorField,
            );

            console.log('errorField', res.responseField.errorField);
            console.log('formattedCustomsErrors', this.formattedCustomsErrors);
          }
        } else if (res.responseContentHeaderField) {
          this.customsError = res.responseContentHeaderField.exceptionField;
        }
      });
  }

  initElements() {
    this.loading = true;

    const decId = localStorage.getItem('currentDecId');
    let currentDec: any;
    this.decService
      .getDeclaration(decId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        this.initElementsWithData(res);
        this.loading = false;
      });
  }
  private initElementsWithData(currentDec: any) {
    console.log('>>> initElementsWithData');
    console.log('✅customsProcess', this.declarationCustomsProcess);
    console.log('country', this.declarationCountryOfExport);
    console.log('unpacking', this.declarationUnpackingSite);
    console.log('cargoType', this.declarationCargoIDType);
    console.log('facility', this.declarationFacilityID);
    this.isInitializingDeclaration = true;

    localStorage.setItem('currentDecId', String(currentDec?.Id ?? ''));
    localStorage.setItem('currentDec', JSON.stringify(currentDec ?? {}));

    if (!currentDec) {
      this.loading = false;
      return;
    }

    if (currentDec) {
      const consignmentForm =
        this.generalDeclarationForm.controls['Consignments'];

      // --general--
      // this.generalDeclarationForm.patchValue({
      //   AgentFileReferenceID: currentDec?.AgentFileReferenceID,
      // });

      // localStorage.setItem(
      //   'AgentFileReferenceID',
      //   currentDec?.AgentFileReferenceID,
      // );
      if (this.mode !== 'copy') {
        this.generalDeclarationForm.patchValue({
          AgentFileReferenceID: currentDec?.AgentFileReferenceID,
        });

        localStorage.setItem(
          'AgentFileReferenceID',
          currentDec?.AgentFileReferenceID,
        );
      }

      this.generalDeclarationForm.patchValue({
        DeclarationNumber: currentDec?.DeclarationNumber,
      });
      this.generalDeclarationForm.patchValue({
        VersionID: currentDec?.VersionID,
      });
      this.generalDeclarationForm.patchValue({
        ImporterID: currentDec?.ImporterID,
      });
      consignmentForm.patchValue({
        ImporterID: currentDec?.ImporterID,
      });
      this.generalDeclarationForm.patchValue({
        CustomsStatus: currentDec?.CustomsStatus,
      });
      //this.onImporterIdBlur();
      //this.VersionID = currentDec?.VersionID

      const matchingElement1 = this.declarationCustomsProcess.find(
        (element: any) => element.code == currentDec?.GovernmentProcedure,
      );
      if (matchingElement1) {
        this.generalDeclarationForm.patchValue({
          GovernmentProcedure: matchingElement1,
        });
      }
      if (matchingElement1) {
        consignmentForm.patchValue({
          GovernmentProcedure: matchingElement1,
        });
      }

      // --consignment--

      const currentConsignment =
        currentDec?.ConsignmentPackagesMeasures?.[0].Consignments;
      // const matchingExportationCountry = this.declarationCountryOfExport.find((element: any) => element.code == currentConsignment?.ExportationCountryCode);
      const matchingExportationCountry = this.declarationCountryOfExport.find(
        (element: any) =>
          element.code == currentConsignment?.ExportationCountryCode,
      );
      this.ExportationCountrySelect = matchingExportationCountry?.name || '';
      if (matchingExportationCountry) {
        consignmentForm.patchValue({
          ExportationCountryCode: matchingExportationCountry,
        });
      }

      // this.filterChargingCountryByExportCode();

      // const matchingChargingCountry = this.declarationChargingCountry.find(
      //   (element: { code: any }) =>
      //     element.code == currentConsignment?.LoadingLocation,
      // );
      // if (matchingChargingCountry) {
      //   consignmentForm.patchValue({
      //     LoadingLocation: matchingChargingCountry,
      //   });
      // }

      const loadingLocationCode = currentConsignment?.LoadingLocation || '';

      const immediateLoadingLocation = this.chargingCountryMap.get(
        loadingLocationCode,
      ) || {
        code: loadingLocationCode,
        name: loadingLocationCode,
      };

      consignmentForm.patchValue(
        {
          LoadingLocation: immediateLoadingLocation,
        },
        { emitEvent: false },
      );

      this.exportationCountryControlError = false;
      this.setChargingCountryControlStatus();

      this.portsLoading = true;

      this.getChargingPortsByCountry$(
        currentConsignment?.ExportationCountryCode,
      )
        .pipe(takeUntil(this.destroy$))
        .subscribe((ports) => {
          this.declarationChargingCountry = ports;
          this.filteredChargingCountry = ports;
          this.currentFilteredChargingCountry = ports;

          const matchingChargingCountry = ports.find(
            (element: { code: any }) =>
              element.code == currentConsignment?.LoadingLocation,
          ) || {
            code: currentConsignment?.LoadingLocation,
            name: currentConsignment?.LoadingLocation,
          };

          consignmentForm.patchValue(
            {
              LoadingLocation: matchingChargingCountry,
            },
            { emitEvent: false },
          );

          this.portsLoading = false;
          this.exportationCountryControlError = false;
          this.setChargingCountryControlStatus();
        });

      const matchingUnpackingSite = this.declarationUnpackingSite.find(
        (element: { code: any }) =>
          element.code == currentConsignment?.UnloadingLocationID,
      );
      if (matchingUnpackingSite) {
        consignmentForm.patchValue({
          UnloadingLocationID: matchingUnpackingSite,
        });
      }

      const matchingCargoIDType = this.declarationCargoIDType.find(
        (element: { code: any }) =>
          element.code == currentConsignment?.TransportContractDocumentTypeCode,
      );
      // if (matchingCargoIDType) {
      //   consignmentForm.patchValue({
      //     TransportContractDocumentTypeCode: matchingCargoIDType,
      //   });
      // }
      if (matchingCargoIDType) {
        consignmentForm.patchValue(
          {
            TransportContractDocumentTypeCode: matchingCargoIDType,
          },
          { emitEvent: false },
        );
      }

      const item =
        currentConsignment.ConsignmentRegisteredFacilities[0]?.FacilityType ==
        '004'
          ? currentConsignment.ConsignmentRegisteredFacilities[0]
          : currentConsignment.ConsignmentRegisteredFacilities[1];
      const matchingFacilityID = this.declarationFacilityID.find(
        (element: { code: any }) => element.code == item?.FacilityID,
      );
      if (matchingFacilityID) {
        consignmentForm.patchValue({ FacilityType: matchingFacilityID });
      }

      // const transportContractDocumentTypeCode =
      //   currentConsignment?.TransportContractDocumentTypeCode;

      // const transportContractDocumentIdValue =
      //   String(transportContractDocumentTypeCode) === '17'
      //     ? this.cargoYearOptionsForCode17.find(
      //         (item: any) =>
      //           String(item.code) ===
      //           String(currentConsignment?.TransportContractDocumentID),
      //       ) || null
      //     : currentConsignment?.TransportContractDocumentID;

      // consignmentForm.patchValue({
      //   CargoDescription: currentConsignment?.CargoDescription,
      //   TransportContractDocumentID: transportContractDocumentIdValue,
      //   SecondCargoID: currentConsignment?.SecondCargoID,
      //   ThirdCargoID: currentConsignment?.ThirdCargoID,
      //   ArrivalDateTime: new Date(currentConsignment?.ArrivalDateTime),
      // });

      const transportContractDocumentTypeCode =
        currentConsignment?.TransportContractDocumentTypeCode;

      const secondCargoIdValue =
        String(transportContractDocumentTypeCode) === '17'
          ? this.cargoCompanyOptionsForCode17.find(
              (item: any) =>
                String(item.code) === String(currentConsignment?.SecondCargoID),
            ) || null
          : currentConsignment?.SecondCargoID;

      // consignmentForm.patchValue({
      //   CargoDescription: currentConsignment?.CargoDescription,
      //   TransportContractDocumentID:
      //     currentConsignment?.TransportContractDocumentID,
      //   SecondCargoID: secondCargoIdValue,
      //   ThirdCargoID: currentConsignment?.ThirdCargoID,
      //   ArrivalDateTime: new Date(currentConsignment?.ArrivalDateTime),
      // });

      consignmentForm.patchValue(
        {
          CargoDescription: currentConsignment?.CargoDescription,
          TransportContractDocumentID:
            currentConsignment?.TransportContractDocumentID,
          SecondCargoID: secondCargoIdValue,
          ThirdCargoID: currentConsignment?.ThirdCargoID,
          ArrivalDateTime: new Date(currentConsignment?.ArrivalDateTime),
        },
        { emitEvent: false },
      );

      this.updateThirdCargoFieldState(
        consignmentForm.get('TransportContractDocumentTypeCode')?.value,
      );

      // --ConsignmentPackagesMeasures--
      const consignmentPackagesMeasuresForm =
        this.generalDeclarationForm.controls['ConsignmentPackagesMeasures'];

      consignmentPackagesMeasuresForm.patchValue({
        TotalPackageQuantity:
          currentDec?.ConsignmentPackagesMeasures[0]?.TotalPackageQuantity,
        GrossMassMeasure:
          currentDec?.ConsignmentPackagesMeasures[0]?.GrossMassMeasure,
      });

      // --SupplierInvoices--
      const supplierInvoicesFormArray = this.generalDeclarationForm.get(
        'SupplierInvoices',
      ) as FormArray;

      supplierInvoicesFormArray.clear();

      currentDec.SupplierInvoices.forEach((invoice: any, i: number) => {
        const matchingSupplierID = this.declarationSupplierID.find(
          (element: { code: any }) => element.code == invoice.SupplierID,
        );
        const matchingCurrencyCode = this.declarationCurrencyCode.find(
          (element: { code: any }) => element.code == invoice.CurrencyCode,
        );
        const matchingLocationID = this.declarationCountryOfExport.find(
          (element: { code: any }) => element.code == invoice.LocationID,
        );
        const matchingInvoiceTypeCode = this.declarationInvoiceTypeCode.find(
          (element: { code: any }) => element.code == invoice.InvoiceTypeCode,
        );
        const matchingTradeTermsConditionCode =
          this.declarationTradeTermsConditionCode.find(
            (element: { code: any }) =>
              element.code == invoice.TradeTermsConditionCode,
          );

        const invoiceGroup = this.formBuilder.group({
          SupplierID: [matchingSupplierID, Validators.required],
          CurrencyCode: [matchingCurrencyCode, Validators.required],
          LocationID: [matchingLocationID, Validators.required],
          TradeTermsConditionCode: [
            matchingTradeTermsConditionCode,
            Validators.required,
          ],
          InvoiceNumber: [invoice.InvoiceNumber, Validators.required],
          IssueDateTime: [new Date(invoice.IssueDateTime), Validators.required],
          InvoiceAmount: [invoice.InvoiceAmount, Validators.required],
          InvoiceTypeCode: [matchingInvoiceTypeCode, Validators.required],
          Id: [invoice.Id],

          // --CustomsValuation--
          CustomsValuation: this.formBuilder.array(
            invoice.CustomsValuation.map((item: any, index: any) => {
              const matchingCurrencyCode = this.declarationCurrencyCode.find(
                (element: { code: any }) => element.code == item.CurrencyCode,
              );
              return this.formBuilder.group({
                ChargesTypeCode: !index
                  ? { name: 'ביטוח', code: '67' }
                  : { name: 'הובלה', code: '144' },
                CurrencyCode: [matchingCurrencyCode, Validators.required],
                OtherChargeDeductionAmount: [item.OtherChargeDeductionAmount],
                // 'OtherChargeDeductionAmount': [item.OtherChargeDeductionAmount, [Validators.required, index ? Validators.min(1) : Validators.min(0)]],
                ID: [item.ID],
              });
            }),
          ),

          // --SupplierInvoiceItems--

          SupplierInvoiceItems: this.formBuilder.array(
            invoice.SupplierInvoiceItems.map((item: any) => {
              const matchingOriginCountryCode =
                this.declarationCountryOfExport.find(
                  (element: { code: any }) =>
                    element.code == item.OriginCountryCode,
                );
              return this.formBuilder.group({
                Id: [item.Id, Validators.required],
                ClassificationID: [item.ClassificationID, Validators.required],
                CustomsValueAmount: [
                  item.CustomsValueAmount,
                  Validators.required,
                ],
                AmountType: [item.AmountType, Validators.required],
                OriginCountryCode: [
                  matchingOriginCountryCode,
                  Validators.required,
                ],
                MeasureQualifier: [item.MeasureQualifier],
              });
            }),
          ),
        });

        supplierInvoicesFormArray.push(invoiceGroup);
        const code = matchingTradeTermsConditionCode?.code;
        if (code) {
          const codes = ['FCA', 'FOB', 'EXW', 'FAS'];
          this.showCustomsValuation[i] = codes.includes(code);
          if (codes.includes(code)) this.updateValuationValidators(i);
        }
      });
    }

    this.updateBrokerRoutingState();
    this.checkIfLockedBySbtEvent();
    this.refreshSendButtonVisibility(currentDec?.Id ?? null);

    this.deferFormErrorsMessageUpdate();

    if (this.pendingCopy) {
      this.pendingCopy = false;
      this.copyDeclaration();
    }

    this.isInitializingDeclaration = false;

    this.loading = false; // ✅ כבה את ה-loading בסוף
  }

  getFormErrors(checkInvoice: boolean) {
    let errors: string[] = [];

    if (checkInvoice) {
      const checkSupplierInvoiceConsistency = (
        invoice: FormGroup,
        parentKey: string,
      ) => {
        const invoiceAmount = invoice.get('InvoiceAmount')?.value;
        const supplierInvoiceItems = invoice.get(
          'SupplierInvoiceItems',
        ) as FormArray;

        let customsValueAmountSum = 0;

        supplierInvoiceItems.controls.forEach((item: any) => {
          customsValueAmountSum += +item.get('CustomsValueAmount')?.value || 0;
        });

        if (customsValueAmountSum !== +invoiceAmount) {
          this.suplierErrorExist = true;
          this.suplierError = ` ${parentKey} - סה"כ ערכי טובין לא שווה לסה"כ חשבון`;
        } else {
          this.suplierErrorExist = false;
          this.suplierError = '';
        }
      };

      const supplierInvoices = this.generalDeclarationForm.get(
        'SupplierInvoices',
      ) as FormArray;
      supplierInvoices.controls.forEach((invoice: any, index: number) => {
        checkSupplierInvoiceConsistency(invoice, `חשבונית ${index + 1}`);
      });
    }

    if (
      (!this.generalDeclarationForm || !this.generalDeclarationForm.controls) &&
      !checkInvoice
    ) {
      return '';
    }

    const checkErrors = (formGroup: any, parentKey: string = '') => {
      if (this.suplierErrorExist) {
        errors = [this.suplierError];
      }
      if (formGroup instanceof FormGroup) {
        Object.keys(formGroup.controls).forEach((key) => {
          const control = formGroup.controls[key];
          const fieldPath = parentKey ? `${parentKey}.${key}` : key;
          const fieldName = key.split('.').pop() || key;

          const fieldLabel = this.fieldLabels[fieldName] || fieldName;

          if (control instanceof FormGroup || control instanceof FormArray) {
            checkErrors(control, fieldPath);
          } else if (control.errors !== null) {
            Object.keys(control.errors).forEach((errorKey) => {
              switch (errorKey) {
                case 'required':
                  errors.push(`${fieldLabel}: שדה חובה`);
                  break;
                case 'min':
                  const minValue = control.errors?.['min'];
                  errors.push(
                    `${fieldLabel}: חייב להכיל לפחות ${minValue.min}`,
                  );
                  break;
                //case 'minlength':
                //errors.push(`${fieldLabel}: חייב להכיל לפחות ${control.errors ? control.errors['minlength'].requiredLength : null} תווים`);
                //  break;
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
    // const version = +this.generalDeclarationForm.controls['VersionID'].value;
    // console.log('Version number:', version);
    // return version > 0.5;
    const versionStr = String(
      this.generalDeclarationForm.controls['VersionID'].value ?? '',
    );
    const parts = versionStr.split('.');
    const version = parts.length > 1 ? Number(parts[1]) : 0;
    return version > 5;
  }

  // private updateBrokerRoutingState(): void {
  //   const versionStr = String(
  //     this.generalDeclarationForm?.get('VersionID')?.value ?? '',
  //   );

  //   const parts = versionStr.split('.');
  //   const version = parts.length > 1 ? Number(parts[1]) : 0;

  //   this.isLockedByBrokerRouting = version > 5;

  //   const shouldLockForm = this.isLockedByBrokerRouting;

  //   this.isLocked = shouldLockForm;
  //   this.formDisabled = shouldLockForm;

  //   if (shouldLockForm) {
  //     this.generalDeclarationForm.disable({ emitEvent: false });
  //   } else {
  //     this.generalDeclarationForm.enable({ emitEvent: false });
  //     this.setChargingCountryControlStatus();
  //   }
  // }

  private updateBrokerRoutingState(): void {
    const versionStr = String(
      this.generalDeclarationForm?.get('VersionID')?.value ?? '',
    );

    const parts = versionStr.split('.');
    const version = parts.length > 1 ? Number(parts[1]) : 0;

    this.isLockedByBrokerRouting = version > 5;
    this.applyCombinedLockState();
  }

  private deferFormErrorsMessageUpdate() {
    Promise.resolve().then(() => {
      this.formErrorsMessage = this.getFormErrors(false);
    });
  }

  //get values by cargo Ids
  onCargoIDBlur(cargoIdNum: any) {
    // if (cargoIdNum == 2) {
    //   const consignment = this.generalDeclarationForm.controls[
    //     'Consignments'
    //   ] as FormGroup;

    //   let secondCargoID = consignment.controls['SecondCargoID'].value;
    //   secondCargoID = secondCargoID.trim() || '';

    //   if (/^\d{11}$/.test(secondCargoID)) {
    //     secondCargoID = `${secondCargoID.substring(0, 3)}-${secondCargoID.substring(3)}`;
    //     consignment.controls['SecondCargoID'].setValue(secondCargoID);
    //     this.secondCargoIDError = '';
    //   } else if (/^\d{11,12}$/.test(secondCargoID.replace('-', ''))) {
    //     secondCargoID = secondCargoID.replace('-', '');
    //     secondCargoID = `${secondCargoID.substring(0, 3)}-${secondCargoID.substring(3)}`;
    //     consignment.controls['SecondCargoID'].setValue(secondCargoID);
    //     this.secondCargoIDError = '';
    //   } else {
    //     this.secondCargoIDError = 'מבנה לא תקין';
    //   }
    // }
    if (cargoIdNum == 2) {
      const consignment = this.generalDeclarationForm.controls[
        'Consignments'
      ] as FormGroup;

      const cargoTypeCode =
        consignment.controls['TransportContractDocumentTypeCode'].value?.code;

      // let secondCargoID = consignment.controls['SecondCargoID'].value;
      // secondCargoID = (secondCargoID || '').trim();

      let secondCargoID = consignment.controls['SecondCargoID'].value;
      secondCargoID = secondCargoID?.code ?? secondCargoID;
      secondCargoID = String(secondCargoID || '').trim();

      if (cargoTypeCode === '1') {
        if (/^\d{11}$/.test(secondCargoID)) {
          secondCargoID = `${secondCargoID.substring(0, 3)}-${secondCargoID.substring(3)}`;
          consignment.controls['SecondCargoID'].setValue(secondCargoID);
          this.secondCargoIDError = '';
        } else if (/^\d{11,12}$/.test(secondCargoID.replace('-', ''))) {
          secondCargoID = secondCargoID.replace('-', '');
          secondCargoID = `${secondCargoID.substring(0, 3)}-${secondCargoID.substring(3)}`;
          consignment.controls['SecondCargoID'].setValue(secondCargoID);
          this.secondCargoIDError = '';
        } else {
          this.secondCargoIDError = 'מבנה לא תקין';
        }
      } else {
        this.secondCargoIDError = '';
      }
    }

    const consignment = this.generalDeclarationForm.controls[
      'Consignments'
    ] as FormGroup;

    const cargoType =
      consignment.controls['TransportContractDocumentTypeCode'].value?.code;
    // const firstCargoID =
    //   consignment.controls['TransportContractDocumentID'].value;
    const firstCargoID =
      consignment.controls['TransportContractDocumentID'].value?.code ??
      consignment.controls['TransportContractDocumentID'].value;
    // const secondCargoID = consignment.controls['SecondCargoID'].value;
    const secondCargoID =
      consignment.controls['SecondCargoID'].value?.code ??
      consignment.controls['SecondCargoID'].value;
    const thirdCargoID = consignment.controls['ThirdCargoID'].value;

    if (!(cargoType && firstCargoID && secondCargoID)) {
      return;
    }

    const params = { cargoType, firstCargoID, secondCargoID, thirdCargoID };

    this.decService
      .getCagroQueryMessage$(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res: any) => {
        console.log(res);

        if (!res?.cargoField) {
          return;
        }

        const decId = localStorage.getItem('currentDecId') || '';

        const createDateField = res?.cargosVersionField?.[0]?.createDateField;

        this.decService.setCargoContext({
          decId,
          key: { cargoType, firstCargoID, secondCargoID, thirdCargoID },
          createDate: createDateField, // ✅ זה השדה הנכון
          receivedAtIso: new Date().toISOString(),
        });
        const cargoAdditional = res?.cargoField?.cargoAdditionalDataField?.[0];
        const totalNumberOfPackeges =
          res?.cargoField?.totalNumberOfPackegesField ?? null;
        const totalWeight = res?.cargoField?.totalWeightField ?? null;
        const typeCode = res?.cargoItemField?.[0]?.packingTypeField ?? null;

        const loadingSite = cargoAdditional?.loadingSiteField || '';
        // const loadingCode = loadingSite.trim().split(' ')[0] || '';
        const loadingCode = loadingSite?.substring(0, 5)?.toUpperCase() || '';
        const exportCountryCode = loadingCode.substring(0, 2);

        const exportCountry = this.declarationCountryOfExport?.find(
          (element: any) => element.code === exportCountryCode,
        );

        const unloadingLocation = {
          code: cargoAdditional?.unloadingLocationIDField || '',
          name: cargoAdditional?.unloadingLocationNameField || '',
        };

        const acceptedArrivalSite = {
          code: cargoAdditional?.acceptedArrivalSiteIDField || '',
          name: cargoAdditional?.acceptedArrivalSiteNameField || '',
        };

        // this.getChargingPortsByCountry$(exportCountryCode)
        //   .pipe(takeUntil(this.destroy$))
        //   .subscribe((ports) => {
        //     this.filteredChargingCountry = ports;
        //     this.currentFilteredChargingCountry = ports;
        //     const loadingPort = ports.find(
        //       (p: any) => p.code === loadingCode,
        //     ) || {
        //       code: loadingCode,
        //       name: loadingCode,
        //     };

        //     this.generalDeclarationForm.get('Consignments')?.patchValue(
        //       {
        //         ExportationCountryCode: {
        //           code: exportCountryCode,
        //           name: exportCountry?.name || exportCountryCode,
        //         },
        //         LoadingLocation: loadingPort,
        //         UnloadingLocationID: unloadingLocation,
        //         FacilityType: this.declarationFacilityID?.find(
        //           (f: any) => f.code === acceptedArrivalSite.code,
        //         ) || {
        //           code: acceptedArrivalSite.code,
        //           name: acceptedArrivalSite.name,
        //         },
        //       },
        //       { emitEvent: false },
        //     );

        //     this.exportationCountryControlError = false;
        //     this.setChargingCountryControlStatus();
        //   });

        const immediateLoadingLocation = this.chargingCountryMap.get(
          loadingCode,
        ) || {
          code: loadingCode,
          name: loadingCode,
        };

        this.generalDeclarationForm.get('Consignments')?.patchValue(
          {
            ExportationCountryCode: {
              code: exportCountryCode,
              name: exportCountry?.name || exportCountryCode,
            },
            LoadingLocation: immediateLoadingLocation,
            UnloadingLocationID: unloadingLocation,
            FacilityType: this.declarationFacilityID?.find(
              (f: any) => f.code === acceptedArrivalSite.code,
            ) || {
              code: acceptedArrivalSite.code,
              name: acceptedArrivalSite.name,
            },
          },
          { emitEvent: false },
        );

        this.exportationCountryControlError = false;
        this.setChargingCountryControlStatus();

        this.portsLoading = true;

        this.getChargingPortsByCountry$(exportCountryCode)
          .pipe(takeUntil(this.destroy$))
          .subscribe((ports) => {
            this.filteredChargingCountry = ports;
            this.currentFilteredChargingCountry = ports;
            this.declarationChargingCountry = ports;

            const loadingPort =
              ports.find((p: any) => p.code === loadingCode) ||
              immediateLoadingLocation;

            this.generalDeclarationForm.get('Consignments')?.patchValue(
              {
                LoadingLocation: loadingPort,
              },
              { emitEvent: false },
            );

            this.portsLoading = false;
            this.exportationCountryControlError = false;
            this.setChargingCountryControlStatus();
          });

        this.decService.updatePackageData({
          totalNumberOfPackeges,
          totalWeight,
          typeCode,
          unloadingLocation,
        });

        (
          this.generalDeclarationForm.controls[
            'ConsignmentPackagesMeasures'
          ] as FormGroup
        ).patchValue(
          {
            TotalPackageQuantity: totalNumberOfPackeges,
            GrossMassMeasure: totalWeight,
            TypeCode: typeCode,
          },
          { emitEvent: false },
        );
      });
  }

  serchVendor(index: number) {
    if (this.formDisabled) return;

    this.currentVendorInvoiceIndex = index;
    this.displayVendorDialog = true;
  }

  onVendorSelected(vendor: any) {
    if (this.currentVendorInvoiceIndex === null) return;

    const selectedVendor = {
      name: vendor.VendorName,
      code: String(vendor.VendorID),
    };

    const invoiceGroup = this.supplierInvoices.at(
      this.currentVendorInvoiceIndex,
    ) as FormGroup;
    invoiceGroup.get('SupplierID')?.patchValue(selectedVendor);

    const exists = (this.declarationSupplierID || []).some(
      (x: any) => String(x.code) === String(selectedVendor.code),
    );

    if (!exists) {
      this.declarationSupplierID = [
        ...(this.declarationSupplierID || []),
        selectedVendor,
      ];
    }

    this.displayVendorDialog = false;
    this.currentVendorInvoiceIndex = null;
  }

  // onExportationCountrySelect(event: any) {
  //   this.ExportationCountrySelect = event?.value.name;
  //   this.loadingChargingCountry$.subscribe((loading) => {
  //     if (!loading) {
  //       this.filterChargingCountryByExportCode();
  //     }
  //   });
  //   this.generalDeclarationForm
  //     .get('Consignments.LoadingLocation')
  //     ?.setValue('');
  // }

  onExportationCountrySelect(event: any) {
    const selectedCountryCode = event?.value?.code;
    this.ExportationCountrySelect = event?.value?.name;

    this.generalDeclarationForm
      .get('Consignments.LoadingLocation')
      ?.setValue('', { emitEvent: false });

    this.filteredChargingCountry = [];
    this.currentFilteredChargingCountry = [];

    if (!selectedCountryCode) {
      return;
    }

    this.portsLoading = true;
    this.loadingChargingCountrySubject.next(true);

    this.getChargingPortsByCountry$(selectedCountryCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe((ports) => {
        this.filteredChargingCountry = ports;
        this.currentFilteredChargingCountry = ports;
        this.declarationChargingCountry = ports;

        this.portsLoading = false;
        this.loadingChargingCountrySubject.next(false);
        this.exportationCountryControlError = false;
        this.setChargingCountryControlStatus();
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
        this.showCustomsValuation[i] = false;
        this.updateValuationValidators(i);
      }
    }
  }

  updateValuationValidators(i: number) {
    const supplierInvoice = this.generalDeclarationForm.get(
      'SupplierInvoices',
    ) as FormArray;
    const customsValuation = supplierInvoice
      .at(i)
      .get('CustomsValuation') as FormArray;
    const control = customsValuation.controls[1];
    if (control) {
      const chargesTypeControl = control.get('ChargesTypeCode');
      const otherChargeControl = control.get('OtherChargeDeductionAmount');

      if (this.showCustomsValuation[i]) {
        if (
          chargesTypeControl?.value.name === 'הובלה' &&
          this.showCustomsValuation[i]
        ) {
          otherChargeControl?.setValidators([
            Validators.required,
            Validators.min(1),
          ]);
          otherChargeControl?.setValue(1);
        } else {
          otherChargeControl?.clearValidators();
          otherChargeControl?.setErrors(null);
          otherChargeControl?.setValue(0);
        }
      } else {
        otherChargeControl?.clearValidators();
        otherChargeControl?.setErrors(null);
        otherChargeControl?.setValue(0);
      }
      otherChargeControl?.updateValueAndValidity();
    }
  }

  // filterChargingCountryByExportCode() {
  //   const exportCountryCode = this.generalDeclarationForm
  //     .get('Consignments')
  //     ?.get('ExportationCountryCode')?.value.code;
  //   this.filteredChargingCountry = this.declarationChargingCountry.filter(
  //     (site: any) => site.code.startsWith(exportCountryCode),
  //   );
  //   if (this.filteredChargingCountry.length)
  //     this.isCustomsChargingCountry = true;
  // }

  filterChargingCountryByExportCode() {
    const exportCountryCode = this.generalDeclarationForm
      .get('Consignments')
      ?.get('ExportationCountryCode')?.value?.code;

    if (!exportCountryCode) {
      this.filteredChargingCountry = [];
      this.currentFilteredChargingCountry = [];
      return;
    }

    this.portsLoading = true;
    this.loadingChargingCountrySubject.next(true);

    this.getChargingPortsByCountry$(exportCountryCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe((ports) => {
        this.filteredChargingCountry = ports;
        this.currentFilteredChargingCountry = ports;
        this.declarationChargingCountry = ports;
        this.isCustomsChargingCountry = ports.length > 0;

        this.portsLoading = false;
        this.loadingChargingCountrySubject.next(false);
        this.setChargingCountryControlStatus();
      });
  }

  filterCustomsProcess(event: any) {
    let filtered: any[] = [];
    let query = event.query;

    const allowedOptions = [
      'יבוא אישי',
      'יבוא מסחרי',
      'שטעון מסחרי - שטעון באותו נמל',
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
    this.filteredCountryOfExport = filtered;
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
        preferred.push(a);
      } else if (a.name.indexOf(query) != -1) {
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

      const TransportContractDocumentTypeCode = this.generalDeclarationForm.get(
        'Consignments.TransportContractDocumentTypeCode',
      )?.value.code;

      if (TransportContractDocumentTypeCode == '1') {
        if (
          preferredValues1.includes(a.code) &&
          a.name.indexOf(query) != -1 &&
          a.siteType === '24'
        ) {
          preferred.push(a);
        } else if (a.name.indexOf(query) != -1 && a.siteType === '24') {
          others.push(a);
        }
      } else if (TransportContractDocumentTypeCode == '11') {
        if (
          preferredValues11.includes(a.code) &&
          a.name.indexOf(query) != -1 &&
          a.siteType === '1'
        ) {
          preferred.push(a);
        } else if (a.name.indexOf(query) != -1 && a.siteType === '1') {
          others.push(a);
        }
      } else if (a.name.indexOf(query) != -1) {
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
  i = 0;
  customStatusName(status: any) {
    // if (status ) {
    if (status && status !== this.customStatus) {
      this.customStatus = status;
      if (status == 7) {
        localStorage.setItem('maxIndex', '4');
        this.stepService.updateMaxIndex(4);
      } else {
        localStorage.setItem('maxIndex', '2');
        this.stepService.updateMaxIndex(2);
      }
    }

    if (this.customStatus && this.customsStatuses?.length) {
      for (let i = 0; i < this.customsStatuses.length; i++) {
        let a = this.customsStatuses[i];
        if (a.code == this.customStatus) {
          return a.name;
        }
      }
    } else return 'לא תקין';
  }

  copyDeclaration() {
    console.log('>>> copyDeclaration fired');
    const currentFormValue = this.generalDeclarationForm.getRawValue();

    const copiedData = {
      ...currentFormValue,
      Id: null,
      DeclarationNumber: '',
      VersionID: '',
      CustomsStatus: null,
      AgentFileReferenceID: '',
      DeclarationStatusCode: '',
      ReleaseDateTime: null,
      Consignments: {
        ...currentFormValue.Consignments,
        // ניקוי שדות המטען
        TransportContractDocumentID: '',
        SecondCargoID: '',
        ThirdCargoID: '',
      },
    };
    // debugger;
    // this.generalDeclarationForm.patchValue({
    //   Id: null,
    //   DeclarationNumber: '',
    //   VersionID: '',
    //   CustomsStatus: null,
    //   AgentFileReferenceID: '',
    //   DeclarationStatusCode: '',
    //   ReleaseDateTime: null,
    // });

    this.generalDeclarationForm.patchValue(copiedData);

    localStorage.removeItem('currentDecId');
    localStorage.removeItem('AgentFileReferenceID');

    this.mode = 'n';

    this.isLockedBySbtEvent = false;
    this.applyCombinedLockState();

    // צור מספר תיק חדש מהשרת
    this.customsDataService.GetSeq$('Customs').subscribe((res) => {
      localStorage.setItem('AgentFileReferenceID', res);
      this.generalDeclarationForm.patchValue({
        AgentFileReferenceID: res,
      });
    });

    this.msgs1 = [
      {
        severity: 'success',
        summary: 'success',
        detail: 'ההצהרה הועתקה - לחץ "המשך" כדי לשמור',
      },
    ];
  }

  // ✅ פונקציה חדשה לטעינה והעתקה אוטומטית
  // private loadAndCopyDeclaration() {
  //   const decId = localStorage.getItem('currentDecId');

  //   if (!decId) {
  //     this.loading = false;
  //     return;
  //   }

  //   this.decService.getDeclaration(decId).subscribe((res) => {
  //     if (!res) {
  //       this.loading = false;
  //       return;
  //     }

  //     // ✅ טען את הנתונים לטופס
  //     this.initElements();

  //     // ✅ אחרי הטעינה - הפעל את פונקצ העתקה
  //     setTimeout(() => {
  //       this.copyDeclaration();
  //       localStorage.removeItem('copyMode'); // ✅ נקה את הסימן
  //     }, 500);
  //   });
  // }

  private loadAndCopyDeclaration() {
    console.log('>>> loadAndCopyDeclaration');
    const decId = localStorage.getItem('currentDecId');

    if (!decId) {
      this.loading = false;
      return;
    }

    this.loading = true;

    this.decService
      .getDeclaration(decId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => {
        if (!res) {
          this.loading = false;
          return;
        }

        this.initElementsWithData(res);

        setTimeout(() => {
          this.copyDeclaration();
          localStorage.removeItem('copyMode');
          this.loading = false;
        }, 0);
      });
  }

  goToDeclarationsQuery() {
    // תשני את הנתיב למה שקיים אצלך בפועל
    this.router.navigate(['/dec-query']);
  }

  private formatCustomsErrors(errors: any[]): any[] {
    if (!Array.isArray(errors)) {
      errors = [errors];
    }

    return errors.map((error: any) => {
      const typeCode =
        error?.validationCodeField?.listVersionIDField?.toString?.() ??
        error?.validationCodeField?.listVersionIDField ??
        '1';

      return {
        code: error?.validationCodeField?.valueField ?? '',
        message: error?.validationCodeField?.nameField ?? '',
        typeCode,
        typeName: this.errorTypesMap[typeCode] || 'שגיאה',
        typeClass: this.getErrorClass(typeCode),
      };
    });
  }

  getErrorClass(code: string): string {
    switch (code) {
      case '1':
        return 'type-error';
      case '2':
        return 'type-constraint-submit';
      case '3':
        return 'type-constraint-release';
      case '4':
        return 'type-warning';
      case '5':
        return 'type-critical-warning';
      default:
        return 'type-error';
    }
  }

  private createEvent(eventCode: string, showMessage: boolean = false) {
    // קביעת EntityType לפי סוג ההצהרה
    const decType = localStorage.getItem('decType');
    const typeCode = this.generalDeclarationForm.get('TypeCode')?.value;

    let entityType = '2'; // ברירת מחדל - שטעון

    if (decType === 'regular' || typeCode === '1') {
      entityType = '1'; // יבוא רגיל
    } else if (decType === 'tr' || typeCode === '3') {
      entityType = '2'; // שטעון
    }

    const userDataStr = localStorage.getItem('user');
    let clientName = '';
    let clientId = '';

    if (userDataStr) {
      try {
        const userData = JSON.parse(userDataStr);
        clientName = userData.FirstName || '';
        clientId = userData.Id || '';
      } catch (e) {
        console.error('Failed to parse user data', e);
      }
    }

    // IP adress
    fetch('https://api.ipify.org?format=json')
      .then((response) => response.json())
      .then((data) => {
        const clientIP = data.ip;
        const remarks = `שם לקוח: ${clientName}, ת.ז: ${clientId}, IP: ${clientIP}`;

        const entityEvent = {
          EntityKey: localStorage.getItem('currentDecId') || '',
          EntityType: entityType,
          EventCode: eventCode,
          EventDate: new Date(),
          RegistrationDate: new Date(),
          // UserID: localStorage.getItem('userId') || '',
          UserID: '19',
          Remarks: remarks,
          TimeZone: 0,
          Valid: true,
        };

        this.customsDataService
          .addEntityEvent$(entityEvent)
          .pipe(takeUntil(this.destroy$))
          .subscribe((res) => console.log(res));

        if (showMessage) {
          this.msgs1 = [
            {
              severity: 'info',
              summary: '',
              detail: 'התיק נשלח לסווג טרם שליחה למכס',
            },
          ];
        }
      })
      .catch((err) => {
        console.error('Failed to get IP', err);
        // שלח בלי IP במקרה של שגיאה
        const remarks = `שם לקוח: ${clientName}, ת.ז: ${clientId}, IP: לא זמין`;

        const entityEvent = {
          EntityKey: localStorage.getItem('currentDecId') || '',
          EntityType: '2',
          EventCode: eventCode,
          EventDate: new Date(),
          RegistrationDate: new Date(),
          UserID: '19',
          Remarks: remarks,
          TimeZone: 0,
          Valid: true,
        };

        this.customsDataService
          .addEntityEvent$(entityEvent)
          .pipe(takeUntil(this.destroy$))
          .subscribe((res) => console.log(res));
      });
    if (showMessage) {
      this.msgs1 = [
        {
          severity: 'info',
          summary: '',
          detail: 'התיק נשלח לסווג טרם שליחה למכס',
        },
      ];
    }
  }

  private getChargingPortsByCountry$(countryCode: string): Observable<any[]> {
    const normalizedCode = String(countryCode || '')
      .trim()
      .toUpperCase();

    if (!normalizedCode) {
      return of([]);
    }

    const cacheKey = `chargingPorts_${normalizedCode}`;

    if (this.chargingCountryByCountryCache.has(cacheKey)) {
      return this.chargingCountryByCountryCache.get(cacheKey)!;
    }

    const fromLocalStorage = localStorage.getItem(cacheKey);
    if (fromLocalStorage) {
      const parsed = JSON.parse(fromLocalStorage);

      parsed.forEach((item: any) =>
        this.chargingCountryMap.set(item.code, item),
      );

      const obs$ = of(parsed).pipe(shareReplay(1));
      this.chargingCountryByCountryCache.set(cacheKey, obs$);
      return obs$;
    }

    const req$ = this.customsDataService
      .getChargingPortsByCountry$(normalizedCode)
      .pipe(
        // map((res: any[]) =>
        //   res
        //     .map((item: any) => {
        //       const raw = item.Value2 || item.Value1 || '';
        //       const code = this.extractPortCode(raw);

        //       return {
        //         code,
        //         name: code,
        //         fullName: raw,
        //       };
        //     })
        //     .filter((x: any) => x.code),
        // ),
        map((res: any[]) => {
          const ports = res
            .map((item: any) => {
              const raw = item.Value2 ?? item.Value1 ?? '';
              const code = this.extractPortCode(raw);

              return {
                code,
                name: code,
                // fullName: raw,
              };
            })
            .filter((x: any) => x.code);

          return ports;
        }),
        tap((ports) => {
          localStorage.setItem(cacheKey, JSON.stringify(ports));
          ports.forEach((item: any) =>
            this.chargingCountryMap.set(item.code, item),
          );
        }),
        shareReplay(1),
      );

    this.chargingCountryByCountryCache.set(cacheKey, req$);
    return req$;
  }

  // private extractPortCode(value: string): string {
  //   if (!value) return '';

  //   const parts = String(value).trim().split(/\s+/);
  //   const codePart = parts.find((p) =>
  //     /^[A-Z]{2}[A-Z0-9]{3}$/.test(p.toUpperCase()),
  //   );

  //   return codePart ? codePart.toUpperCase() : '';
  // }

  private extractPortCode(value: string): string {
    if (!value) return '';

    const code = value.substring(0, 5).toUpperCase();

    if (/^[A-Z]{2}[A-Z0-9]{3}$/.test(code)) {
      return code;
    }

    return '';
  }

  private checkIfLockedBySbtEvent(): void {
    const decId = localStorage.getItem('currentDecId');
    if (!decId) {
      this.isLockedBySbtEvent = false;
      this.applyCombinedLockState();
      return;
    }

    this.customsDataService
      .hasValidSbtEvent$('1', decId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.isLockedBySbtEvent = res?.isLocked === true;
          this.applyCombinedLockState();
        },
        error: () => {
          this.isLockedBySbtEvent = false;
          this.applyCombinedLockState();
        },
      });
  }

  private applyCombinedLockState(): void {
    const currentCustomsStatus =
      this.generalDeclarationForm?.get('CustomsStatus')?.value;

    const shouldLock =
      this.isLockedByBrokerRouting ||
      this.isLockedBySbtEvent ||
      currentCustomsStatus === 3;

    this.isLocked = shouldLock;
    this.formDisabled = shouldLock;

    if (shouldLock) {
      this.generalDeclarationForm.disable({ emitEvent: false });
    } else {
      this.generalDeclarationForm.enable({ emitEvent: false });
      this.setChargingCountryControlStatus();
    }
  }

  private refreshSendButtonVisibility(declarationId: string | null): void {
    if (!declarationId) {
      this.showBtnCustoms = false;
      return;
    }

    this.documentsService
      .hasDocumentsForDeclaration$(declarationId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((hasDocs) => {
        this.showBtnCustoms = hasDocs;
      });
  }

  get selectedCargoFieldLabels() {
    const selectedCode = this.generalDeclarationForm.get(
      'Consignments.TransportContractDocumentTypeCode',
    )?.value?.code;

    return (
      this.cargoFieldLabelsMap[selectedCode] || {
        year: 'שנה',
        main: 'מזהה מטען ראשי',
        inner: 'מזהה מטען פנימי',
      }
    );
  }

  get isCargoType17(): boolean {
    return (
      this.generalDeclarationForm.get(
        'Consignments.TransportContractDocumentTypeCode',
      )?.value?.code === '17'
    );
  }

  filterCargoYearOptionsForCode17(event: any) {
    const query = (event.query || '').toLowerCase();

    this.filteredCargoCompanyOptionsForCode17 =
      this.cargoCompanyOptionsForCode17.filter(
        (item) => item.name && item.name.toLowerCase().includes(query),
      );
  }

  private updateSecondCargoIDValidators(
    cargoTypeCode: string | undefined,
  ): void {
    const secondControl = this.generalDeclarationForm.get(
      'Consignments.SecondCargoID',
    );

    if (!secondControl) return;

    if (cargoTypeCode === '1') {
      secondControl.setValidators([
        Validators.required,
        Validators.minLength(11),
        Validators.maxLength(12),
      ]);
    } else {
      secondControl.setValidators([Validators.required]);
    }

    secondControl.updateValueAndValidity({ emitEvent: false });
  }

  get showThirdCargoField(): boolean {
    const cargoTypeCode = this.generalDeclarationForm?.get(
      'Consignments.TransportContractDocumentTypeCode',
    )?.value?.code;

    return !['11', '2', '3'].includes(String(cargoTypeCode));
  }

  filterCargoCompanyOptionsForCode17(event: any) {
    const query = (event.query || '').toLowerCase();

    this.filteredCargoCompanyOptionsForCode17 =
      this.cargoCompanyOptionsForCode17.filter(
        (item) => item.name && item.name.toLowerCase().includes(query),
      );
  }
  private buildCourierLookupKey(
    cargoType: string,
    waybillNumber: string,
    courierId: string,
  ): string {
    return `${cargoType}|${waybillNumber}|${courierId}`;
  }

  private updateThirdCargoFieldState(cargoTypeValue: any): void {
    const cargoTypeCode = cargoTypeValue?.code ?? cargoTypeValue;

    const thirdControl = this.generalDeclarationForm.get(
      'Consignments.ThirdCargoID',
    );

    if (!thirdControl) return;

    if (String(cargoTypeCode) === '17') {
      thirdControl.disable({ emitEvent: false });
    } else {
      thirdControl.enable({ emitEvent: false });
    }

    thirdControl.updateValueAndValidity({ emitEvent: false });
  }

  triggerCourierLookupIfNeeded(): void {
    if (this.isInitializingDeclaration) {
      return;
    }

    const consignments = this.generalDeclarationForm.get(
      'Consignments',
    ) as FormGroup;

    if (!consignments) return;

    const cargoType =
      consignments.get('TransportContractDocumentTypeCode')?.value?.code ??
      consignments.get('TransportContractDocumentTypeCode')?.value;

    if (String(cargoType) !== '17') {
      return;
    }

    const waybillNumber =
      consignments.get('TransportContractDocumentID')?.value?.code ??
      consignments.get('TransportContractDocumentID')?.value;

    const courierId =
      consignments.get('SecondCargoID')?.value?.code ??
      consignments.get('SecondCargoID')?.value;

    const thirdKeyControl = consignments.get('ThirdCargoID');

    const normalizedWaybill = String(waybillNumber || '').trim();
    const normalizedCourierId = String(courierId || '').trim();

    if (!normalizedWaybill || !normalizedCourierId || !thirdKeyControl) {
      return;
    }

    const lookupKey = this.buildCourierLookupKey(
      String(cargoType),
      normalizedWaybill,
      normalizedCourierId,
    );

    if (lookupKey === this.lastCourierLookupKey) {
      return;
    }

    this.lastCourierLookupKey = lookupKey;
    this.courierLookupLoading = true;

    thirdKeyControl.enable({ emitEvent: false });
    thirdKeyControl.setValue('', { emitEvent: false });

    this.courierService
      .getThirdKey$(normalizedWaybill, normalizedCourierId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.courierLookupLoading = false;

          if (res?.responseContentHeaderField?.exceptionField?.length) {
            thirdKeyControl.enable({ emitEvent: false });
            thirdKeyControl.setValue('', { emitEvent: false });
            return;
          }

          const returnedDate =
            res?.courierCargosField?.[0]?.cargoIdentifierKey3Field ??
            res?.courierCargosField?.[0]?.cargoIdentifierKey3 ??
            '';

          if (returnedDate) {
            thirdKeyControl.setValue(returnedDate, { emitEvent: false });
            thirdKeyControl.disable({ emitEvent: false });
          } else {
            thirdKeyControl.enable({ emitEvent: false });
            thirdKeyControl.setValue('', { emitEvent: false });
          }
        },
        error: (error) => {
          console.error('Courier lookup failed', error);
          this.courierLookupLoading = false;
          thirdKeyControl.enable({ emitEvent: false });
          thirdKeyControl.setValue('', { emitEvent: false });
        },
      });
  }

  formatCourierCreationDate(value: string | null | undefined): string {
    const raw = String(value || '').trim();

    if (!/^\d{6}$/.test(raw)) {
      return raw;
    }

    const day = raw.substring(0, 2);
    const month = raw.substring(2, 4);
    const year = raw.substring(4, 6);

    return `${day}/${month}/${year}`;
  }

  loadCourierCompanies(): void {
    this.courierService.getCourierCompanies$().subscribe({
      next: (res: any[]) => {
        this.cargoCompanyOptionsForCode17 = (res || []).map((company: any) => ({
          name: company.Name,
          code: company.Code,
        }));
      },
      error: (err) => {
        console.error('Failed to load courier companies', err);
        this.cargoCompanyOptionsForCode17 = [];
      },
    });
  }
}
