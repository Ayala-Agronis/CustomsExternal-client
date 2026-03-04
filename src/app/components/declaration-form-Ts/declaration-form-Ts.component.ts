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
import { shareReplay, take } from 'rxjs/operators';
import { CheckboxModule } from 'primeng/checkbox';
import { ClientClassificationService } from '../../shared/services/client-classification.service';
import { DocumentService } from '../../shared/services/document.service';
import { CargoContext } from '../../shared/models/cargo-context.model';

@Component({
  selector: 'app-declaration-form-Ts',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TabViewModule,
    TooltipModule,
    CheckboxModule,
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
  ],
  templateUrl: './declaration-form-Ts.component.html',
  styleUrl: './declaration-form-Ts.component.scss',
  providers: [ConfirmationService, MessageService],
})
export class DeclarationFormTsComponent implements OnInit {
  generalDeclarationForm!: FormGroup;

  // ✅ הוסף את ה-Maps האלה:
  private countryMap = new Map<string, any>();
  private currencyMap = new Map<string, any>();
  private facilityMap = new Map<string, any>();
  private supplierMap = new Map<string, any>();
  private unpackingSiteMap = new Map<string, any>();
  private chargingCountryMap = new Map<string, any>();
  private cargoTypeMap = new Map<string, any>();
  private customsProcessMap = new Map<string, any>();
  private tradeTermsMap = new Map<string, any>();
  private invoiceTypeMap = new Map<string, any>();
  private issueLocationMap = new Map<string, any>();
  private roleCodeMap = new Map<string, any>();

  filteredCustomsProcess: any[] = [];
  filteredRecipientCountries: any[] = [];
  recipientCountries: any[] = [];
  filteredCountryOfExport: any[] = [];
  filteredDestinationCountry: any[] = [];
  filteredChargingCountry: any[] = [];
  filteredUnpackingSite: any[] = [];
  currentFilteredChargingCountry: any[] = [];
  filteredCargoIDType: any[] = [];
  filteredCurrencyCode: any[] = [];
  filteredTradeTermsConditionCode: any[] = [];
  filteredInvoiceTypeCode: any[] = [];
  filteredSupplierID: any[] = [];
  filteredFacilityType: any[] = [];
  filteredTypeCode: any[] = [];
  filteredRoleCode: any[] = [];
  filteredIssueLocation: any[] = [];

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
  declarationDestinationCountry: any = { name: '', code: '' };
  declarationCargoIDType: any;
  declarationTypeCode: any = { name: '', code: '' };
  declarationCurrencyCode: any;
  declarationTradeTermsConditionCode: any;
  declarationLogisticStatus: any;
  declarationSupplierID: any;
  declarationInvoiceTypeCode: any;
  declarationFacilityID: any;
  declarationIssueLocation: any;
  declarationRoleCode: any;

  ExportationCountrySelect: any;

  columns: any;
  classificationOptions: { name: string; value: string }[] = [];

  private loadingChargingCountrySubject = new BehaviorSubject<boolean>(true);
  loadingChargingCountry$ = this.loadingChargingCountrySubject.asObservable();

  isCustomsChargingCountry: boolean = false;
  declarationUnpackingSite: any;
  declarationUnpackingSite2: any;

  exportationCountryControlError: any = true;
  perfectDecalartion: any;
  mode: any;
  declarationType: string = 'import';
  customStatus: any;
  customsStatuses: any;

  showBtnCustoms = true;
  loading: boolean = false;
  isLocked: boolean = false;
  msgs1: Message[] = [];
  customsErrorsContent: any;
  customsError: any;
  formErrorsMessage: string = '';

  private destroy$ = new Subject<void>();
  secondCargoIDError: any;
  showCustomsValuation: boolean[] = [];
  fieldLabels: any = {
    // משגור יבוא
    ImporterID: 'מזהה יבואן',
    CustomsProcess: 'תהליך מכס',
    DestinationCountry: 'מדינת יעד ',
    RecipientName: 'שם מקבל',
    RecipientAddress: 'כתובת מקבל',
    RecipientIssueLocation: 'מדינת מקבל',
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
    BuyerAddress: 'כתובת קונה',
    BuyerName: 'שם קונה',
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
    OriginCountryCode: 'ארץ מקור',
  };

  suplierErrorExist: boolean = false;
  suplierError: string = '';
  issueLocationSelect: any;
  roleCodeSelect: any;
  CustomsStatus: any;
  formDisabled: boolean = false;
  filteredClassification: { name: string; value: string }[] = [];
  unclassified: boolean = false;
  documents: any;
  sendToCustoms: any;

  constructor(
    private formBuilder: FormBuilder,
    private documentsService: DocumentService,
    private classificationService: ClientClassificationService,
    private route: ActivatedRoute,
    private router: Router,
    private cd: ChangeDetectorRef,
    private confirmationService: ConfirmationService,
    private customsDataService: CustomsDataService,
    private decService: DeclarationService,
    private stepService: StepService,
    private paymentService: PaymentService,
  ) {}

  private cache = new Map<string, Observable<any[]>>();

  getCachedTable$(
    tableId: string,
    mapFn: (item: any) => any,
  ): Observable<any[]> {
    console.time(`getCachedTable$ ${tableId}`);

    if (!this.cache.has(tableId)) {
      console.time(`getCachedTable$ ${tableId}`);

      const req$ = this.customsDataService.getCustomsTableValues$(tableId).pipe(
        map((res) => res.map(mapFn)),
        tap({
          next: (res) =>
            console.log(`[getCachedTable$ ${tableId}] rows:`, res.length),
          error: (err) =>
            console.error(`[getCachedTable$ ${tableId}] error:`, err),
          complete: () => console.timeEnd(`getCachedTable$ ${tableId}`),
        }),
        shareReplay(1),
      );

      this.cache.set(tableId, req$);
    } else {
      console.log(`[getCachedTable$ ${tableId}] cache hit`);
      console.timeEnd(`getCachedTable$ ${tableId}`);
    }

    return this.cache.get(tableId)!;
  }

  ngOnInit(): void {
    console.time('ngOnInit TOTAL');
    console.log('ngOnInit start', new Date().toISOString());

    this.columns = ['מוצר מיובא *', 'כמות *', 'ערך טובין *', 'ארץ מקור *'];

    /* =========================
       Query Params
    ========================= */
    console.time('queryParams subscribe');

    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        console.timeLog('queryParams subscribe', 'params arrived');
        console.log('queryParams', params);

        this.mode = params['Mode'];
        this.sendToCustoms = params['Send'];
        this.declarationType = params['type'] || 'import';

        // ✅ טיפול במצב העתקה
        if (this.mode === 'copy') {
          this.loading = true;
          this.loadAndCopyDeclaration();
          return;
        }

        if (this.mode !== 'e') {
          localStorage.removeItem('currentDecId');
          localStorage.removeItem('AgentFileReferenceID');
          this.customsDataService
            .GetSeq$('Customs')
            .pipe(takeUntil(this.destroy$))

            .subscribe((seq) => {
              localStorage.setItem('AgentFileReferenceID', seq);
              this.generalDeclarationForm.patchValue(
                { AgentFileReferenceID: seq },
                { emitEvent: false },
              );
            });
        } else {
          this.loading = true;
        }

        console.log('mode/send/type', {
          mode: this.mode,
          sendToCustoms: this.sendToCustoms,
          declarationType: this.declarationType,
          currentDecId: localStorage.getItem('currentDecId'),
        });

        // ✅ הוסף את זה כאן - הפעל loading מיד אם זה עריכה
        if (this.mode === 'e') {
          this.loading = true; // ✅ הפעל spinner מיד!
        }

        // if (this.mode !== 'e') {
        //   console.time('initForm (mode !== e)');
        //   this.initForm();
        //   console.timeEnd('initForm (mode !== e)');

        //   this.customsError = '';
        //   this.customsErrorsContent = '';

        //   console.time('GetSeq Customs');
        //   this.customsDataService.GetSeq$('Customs')
        //     .pipe(
        //       tap(res => {
        //         localStorage.setItem('AgentFileReferenceID', res);
        //         console.timeEnd('GetSeq Customs');
        //       })
        //     )
        //     .subscribe();
        // }

        if (params['customsSend'] === 'true') {
          this.msgs1 = [
            {
              severity: 'success',
              summary: 'תשלום עמלה בוצע בהצלחה ',
              detail: 'ניתן לשלוח טיוטה למכס',
            },
          ];
        }

        console.timeEnd('queryParams subscribe');
      });

    /* =========================
       initForm (global)
    ========================= */
    console.time('initForm (global)');
    this.initForm();
    console.timeEnd('initForm (global)');

    // ✅ כל שינוי בארץ יצוא במשגור יבוא -> מעדכן ארץ יצוא בחשבונית
    // this.generalDeclarationForm
    //   .get('Consignments.ExportationCountryCode')
    //   ?.valueChanges
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe((country) => {
    //     const supplierInvoices = this.generalDeclarationForm.get('SupplierInvoices') as FormArray;
    //     if (!supplierInvoices?.length) return;

    //     // אם את רוצה רק חשבונית ראשונה:
    //     supplierInvoices.at(0).get('LocationID')?.patchValue(country, { emitEvent: false });

    //     // אם את רוצה שכל החשבוניות יתעדכנו — החליפי את השורה מעל בלולאה:
    //     // supplierInvoices.controls.forEach(inv =>
    //     //   inv.get('LocationID')?.patchValue(country, { emitEvent: false })
    //     // );
    //   });

    this.generalDeclarationForm
      .get('Consignments.ExportationCountryCode')
      ?.valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((country: any) => {
        const supplierInvoices = this.generalDeclarationForm.get(
          'SupplierInvoices',
        ) as FormArray;
        if (!supplierInvoices?.length) return;

        const normalized = country?.code
          ? country
          : country
            ? { code: String(country), name: String(country) }
            : { code: '', name: '' };

        // ✅ רק חשבונית ראשונה
        supplierInvoices
          .at(0)
          .get('LocationID')
          ?.patchValue(normalized, { emitEvent: false });
      });

    this.deferFormErrorsMessageUpdate();
    this.generalDeclarationForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.deferFormErrorsMessageUpdate();
      });

    /* =========================
       loadClassificationData
    ========================= */
    console.time('loadClassificationData');
    this.loadClassificationData();
    console.timeEnd('loadClassificationData');

    /* =========================
       packageData$
    ========================= */
    console.time('packageData$ subscribe');

    this.decService.packageData$
      .pipe(takeUntil(this.destroy$))
      .subscribe((data) => {
        console.timeLog('packageData$ subscribe', 'data received');

        if (data) {
          console.time('patchValue cargo');

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
            LoadingLocation2: data.unloadingLocation,
            ExportationCountryCode: data.ExportationCountryCode,
            LoadingLocation: data.LoadingLocation,
          });

          console.timeEnd('patchValue cargo');
        }
      });

    /* =========================
       forkJoin tables
    ========================= */
    console.time('forkJoin TABLES');

    forkJoin({
      customsProcess: this.getCachedTable$('1354', (i) => ({
        name: i.Value2,
        code: i.Value1,
      })),
      customsStatuses: this.getCachedTable$('1981', (i) => ({
        name: i.Value2,
        code: i.Value1,
      })),
      declarationTypeCode: this.getCachedTable$('1091', (i) => ({
        name: i.Value2,
        code: i.Value1,
      })),
      cargoIdType: this.getCachedTable$('1259', (i) => ({
        name: i.Value2,
        code: i.Value1,
      })),
      declarationCurrencyCode: this.getCachedTable$('1144', (i) => ({
        name: i.Value2,
        code: i.Value1,
      })),
      declarationTradeTermsConditionCode: this.getCachedTable$('1426', (i) => ({
        name: i.Value2,
        code: i.Value1,
      })),
      declarationLogisticStatus: this.getCachedTable$('1380', (i) => ({
        name: i.Value2,
        code: i.Value1,
      })),
      declarationInvoiceTypeCode: this.getCachedTable$('1404', (i) => ({
        name: i.Value2,
        code: i.Value1,
      })),
      destinationCountries: this.getCachedTable$('1136', (i) => ({
        name: `${i.Value2.substring(0, 7)} (${i.Value1})`,
        code: i.Value1,
      })),
      recipientCountries: this.getCachedTable$('1136', (i) => ({
        name: `${i.Value2.substring(0, 7)} (${i.Value1})`,
        code: i.Value1,
      })),
      declarationIssueLocation: this.getCachedTable$('1136', (i) => ({
        name: `${i.Value2.substring(0, 7)} (${i.Value1})`,
        code: i.Value1,
      })),
      declarationRoleCode: this.getCachedTable$('23784', (i) => ({
        name: i.Value2,
        code: i.Value1,
      })),
      facilityId: this.getCachedTable$('2012', (i) => ({
        name: `${i.Value2.substring(0, 7)} (${i.Value1})`,
        code: i.Value1,
        siteType: i.Value7,
      })),
      // ...existing code...

      suppliers: this.customsDataService.getVendor$().pipe(
        tap((res) => {
          console.group('🏪 SUPPLIERS API RESPONSE');
          console.log('📊 Total suppliers:', res.length);
          console.log('🔍 First 3 suppliers:', res.slice(0, 3));

          const targetSupplier = res.find(
            (s: any) => s.VendorID === '2056009' || s.VendorID === 2056009,
          );

          console.log('🎯 Looking for supplier 2056009:', targetSupplier);

          if (res[0]) {
            console.log('📋 Supplier object structure:', {
              keys: Object.keys(res[0]),
              sample: res[0],
            });
          }

          console.groupEnd();
        }),
        map((res) =>
          res.map((i: any) => ({
            name: i.VendorName,
            code: String(i.VendorID), // ✅ המרה ל-string!
          })),
        ),
      ),
      // ✅ הוסף טעינת ההצהרה במקביל!
      declaration:
        this.mode === 'e'
          ? this.decService.getDeclaration(
              localStorage.getItem('currentDecId') || '',
            )
          : of(null),
    })
      .pipe(takeUntil(this.destroy$))

      .subscribe((res) => {
        console.timeEnd('forkJoin TABLES');
        console.log('✅ forkJoin result keys:', Object.keys(res));

        console.time('assign TABLES');
        this.buildMaps(res);

        // ✅✅✅ הדפס את כל הנתונים מהשרת:
        console.group('🔍 SERVER DATA INSPECTION');

        if (res.declaration) {
          console.log('📦 Declaration from server:', res.declaration);
          console.log('🏢 SupplierInvoices:', res.declaration.SupplierInvoices);
          console.log(
            '📍 Consignments:',
            res.declaration.ConsignmentPackagesMeasures,
          );

          // בדיקת נמל פריקה ייצוא
          const exportConsignment =
            res.declaration.ConsignmentPackagesMeasures?.[1]?.Consignments;
          if (exportConsignment) {
            console.log('🚢 Export Consignment UnloadingLocationID:', {
              value: exportConsignment.UnloadingLocationID,
              exists_in_unpackingSiteMap: this.unpackingSiteMap.has(
                exportConsignment.UnloadingLocationID,
              ),
              exists_in_chargingCountryMap: this.chargingCountryMap.has(
                exportConsignment.UnloadingLocationID,
              ),
            });
          }

          // בדיקת ספקים
          if (res.declaration.SupplierInvoices?.[0]) {
            const firstInvoice = res.declaration.SupplierInvoices[0];
            console.log('👤 First Supplier:', {
              SupplierID: firstInvoice.SupplierID,
              exists_in_supplierMap: this.supplierMap.has(
                firstInvoice.SupplierID,
              ),
              supplier_from_map: this.supplierMap.get(firstInvoice.SupplierID),
            });
          }
        }

        console.log('🗺️ Map sizes:', {
          supplierMap: this.supplierMap.size,
          chargingCountryMap: this.chargingCountryMap.size,
          unpackingSiteMap: this.unpackingSiteMap.size,
          countryMap: this.countryMap.size,
        });

        console.groupEnd();

        console.timeEnd('assign TABLES');

        this.declarationCustomsProcess = res.customsProcess;
        this.customsStatuses = res.customsStatuses;
        this.declarationTypeCode = res.declarationTypeCode;
        this.declarationCargoIDType = res.cargoIdType;
        this.declarationCurrencyCode = res.declarationCurrencyCode;
        this.declarationTradeTermsConditionCode =
          res.declarationTradeTermsConditionCode;
        this.declarationLogisticStatus = res.declarationLogisticStatus;
        this.declarationInvoiceTypeCode = res.declarationInvoiceTypeCode;

        this.declarationDestinationCountry = res.destinationCountries;
        this.recipientCountries = res.recipientCountries;
        this.filteredRecipientCountries = [...res.recipientCountries];

        this.declarationIssueLocation = res.declarationIssueLocation;
        this.declarationRoleCode = res.declarationRoleCode;
        this.declarationFacilityID = res.facilityId;
        this.declarationSupplierID = res.suppliers;

        console.timeEnd('assign TABLES');

        // ✅ לזה (עם subscribe):
        console.time('consignmentInit');
        this.consignmentInit()
          .pipe(takeUntil(this.destroy$))

          .subscribe(() => {
            console.timeEnd('consignmentInit');

            // ✅ עכשיו initElements רץ רק אחרי שכל הנתונים נטענו!
            if (this.mode === 'e') {
              console.time('initElements');
              localStorage.setItem('maxIndex', '1');
              this.customStatus = localStorage.getItem('CustomsStatus');
              this.initElementsWithData(res.declaration);
              console.timeEnd('initElements');
            }
          });
        // forkJoin({
        //   customsProcess: this.getCachedTable$('1354', i => ({ name: i.Value2, code: i.Value1 })),
        //   customsStatuses: this.getCachedTable$('1981', i => ({ name: i.Value2, code: i.Value1 })),
        //   declarationTypeCode: this.getCachedTable$('1091', i => ({ name: i.Value2, code: i.Value1 })),
        //   cargoIdType: this.getCachedTable$('1259', i => ({ name: i.Value2, code: i.Value1 })),
        //   declarationCurrencyCode: this.getCachedTable$('1144', i => ({ name: i.Value2, code: i.Value1 })),
        //   declarationTradeTermsConditionCode: this.getCachedTable$('1426', i => ({ name: i.Value2, code: i.Value1 })),
        //   declarationLogisticStatus: this.getCachedTable$('1380', i => ({ name: i.Value2, code: i.Value1 })),
        //   declarationInvoiceTypeCode: this.getCachedTable$('1404', i => ({ name: i.Value2, code: i.Value1 })),
        //   destinationCountries: this.getCachedTable$('1136', i => ({
        //     name: `${i.Value2.substring(0, 7)} (${i.Value1})`,
        //     code: i.Value1
        //   })),
        //   recipientCountries: this.getCachedTable$('1136', i => ({
        //     name: `${i.Value2.substring(0, 7)} (${i.Value1})`,
        //     code: i.Value1
        //   })),
        //   declarationIssueLocation: this.getCachedTable$('1136', i => ({
        //     name: `${i.Value2.substring(0, 7)} (${i.Value1})`,
        //     code: i.Value1
        //   })),
        //   declarationRoleCode: this.getCachedTable$('23784', i => ({ name: i.Value2, code: i.Value1 })),
        //   facilityId: this.getCachedTable$('2012', i => ({
        //     name: `${i.Value2.substring(0, 7)} (${i.Value1})`,
        //     code: i.Value1,
        //     siteType: i.Value7
        //   })),
        //   suppliers: this.customsDataService.getVendor$().pipe(
        //     map(res => res.map((i: any) => ({
        //       name: i.VendorName,
        //       code: i.VendorID
        //     })))
        //   )
        // })
        //   .subscribe(res => {
        //     console.timeEnd('forkJoin TABLES');

        //     console.time('assign TABLES');

        //     // ✅ הוסף את השורה הזאת לפני ה-assign:
        //     this.buildMaps(res);

        //     this.declarationCustomsProcess = res.customsProcess;
        //     this.customsStatuses = res.customsStatuses;
        //     this.declarationTypeCode = res.declarationTypeCode;
        //     this.declarationCargoIDType = res.cargoIdType;
        //     this.declarationCurrencyCode = res.declarationCurrencyCode;
        //     this.declarationTradeTermsConditionCode = res.declarationTradeTermsConditionCode;
        //     this.declarationLogisticStatus = res.declarationLogisticStatus;
        //     this.declarationInvoiceTypeCode = res.declarationInvoiceTypeCode;

        //     this.declarationDestinationCountry = res.destinationCountries;
        //     this.recipientCountries = res.recipientCountries;
        //     this.filteredRecipientCountries = [...res.recipientCountries];

        //     this.declarationIssueLocation = res.declarationIssueLocation;
        //     this.declarationRoleCode = res.declarationRoleCode;
        //     this.declarationFacilityID = res.facilityId;
        //     this.declarationSupplierID = res.suppliers;

        //     console.timeEnd('assign TABLES');

        //     console.time('consignmentInit');
        //     this.consignmentInit();
        //     console.timeEnd('consignmentInit');

        //     if (this.mode === 'e') {
        //       console.time('initElements');
        //       localStorage.setItem('maxIndex', '1');
        //       this.customStatus = localStorage.getItem('CustomsStatus');
        //       this.initElements();
        //       console.timeEnd('initElements');
        //     }
        //   });
      });
    console.timeEnd('ngOnInit TOTAL');
  }

  // ✅ הוסף את הפונקציה הזאת אחרי ngOnInit:
  private buildMaps(data: any): void {
    console.time('🗺️ Building Maps');

    // מדינות
    data.destinationCountries?.forEach((item: any) =>
      this.countryMap.set(item.code, item),
    );

    // מטבעות
    data.declarationCurrencyCode?.forEach((item: any) =>
      this.currencyMap.set(item.code, item),
    );

    // מתקנים
    data.facilityId?.forEach((item: any) =>
      this.facilityMap.set(item.code, item),
    );

    // ✅ ספקים - המרה ל-string
    data.suppliers?.forEach((item: any) =>
      this.supplierMap.set(String(item.code), item),
    );

    // תנאי מסחר
    data.declarationTradeTermsConditionCode?.forEach((item: any) =>
      this.tradeTermsMap.set(item.code, item),
    );

    // סוגי חשבונית
    data.declarationInvoiceTypeCode?.forEach((item: any) =>
      this.invoiceTypeMap.set(item.code, item),
    );

    // תהליכי מכס
    data.customsProcess?.forEach((item: any) =>
      this.customsProcessMap.set(item.code, item),
    );

    // מיקומי הנפקה
    data.declarationIssueLocation?.forEach((item: any) =>
      this.issueLocationMap.set(item.code, item),
    );

    // קודי תפקיד
    data.declarationRoleCode?.forEach((item: any) =>
      this.roleCodeMap.set(item.code, item),
    );

    // אתרי פריקה לייצוא
    this.declarationUnpackingSite2?.forEach((item: any) =>
      this.unpackingSiteMap.set(item.code, item),
    );

    // ✅ הוסף את זה - אתרי פריקה (נוסף גם ל-unpackingSiteMap)
    data.recipientCountries?.forEach((item: any) =>
      this.chargingCountryMap.set(item.code, item),
    );

    console.timeEnd('🗺️ Building Maps');
  }

  // הוסף אחרי buildMaps:
  // החלף את initElementsWithData:
  private initElementsWithData(currentDec: any) {
    // ✅ תמיד לשמור את ההצהרה שנפתחה
    localStorage.setItem('currentDec', JSON.stringify(currentDec));
    localStorage.setItem('currentDecId', currentDec?.Id);

    // ואם את רוצה לוודא גם:
    localStorage.setItem(
      'AgentFileReferenceID',
      currentDec?.AgentFileReferenceID,
    );

    console.time('⏱️ initElements TOTAL');
    this.loading = true;

    if (!currentDec) {
      this.loading = false;
      return;
    }

    console.time('📝 Populate Form');

    this.CustomsStatus = currentDec.CustomsStatus;

    if (this.CustomsStatus == 3) {
      this.formDisabled = true;
      this.generalDeclarationForm.disable();
    }

    // ✅ קודם כל - בנה את ה-Maps מהנתונים הקיימים
    this.declarationChargingCountry?.forEach((item: any) =>
      this.chargingCountryMap.set(item.code, item),
    );

    this.declarationCountryOfExport?.forEach((item: any) =>
      this.countryMap.set(item.code, item),
    );

    // ✅ עדכון כללי - בלוק אחד
    this.generalDeclarationForm.patchValue(
      {
        AgentFileReferenceID: currentDec.AgentFileReferenceID,
        DeclarationNumber: currentDec.DeclarationNumber,
        VersionID: currentDec.VersionID,
        ImporterID: currentDec.ImporterID,
        CustomsStatus: currentDec.CustomsStatus,
        LogisticStatusCode: currentDec.LogisticStatusCode,
        RecipientName: currentDec.RecipientName,
        RecipientAddress: currentDec.RecipientAddress,
        RecipientIssueLocation: this.countryMap.get(
          currentDec.RecipientIssueLocation,
        ),
        DestinationCountry: this.countryMap.get(currentDec.DestinationCountry),
        GovernmentProcedure: this.customsProcessMap.get(
          currentDec.GovernmentProcedure,
        ),
      },
      { emitEvent: false },
    );

    localStorage.setItem(
      'AgentFileReferenceID',
      currentDec.AgentFileReferenceID,
    );

    // ✅ קודם כל עדכן את declarationUnpackingSite2 (לפני Consignment!)
    if (currentDec.DestinationCountry) {
      this.filterUnpackingSiteByDestinationCountry(
        currentDec.DestinationCountry,
      );
    }

    // ✅ Consignment
    const currentConsignment =
      currentDec.ConsignmentPackagesMeasures?.[0]?.Consignments;

    if (currentConsignment) {
      // ✅ סדר חשוב: קודם סט את ה-ExportationCountryCode, אחר כך הפעל פילטר

      const consignmentForm = this.generalDeclarationForm.get('Consignments');

      // // ✅ בדוק אם למפות יש את הנתונים
      // const exportCountryObj = this.countryMap.get(currentConsignment.ExportationCountryCode) ||
      //   { code: currentConsignment.ExportationCountryCode, name: currentConsignment.ExportationCountryCode };

      // const chargingCountryObj = this.chargingCountryMap.get(currentConsignment.LoadingLocation) ||
      //   { code: currentConsignment.LoadingLocation, name: currentConsignment.LoadingLocation };

      // const unpackingSiteObj = this.unpackingSiteMap.get(currentConsignment.UnloadingLocationID) ||
      //   { code: currentConsignment.UnloadingLocationID, name: currentConsignment.UnloadingLocationID };

      // const cargoTypeObj = this.cargoTypeMap.get(currentConsignment.TransportContractDocumentTypeCode) ||
      //   { code: currentConsignment.TransportContractDocumentTypeCode, name: currentConsignment.TransportContractDocumentTypeCode };

      // consignmentForm?.patchValue({
      //   ExportationCountryCode: exportCountryObj,
      //   LoadingLocation: chargingCountryObj,
      //   UnloadingLocationID: unpackingSiteObj,
      //   TransportContractDocumentTypeCode: cargoTypeObj,
      //   FacilityType: this.facilityMap.get(
      //     currentConsignment.ConsignmentRegisteredFacilities?.find((f: any) => f.FacilityType === "004")?.FacilityID
      //   ),
      //   CargoDescription: currentConsignment.CargoDescription,
      //   TransportContractDocumentID: currentConsignment.TransportContractDocumentID,
      //   SecondCargoID: currentConsignment.SecondCargoID,
      //   ThirdCargoID: currentConsignment.ThirdCargoID,
      //   ArrivalDateTime: new Date(currentConsignment.ArrivalDateTime)
      // }, { emitEvent: false });
      //   consignmentForm?.patchValue({
      //     ExportationCountryCode: this.countryMap.get(currentConsignment.ExportationCountryCode) ||
      //       { code: currentConsignment.ExportationCountryCode, name: currentConsignment.ExportationCountryCode },
      //     LoadingLocation: this.chargingCountryMap.get(currentConsignment.LoadingLocation) ||
      //       { code: currentConsignment.LoadingLocation, name: currentConsignment.LoadingLocation },
      //     UnloadingLocationID: this.unpackingSiteMap.get(currentConsignment.UnloadingLocationID) ||
      //       { code: currentConsignment.UnloadingLocationID, name: currentConsignment.UnloadingLocationID },
      //     TransportContractDocumentTypeCode: this.cargoTypeMap.get(currentConsignment.TransportContractDocumentTypeCode),
      //     FacilityType: this.facilityMap.get(
      //       currentConsignment.ConsignmentRegisteredFacilities?.find((f: any) => f.FacilityType === "004")?.FacilityID
      //     ),
      //     CargoDescription: currentConsignment.CargoDescription,
      //     TransportContractDocumentID: currentConsignment.TransportContractDocumentID,
      //     SecondCargoID: currentConsignment.SecondCargoID,
      //     ThirdCargoID: currentConsignment.ThirdCargoID,
      //     ArrivalDateTime: new Date(currentConsignment.ArrivalDateTime)
      //   }, { emitEvent: false });
      // }
      consignmentForm?.patchValue(
        {
          ExportationCountryCode: this.countryMap.get(
            currentConsignment.ExportationCountryCode,
          ) || {
            code: currentConsignment.ExportationCountryCode,
            name: currentConsignment.ExportationCountryCode,
          },
        },
        { emitEvent: false },
      );

      // ✅ עכשיו בנה את הפילטר
      this.filterChargingCountryByExportCode('import');

      // ✅ ואחר כך סט את LoadingLocation
      consignmentForm?.patchValue(
        {
          LoadingLocation: this.chargingCountryMap.get(
            currentConsignment.LoadingLocation,
          ) || {
            code: currentConsignment.LoadingLocation,
            name: currentConsignment.LoadingLocation,
          },
          UnloadingLocationID: this.unpackingSiteMap.get(
            currentConsignment.UnloadingLocationID,
          ) || {
            code: currentConsignment.UnloadingLocationID,
            name: currentConsignment.UnloadingLocationID,
          },
          TransportContractDocumentTypeCode: this.cargoTypeMap.get(
            currentConsignment.TransportContractDocumentTypeCode,
          ),
          FacilityType: this.facilityMap.get(
            currentConsignment.ConsignmentRegisteredFacilities?.find(
              (f: any) => f.FacilityType === '004',
            )?.FacilityID,
          ),
          CargoDescription: currentConsignment.CargoDescription,
          TransportContractDocumentID:
            currentConsignment.TransportContractDocumentID,
          SecondCargoID: currentConsignment.SecondCargoID,
          ThirdCargoID: currentConsignment.ThirdCargoID,
          ArrivalDateTime: new Date(currentConsignment.ArrivalDateTime),
        },
        { emitEvent: false },
      );
    }

    // ✅ Export Consignment
    const currentConsignmentExport =
      currentDec.ConsignmentPackagesMeasures?.[1]?.Consignments;

    if (currentConsignmentExport) {
      // ✅ עדכן את הפילטר גם לייצוא
      if (currentConsignmentExport.ExportationCountryCode) {
        this.filterChargingCountryByExportCode('export');
      }
      this.generalDeclarationForm.get('Consignments')?.patchValue(
        {
          ExportationCountryCode2: this.countryMap.get(
            currentConsignmentExport.ExportationCountryCode,
          ),
          LoadingLocation2: this.chargingCountryMap.get(
            currentConsignmentExport.LoadingLocation,
          ),
          // ✅ תיקון פה - השתמש ב-chargingCountryMap במקום unpackingSiteMap!
          UnloadingLocationID2: this.chargingCountryMap.get(
            currentConsignmentExport.UnloadingLocationID,
          ) || {
            code: currentConsignmentExport.UnloadingLocationID,
            name: currentConsignmentExport.UnloadingLocationID,
          },

          // UnloadingLocationID2: this.unpackingSiteMap.get(currentConsignmentExport.UnloadingLocationID),
          TransportContractDocumentTypeCode2: this.cargoTypeMap.get(
            currentConsignmentExport.TransportContractDocumentTypeCode,
          ),
          FacilityType2: this.facilityMap.get(
            currentConsignmentExport.ConsignmentRegisteredFacilities?.find(
              (f: any) => f.FacilityType === '004',
            )?.FacilityID,
          ),
          CargoDescription2: currentConsignmentExport.CargoDescription,
          TransportContractDocumentID2:
            currentConsignmentExport.TransportContractDocumentID,
          SecondCargoID2: currentConsignmentExport.SecondCargoID,
          ThirdCargoID2: currentConsignmentExport.ThirdCargoID,
          ArrivalDateTime2: new Date(currentConsignmentExport.ArrivalDateTime),
        },
        { emitEvent: false },
      );
    }

    // ✅ Packages
    const pkg = currentDec.ConsignmentPackagesMeasures?.[0];
    if (pkg) {
      this.generalDeclarationForm
        .get('ConsignmentPackagesMeasures')
        ?.patchValue(
          {
            TotalPackageQuantity: pkg.TotalPackageQuantity,
            GrossMassMeasure: pkg.GrossMassMeasure,
            TypeCode: this.declarationTypeCode?.find(
              (t: any) => t.code === pkg.TypeCode,
            ),
          },
          { emitEvent: false },
        );
    }

    // ✅ Supplier Invoices
    const supplierInvoicesFormArray = this.generalDeclarationForm.get(
      'SupplierInvoices',
    ) as FormArray;
    supplierInvoicesFormArray.clear();

    currentDec.SupplierInvoices?.forEach((invoice: any) => {
      const invoiceGroup = this.formBuilder.group({
        Id: [invoice.Id],
        InvoiceNumber: [invoice.InvoiceNumber, Validators.required],
        // SupplierID: [this.supplierMap.get(invoice.SupplierID), Validators.required],
        // ✅ המרה ל-string גם כאן!
        SupplierID: [
          this.supplierMap.get(String(invoice.SupplierID)) || {
            code: String(invoice.SupplierID),
            name: invoice.SupplierID,
          },
          Validators.required,
        ],
        CurrencyCode: [
          this.currencyMap.get(invoice.CurrencyCode),
          Validators.required,
        ],
        LocationID: [
          this.countryMap.get(invoice.LocationID),
          Validators.required,
        ],
        TradeTermsConditionCode: [
          this.tradeTermsMap.get(invoice.TradeTermsConditionCode),
          Validators.required,
        ],
        InvoiceTypeCode: [
          this.invoiceTypeMap.get(invoice.InvoiceTypeCode),
          Validators.required,
        ],
        IssueDateTime: [new Date(invoice.IssueDateTime), Validators.required],
        InvoiceAmount: [invoice.InvoiceAmount, Validators.required],
        BuyerName: [invoice.BuyerName, Validators.required],
        BuyerAddress: [invoice.BuyerAddress, Validators.required],
        BuyerIssueLocation: [
          this.issueLocationMap.get(invoice.BuyerIssueLocation),
          Validators.required,
        ],
        BuyerRole: [this.roleCodeMap.get(invoice.BuyerRole)],

        CustomsValuation: this.formBuilder.array(
          invoice.CustomsValuation?.map((val: any, idx: number) =>
            this.formBuilder.group({
              ID: [val.ID],
              ChargesTypeCode: [
                idx === 0
                  ? { name: 'ביטוח', code: '67' }
                  : { name: 'הובלה', code: '144' },
              ],
              CurrencyCode: [
                this.currencyMap.get(val.CurrencyCode),
                Validators.required,
              ],
              OtherChargeDeductionAmount: [val.OtherChargeDeductionAmount],
            }),
          ) || [],
        ),

        SupplierInvoiceItems: this.formBuilder.array(
          invoice.SupplierInvoiceItems?.map((item: any) =>
            this.formBuilder.group({
              Id: [item.Id],
              ClassificationID: [
                this.classificationOptions.find(
                  (c: any) => c.value === item.ClassificationID,
                ),
                Validators.required,
              ],
              CustomsValueAmount: [
                item.CustomsValueAmount,
                Validators.required,
              ],
              AmountType: [item.AmountType, Validators.required],
              OriginCountryCode: [
                this.countryMap.get(item.OriginCountryCode),
                Validators.required,
              ],
              MeasureQualifier: [item.MeasureQualifier],
            }),
          ) || [],
        ),
      });

      supplierInvoicesFormArray.push(invoiceGroup);

      const code = invoice.TradeTermsConditionCode;
      if (['FCA', 'FOB', 'EXW', 'FAS'].includes(code)) {
        this.showCustomsValuation[supplierInvoicesFormArray.length - 1] = true;
        this.updateValuationValidators(supplierInvoicesFormArray.length - 1);
      }
    });

    if (this.CustomsStatus == 3) {
      supplierInvoicesFormArray.disable({ emitEvent: false });
    }

    if (
      this.declarationChargingCountry &&
      this.declarationChargingCountry.length > 0
    ) {
      console.log('✅ consignmentInit data ready');
      this.populateDestinationCountryData(currentDec.DestinationCountry);
    }

    console.timeEnd('📝 Populate Form');

    this.loading = false;

    if (this.sendToCustoms == 'T') {
      this.sendDeclaration();
    }

    console.timeEnd('⏱️ initElements TOTAL');
  }

  // הוסף פונקציה חדשה (אחרי buildMaps):
  private populateDestinationCountryData(destinationCountryCode: string): void {
    // עדכן UnpackingSite2
    this.declarationUnpackingSite2 =
      this.declarationChargingCountry?.filter((site: any) =>
        site.code?.startsWith(destinationCountryCode),
      ) || [];

    // קבל את אובייקט המדינה
    const countryObj = this.countryMap.get(destinationCountryCode);

    if (countryObj) {
      // עדכן RecipientIssueLocation
      this.generalDeclarationForm.patchValue(
        {
          RecipientIssueLocation: countryObj,
        },
        { emitEvent: false },
      );

      // עדכן BuyerIssueLocation בחשבונית הראשונה
      const supplierInvoicesFormArray = this.generalDeclarationForm.get(
        'SupplierInvoices',
      ) as FormArray;
      supplierInvoicesFormArray.at(0)?.get('BuyerIssueLocation')?.patchValue(
        {
          code: countryObj.code,
          name: countryObj.name,
        },
        { emitEvent: false },
      );
    }
  }

  loadClassificationData() {
    this.classificationService
      .getClassifications$(localStorage.getItem('userId') || '')
      .pipe(takeUntil(this.destroy$))

      .subscribe((data) => {
        this.classificationOptions = data.map((d: any) => ({
          name: d.GoodsDescription,
          value: d.ClassificationBook,
        }));

        this.classificationOptions.unshift({
          name: 'סיווג לא ידוע',
          value: '',
        });
      });
  }

  filterClassification(event: any) {
    const query = event.query.toLowerCase();
    this.filteredClassification = this.classificationOptions.filter((item) =>
      item.name.toLowerCase().includes(query),
    );
  }

  selectClassification(event: any) {
    if (event?.value?.name === 'סיווג לא ידוע') {
      this.unclassified = true;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // שורה 1420 בקירוב - החלף את consignmentInit():
  consignmentInit(): Observable<void> {
    const exportCountryIsrael = this.declarationCountryOfExport?.find(
      (c: { code: string }) => c.code === 'IL',
    );
    if (exportCountryIsrael) {
      this.generalDeclarationForm
        .get('Consignments.ExportationCountryCode2')
        ?.setValue(exportCountryIsrael);
      this.isExportCountrySelected = true;
      this.setChargingCountryControlStatus('export');
      this.filterChargingCountryByExportCode('export');
      this.filterChargingCountry({ query: '' }, 'export');
    }

    const getCustomsData = (
      key: string,
      tableId: string,
      mappingFn: (item: any) => any,
    ) => {
      const localStorageData = localStorage.getItem(key);
      if (localStorageData) {
        return of(JSON.parse(localStorageData));
      } else {
        return this.customsDataService.getCustomsTableValues$(tableId).pipe(
          map((res) => {
            const mappedData = res.map(mappingFn);
            localStorage.setItem(key, JSON.stringify(mappedData));
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

    const customsChargingCountry$ = getCustomsData(
      'customsChargingCountry',
      '1344',
      (item: { Value2: any; Value1: any }) => ({
        code: item.Value1,
        name: item.Value1,
      }),
    ).pipe(
      map((res) => {
        this.declarationChargingCountry = res;
        this.loadingChargingCountrySubject.next(false);
      }),
      tap(() => {
        this.filterChargingCountryByExportCode('export');
        this.filterChargingCountry({ query: '' }, 'export');
      }),
    );

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

    const customsCargoIDType$ = getCustomsData(
      'customsCargoIDType',
      '1259',
      (item: { Value2: any; Value1: any }) => ({
        name: item.Value2,
        code: item.Value1,
      }),
    ).pipe(map((res) => (this.declarationCargoIDType = res)));

    // ✅ החזר Observable:
    return forkJoin([
      customsCountryExport$,
      customsChargingCountry$,
      customsUnpackingSite$,
      customsCargoIDType$,
      customsFacilityID$,
    ]).pipe(
      tap(() => {
        // ✅ בנה Maps:
        this.declarationCountryOfExport?.forEach((item: any) =>
          this.countryMap.set(item.code, item),
        );

        this.declarationChargingCountry?.forEach((item: any) =>
          this.chargingCountryMap.set(item.code, item),
        );

        this.declarationUnpackingSite?.forEach((item: any) =>
          this.unpackingSiteMap.set(item.code, item),
        );

        this.declarationCargoIDType?.forEach((item: any) =>
          this.cargoTypeMap.set(item.code, item),
        );

        this.declarationFacilityID?.forEach((item: any) =>
          this.facilityMap.set(item.code, item),
        );

        // ✅ עכשיו תפעיל את הפילטרים!
        this.filterChargingCountryByExportCode('import');
        this.filterChargingCountry({ query: '' }, 'import');

        const exportationCountryControl = this.generalDeclarationForm.controls[
          'Consignments'
        ].get('ExportationCountryCode');
        exportationCountryControl?.valueChanges
          .pipe(takeUntil(this.destroy$))

          .subscribe(() => {
            this.exportationCountryControlError =
              this.getExportationCountryControlError(exportationCountryControl);
            this.setChargingCountryControlStatus('import');
          });

        const exportationCountryControl2 = this.generalDeclarationForm.controls[
          'Consignments'
        ].get('ExportationCountryCode2');
        exportationCountryControl2?.valueChanges
          .pipe(takeUntil(this.destroy$))

          .subscribe(() => {
            this.exportationCountryControlError =
              this.getExportationCountryControlError(
                exportationCountryControl2,
              );
            this.setChargingCountryControlStatus('export');
          });
      }),
      map(() => void 0), // ✅ החזר void
    );
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

  setChargingCountryControlStatus(mode: 'import' | 'export') {
    if (mode === 'import') {
      const chargingCountryControl = this.generalDeclarationForm.get(
        'Consignments.LoadingLocation',
      );
      if (
        this.exportationCountryControlErrorImport ||
        this.loadingChargingCountrySubject.value
      ) {
        chargingCountryControl?.disable();
      } else {
        this.formDisabled ? null : chargingCountryControl?.enable();
      }
    } else {
      const chargingCountryControl2 = this.generalDeclarationForm.get(
        'Consignments.LoadingLocation2',
      );
      if (
        this.exportationCountryControlErrorExport ||
        this.loadingChargingCountrySubject.value
      ) {
        chargingCountryControl2?.disable();
      } else {
        this.formDisabled ? null : chargingCountryControl2?.enable();
      }
    }
  }

  initForm() {
    this.generalDeclarationForm = this.formBuilder.group({
      LogisticStatusCode: this.formBuilder.control(''),
      CustomsStatus: this.formBuilder.control(''),
      AgentFileReferenceID: this.formBuilder.control(''),
      DeclarationNumber: this.formBuilder.control(''),
      VersionID: this.formBuilder.control(''),
      // DeclarationOfficeID: this.formBuilder.control({ name: 'בית מכס נתב"ג', code: '4' }, Validators.required),
      DeclarationOfficeID: this.formBuilder.control('4'),

      //TypeCode: this.formBuilder.control({ name: 'הצהרת יבוא ', code: '1' }),
      TypeCode: this.formBuilder.control('3'),
      ImporterID: this.formBuilder.control(
        localStorage.getItem('userId') || '2',
        Validators.required,
      ),
      GovernmentProcedure: this.formBuilder.control({
        name: 'שטעון מסחרי - שטעון באותו נמל',
        code: '8000001',
      }),
      // GovernmentProcedure: this.formBuilder.control({ name: 'שטעון מסחרי - שטעון באותו נמל', code: '8100102' }),
      DestinationCountry: this.formBuilder.control(
        { name: '', code: '' },
        Validators.required,
      ),
      //AutonomyRegionType: this.formBuilder.control({ name: '', code: '' }),
      //EntitlementTypeCode: this.formBuilder.control({ name: '', code: '' }),
      RecipientName: this.formBuilder.control('', Validators.required),
      RecipientAddress: this.formBuilder.control('', Validators.required),
      RecipientIssueLocation: this.formBuilder.control(
        { name: '', code: '' },
        Validators.required,
      ),
      //AcceptanceDateTime: this.formBuilder.control(''),
      Consignments: this.formBuilder.group({
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
        TransportContractDocumentID: this.formBuilder.control(
          new Date().getFullYear().toString(),
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
        // Quantity: this.formBuilder.control(''),
        // UnitType: this.formBuilder.control(''),
        MarksAndNumbers: this.formBuilder.control(''),
        IsHazardous: this.formBuilder.control(''),

        ExportationCountryCode2: this.formBuilder.control({
          name: 'ישראל',
          code: 'IL',
        }),
        // LoadingLocation2: this.formBuilder.control({ value: '', disabled: true }, Validators.required),
        LoadingLocation2: this.formBuilder.control('', Validators.required),

        // LoadingLocation: this.formBuilder.control({value: '', disabled: this.exportationCountryControlError}, Validators.required),
        UnloadingLocationID2: this.formBuilder.control('', Validators.required),
        TransportContractDocumentTypeCode2: this.formBuilder.control(
          { name: 'שטר מטען אווירי יצוא', code: '16' },
          Validators.required,
        ),
        ArrivalDateTime2: this.formBuilder.control(
          new Date(),
          Validators.required,
        ),
        TransportContractDocumentID2: this.formBuilder.control(
          new Date().getFullYear().toString(),
          Validators.required,
        ),
        SecondCargoID2: this.formBuilder.control('', Validators.required),
        ThirdCargoID2: this.formBuilder.control(''),
        CargoDescription2: this.formBuilder.control('', Validators.required),
        //FacilityID: this.formBuilder.control({ name: '', code: '' }),
        FacilityType2: this.formBuilder.control(
          { name: '', code: '' },
          Validators.required,
        ),
        // Quantity2: this.formBuilder.control(''),
        // UnitType2: this.formBuilder.control(''),
        MarksAndNumbers2: this.formBuilder.control(''),

        IsHazardous2: this.formBuilder.control(''),
      }),
      ConsignmentPackagesMeasures: this.formBuilder.group({
        //PackageMeasureQualifier: this.formBuilder.control({ name: 'כמות אריזות באתר אחסון', code: '2' }),
        PackageMeasureQualifier: this.formBuilder.control('2'),
        // UnitType: this.formBuilder.control(''),
        TypeCode: this.formBuilder.control({
          name: 'Package, paper wrapped',
          code: 'PP',
        }),
        // TypeCode: this.formBuilder.control('PP'),
        TotalPackageQuantity: this.formBuilder.control('', Validators.required),
        GrossMassMeasure: this.formBuilder.control(''),
        //MarksNumbers: this.formBuilder.control(''),
      }),

      SupplierInvoices: this.formBuilder.array([this.createSupplierInvoice()], {
        validators: this.invoiceAmountValidator,
      }),
    });
  }
  ngAfterViewInit() {
    const consignmentGroup = this.generalDeclarationForm.get(
      'Consignments',
    ) as FormGroup;

    // רשימת השדות שמועתקים כפי שהם (ללא שינוי)
    const fieldsToSync = [
      'TransportContractDocumentID',
      'CargoDescription',
      'FacilityType',
    ];

    fieldsToSync.forEach((fieldName) => {
      const control1 = consignmentGroup.get(fieldName);
      const control2 = consignmentGroup.get(fieldName + '2');

      if (control1 && control2) {
        control1.valueChanges
          .pipe(takeUntil(this.destroy$))

          .subscribe((value) => {
            control2.patchValue(value, { emitEvent: false });
          });
      }
    });

    // לוגיקה מיוחדת עבור SecondCargoID (פיצול המחרוזת)
    const secondCargoControl = consignmentGroup.get('SecondCargoID');
    const targetSecond = consignmentGroup.get('SecondCargoID2');
    const targetThird = consignmentGroup.get('ThirdCargoID2');

    if (secondCargoControl) {
      secondCargoControl.valueChanges
        .pipe(takeUntil(this.destroy$))
        .subscribe((value) => {
          if (value && typeof value === 'string' && value.includes('-')) {
            const [prefix, suffix] = value.split('-');

            targetSecond?.patchValue(suffix, { emitEvent: false });
            targetThird?.patchValue(prefix, { emitEvent: false });
          } else {
            targetSecond?.patchValue('', { emitEvent: false });
            targetThird?.patchValue('', { emitEvent: false });
          }
        });
    }

    const measuresGroup = this.generalDeclarationForm.get(
      'ConsignmentPackagesMeasures',
    ) as FormGroup;
    const packageControl1 = measuresGroup?.get('TotalPackageQuantity');
    const packageControl2 = measuresGroup?.get('TotalPackageQuantity2');

    if (packageControl1 && packageControl2) {
      packageControl1.valueChanges
        .pipe(takeUntil(this.destroy$))

        .subscribe((value) => {
          packageControl2.patchValue(value, { emitEvent: false });
        });
    }
  }

  // ngAfterViewInit() {
  //   this.generalDeclarationForm.get('Consignments.LoadingLocation2')?.disable();

  //   const consignmentGroup = this.generalDeclarationForm.get('Consignments') as FormGroup;

  //   const fieldsToSync = [
  //     'TransportContractDocumentID',
  //     'SecondCargoID',
  //     'CargoDescription',
  //     'ThirdCargoID',
  //     'FacilityType'
  //   ];

  //   fieldsToSync.forEach(fieldName => {
  //     const control1 = consignmentGroup.get(fieldName);
  //     const control2 = consignmentGroup.get(fieldName + '2');

  //     if (control1 && control2) {
  //       control1.valueChanges.subscribe(value => {
  //         control2.patchValue(value, { emitEvent: false });
  //       });
  //     }
  //   });

  //   const measuresGroup = this.generalDeclarationForm.get('ConsignmentPackagesMeasures') as FormGroup;

  //   const control1 = measuresGroup.get('TotalPackageQuantity');
  //   const control2 = measuresGroup.get('TotalPackageQuantity2');

  //   if (control1 && control2) {
  //     control1.valueChanges.subscribe(value => {
  //       control2.patchValue(value, { emitEvent: false });
  //     });
  //   }
  // }

  onTabChange(index: number) {
    const formGroup = this.generalDeclarationForm.get(
      'Consignments',
    ) as FormGroup;

    const currentData = formGroup.getRawValue();

    if (this.activeTabIndex === 0) {
      this.importConsignmentData = { ...currentData };
    } else if (this.activeTabIndex === 1) {
      this.exportConsignmentData = { ...currentData };
    }

    this.activeTabIndex = index;

    const newData =
      index === 0 ? this.importConsignmentData : this.exportConsignmentData;

    if (newData) {
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
      BuyerName: this.formBuilder.control('', Validators.required),
      BuyerAddress: this.formBuilder.control('', Validators.required),
      BuyerIssueLocation: this.formBuilder.control(
        { name: '', code: '' },
        Validators.required,
      ),
      BuyerRole: this.formBuilder.control({ name: '', code: '' }),
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
    this.supplierInvoices.push(this.createSupplierInvoice());
  }

  removeSupplierInvoice(rowData: any, index: any) {
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

  addNewInvoiceItem(i: any): void {
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

  onRecipientDropdownClick(): void {
    if (!this.recipientCountries?.length) {
      console.warn('⚠️ רשימת מדינות ריקה – לא ניתן לפתוח');
      return;
    }

    this.filteredRecipientCountries = this.recipientCountries.map((c) => ({
      ...c,
    }));

    this.cd.detectChanges();
  }

  onDestinationCountrySelect(event: any, code: any) {
    const supplierInvoicesFormArray = this.generalDeclarationForm.get(
      'SupplierInvoices',
    ) as FormArray;
    supplierInvoicesFormArray
      .at(0)
      .get('BuyerIssueLocation')
      ?.patchValue({ code: event?.value?.code, name: event?.value?.name });

    this.filterUnpackingSiteByDestinationCountry(event?.value?.code || code);

    // ✅ נקה את שדה נמל הפריקה במשגור יצוא!
    const consignmentForm = this.generalDeclarationForm.get('Consignments');
    consignmentForm?.patchValue({
      UnloadingLocationID2: { code: '', name: '' }, // ✅ ניקוי השדה!
    });

    this.generalDeclarationForm.patchValue({
      RecipientIssueLocation: {
        code: event?.value?.code,
        name: event?.value?.name,
      },
    });
  }

  onUnloadingLocationIDSelect(event: any, code: any) {
    // const consignmentForm = this.generalDeclarationForm.controls['Consignments']
    // consignmentForm.patchValue({
    //   FacilityType: { code: event?.value?.code, name: event?.value?.name }
    // });
  }

  onUnloadingLocationID2Select(event: any, code: any) {
    // const consignmentForm = this.generalDeclarationForm.controls['Consignments']
    // consignmentForm.patchValue({
    //   FacilityType2: { code: event?.value?.code, name: event?.value?.name }
    // });
  }

  onFacilityTypeSelect(event: any, code: any) {
    const consignmentForm =
      this.generalDeclarationForm.controls['Consignments'];

    // consignmentForm.patchValue({
    //   UnloadingLocationID: { code: event?.value?.code, name: event?.value?.name }
    // });
    consignmentForm.patchValue({
      FacilityType2: { code: event?.value?.code, name: event?.value?.name },
      LoadingLocation2: { code: event?.value?.code, name: event?.value?.name },
    });
  }
  onFacilityType2Select(event: any, code: any) {
    // const consignmentForm = this.generalDeclarationForm.controls['Consignments']
    // consignmentForm.patchValue({
    //   UnloadingLocationID2: { code: event?.value?.code, name: event?.value?.name }
    // });
  }

  onClassificationIDBlur(index: any, suplierInvoiceIndex: any) {
    const tableRowArray = this.GetSupplierInvoiceItems(suplierInvoiceIndex);
    // const tableRowArray = this.generalDeclarationForm.get('SupplierInvoices.SupplierInvoiceItems') as FormArray;
    const classificationID =
      tableRowArray.controls[index].get('ClassificationID');
    const MeasureQualifier =
      tableRowArray.controls[index].get('MeasureQualifier');

    if (classificationID && classificationID.value) {
      this.decService
        .GetClassificationID$(classificationID.value)
        .pipe(takeUntil(this.destroy$))

        .subscribe({
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
    console.log('📦 Received dec object:', dec);
    dec.AgentFileReferenceID = localStorage.getItem('AgentFileReferenceID');

    dec.GovernmentProcedure = dec.GovernmentProcedure.code
      ? dec.GovernmentProcedure.code
      : dec.GovernmentProcedure;
    dec.DestinationCountry = dec.DestinationCountry.code
      ? dec.DestinationCountry.code
      : dec.DestinationCountry;
    dec.RecipientIssueLocation =
      dec.RecipientIssueLocation?.code ?? dec.RecipientIssueLocation;

    const cons = dec.Consignments;
    // cons.GovernmentProcedure = cons.GovernmentProcedure?.code ?? cons.GovernmentProcedure;

    const importId = crypto.randomUUID();
    const exportId = crypto.randomUUID();

    // const baseMeasure = dec.ConsignmentPackagesMeasures ?? {};
    const baseMeasureRaw = dec.ConsignmentPackagesMeasures ?? {};

    const baseMeasure = {
      PackageMeasureQualifier:
        baseMeasureRaw.PackageMeasureQualifier?.code ??
        baseMeasureRaw.PackageMeasureQualifier,

      TypeCode: baseMeasureRaw.TypeCode?.code ?? baseMeasureRaw.TypeCode,

      TotalPackageQuantity: baseMeasureRaw.TotalPackageQuantity,
      GrossMassMeasure: baseMeasureRaw.GrossMassMeasure,
    };

    const processFacilities = (
      facility: any,
      consignmentId: string,
      sequence: number,
    ) => {
      return facility?.code
        ? [
            {
              Id: null,
              FacilityID: facility.code,
              FacilityType: '004',
              FacilitySequenceNumeric: sequence,
              ConsignmentId: consignmentId,
            },
          ]
        : [];
    };

    //Import consignment
    const consignmentImport = {
      Id: importId,
      ImportExportConsigment: 'I',
      ExportationCountryCode:
        cons.ExportationCountryCode?.code ?? cons.ExportationCountryCode,
      LoadingLocation: cons.LoadingLocation?.code ?? cons.LoadingLocation,
      UnloadingLocationID:
        cons.UnloadingLocationID?.code ?? cons.UnloadingLocationID,
      TransportContractDocumentTypeCode:
        cons.TransportContractDocumentTypeCode?.code ??
        cons.TransportContractDocumentTypeCode,
      ArrivalDateTime: cons.ArrivalDateTime,
      TransportContractDocumentID: cons.TransportContractDocumentID,
      SecondCargoID: cons.SecondCargoID,
      ThirdCargoID: cons.ThirdCargoID,
      CargoDescription: cons.CargoDescription,
      ConsignmentRegisteredFacilities: processFacilities(
        cons.FacilityType,
        importId,
        1,
      ),
      // ConsignmentPackagesMeasures: [{
      //   Id: null,
      //   ConsignmentId: importId,
      //   PackageMeasureQualifier: baseMeasure.PackageMeasureQualifier?.code ?? baseMeasure.PackageMeasureQualifier,
      //   TypeCode: baseMeasure.TypeCode?.code ?? baseMeasure.TypeCode,
      //   ...baseMeasure
      // }]
      ConsignmentPackagesMeasures: [
        {
          Id: null,
          ConsignmentId: importId,
          PackageMeasureQualifier: baseMeasure.PackageMeasureQualifier,
          TypeCode:
            typeof baseMeasure.TypeCode === 'object'
              ? baseMeasure.TypeCode.code
              : baseMeasure.TypeCode,
          TotalPackageQuantity: baseMeasure.TotalPackageQuantity,
          GrossMassMeasure: baseMeasure.GrossMassMeasure,
        },
      ],
    };

    //  Export consignment
    const consignmentExport = {
      Id: exportId,
      ImportExportConsigment: 'E',
      ExportationCountryCode:
        cons.ExportationCountryCode2?.code ?? cons.ExportationCountryCode2,
      LoadingLocation: cons.LoadingLocation2?.code ?? cons.LoadingLocation2,
      UnloadingLocationID:
        cons.UnloadingLocationID2?.code ?? cons.UnloadingLocationID2,
      TransportContractDocumentTypeCode:
        cons.TransportContractDocumentTypeCode2?.code ??
        cons.TransportContractDocumentTypeCode2,
      ArrivalDateTime: cons.ArrivalDateTime2,
      TransportContractDocumentID: cons.TransportContractDocumentID2,
      SecondCargoID: cons.SecondCargoID2,
      ThirdCargoID: cons.ThirdCargoID2,
      CargoDescription: cons.CargoDescription2,
      ConsignmentRegisteredFacilities: processFacilities(
        cons.FacilityType2,
        exportId,
        2,
      ),
      ConsignmentPackagesMeasures: [
        {
          Id: null,
          ConsignmentId: exportId,
          PackageMeasureQualifier: baseMeasure.PackageMeasureQualifier,
          TypeCode:
            typeof baseMeasure.TypeCode === 'object'
              ? baseMeasure.TypeCode.code
              : baseMeasure.TypeCode,
          TotalPackageQuantity: baseMeasure.TotalPackageQuantity,
          GrossMassMeasure: baseMeasure.GrossMassMeasure,
        },
      ],
      // ConsignmentPackagesMeasures: [{
      //   Id: null,
      //   ConsignmentId: exportId,
      //   PackageMeasureQualifier: baseMeasure.PackageMeasureQualifier?.code ?? baseMeasure.PackageMeasureQualifier,
      //   TypeCode: baseMeasure.TypeCode?.code ?? baseMeasure.TypeCode,
      //   ...JSON.parse(JSON.stringify(baseMeasure))
      // }]
    };

    // supplierInvoices
    const supplierInvoices = dec.SupplierInvoices ?? [];
    supplierInvoices.forEach((invoice: any) => {
      invoice.InvoiceTypeCode =
        invoice.InvoiceTypeCode?.code ?? invoice.InvoiceTypeCode;
      invoice.LocationID = invoice.LocationID?.code ?? invoice.LocationID;
      invoice.SupplierID = invoice.SupplierID?.code ?? invoice.SupplierID;
      invoice.TradeTermsConditionCode =
        invoice.TradeTermsConditionCode?.code ??
        invoice.TradeTermsConditionCode;
      invoice.CurrencyCode = invoice.CurrencyCode?.code ?? invoice.CurrencyCode;
      invoice.BuyerIssueLocation =
        invoice.BuyerIssueLocation?.code ?? invoice.BuyerIssueLocation;
      invoice.BuyerRole = invoice.BuyerRole?.code ?? invoice.BuyerRole;

      invoice.CustomsValuation?.forEach((val: any) => {
        val.ChargesTypeCode = val.ChargesTypeCode?.code ?? val.ChargesTypeCode;
        val.CurrencyCode = val.CurrencyCode?.code ?? val.CurrencyCode;
      });

      invoice.SupplierInvoiceItems?.forEach((item: any) => {
        item.Id = item.Id || null;
        item.OriginCountryCode =
          item.OriginCountryCode?.code ?? item.OriginCountryCode;
        if (
          item.ClassificationID &&
          typeof item.ClassificationID === 'object'
        ) {
          item.ClassificationID =
            item.ClassificationID.value ?? item.ClassificationID.code ?? '';
        }
      });
    });

    // dec.Id = localStorage.getItem('currentDecId');
    if (this.mode !== 'e') {
      dec.Id = null; // או delete dec.Id
    } else {
      dec.Id = localStorage.getItem('currentDecId');
    }
    dec.RoleCode = '1';
    dec.TaxationDateTime = new Date();
    dec.CreateDateTime = new Date();

    console.log(consignmentImport);

    dec.ConsignmentPackagesMeasures.TypeCode = dec.ConsignmentPackagesMeasures
      .TypeCode?.code
      ? dec.ConsignmentPackagesMeasures.TypeCode?.code
      : '';

    this.perfectDecalartion = {
      ...JSON.parse(JSON.stringify(dec)),
      Consignments: [consignmentImport, consignmentExport],
      SupplierInvoices: supplierInvoices,
    };

    console.log('🚀 perfectDec:', this.perfectDecalartion);
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
    const dec = this.generalDeclarationForm.value;
    const perfectDec = this.convertToDecObj(dec);

    if (this.mode != 'e') {
      this.decService
        .sendDeclarationToInternal(perfectDec)
        .pipe(takeUntil(this.destroy$))

        .subscribe((res: any) => {
          console.log(res);
          localStorage.setItem('currentDecId', res.body?.Id);
          // localStorage.setItem('currentDec', res.body)
          localStorage.setItem('currentDec', JSON.stringify(res.body));
          this.stepService.emitStepCompleted('+');
        });
    } else {
      this.decService
        .updateDeclarationTs$(perfectDec.Id, perfectDec)
        .pipe(takeUntil(this.destroy$))
        .subscribe((res: any) => {
          localStorage.setItem('activeIndex', '0');
          this.stepService.emitStepCompleted('+');
        });
    }
  }

  addEvent() {
    const entityEvent = {
      EntityKey: localStorage.getItem('currentDecId') || '',
      EntityType: '2',
      EventCode: 'CLSREQ',
      EventDate: new Date(),
      RegistrationDate: new Date(),
      UserID: localStorage.getItem('userId') || '',
      Remarks: '',
      TimeZone: 0,
      Valid: true,
    };

    this.customsDataService
      .addEntityEvent$(entityEvent)
      .pipe(takeUntil(this.destroy$))

      .subscribe((res) => console.log(res));

    this.msgs1 = [
      {
        severity: 'info',
        summary: '',
        detail: 'התיק נשלח לסווג טרם שליחה למכס',
      },
    ];
  }

  sendDeclaration() {
    this.loading = true;
    const id = localStorage.getItem('currentDecId');
    const dec = this.generalDeclarationForm.value;
    const perfectDec = this.convertToDecObj(dec);
    console.log(perfectDec);

    if (this.unclassified) {
      this.addEvent();
    }
    this.decService
      .updateAndSendDeclarationTs$(id, perfectDec, false)
      .pipe(takeUntil(this.destroy$))

      .subscribe((res: any) => {
        this.loading = false;
        res = JSON.parse(res);
        console.log(res);
        if (res.responseField) {
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

          perfectDec.DeclarationNumber =
            res.responseField.declarationField.idField.valueField;
          perfectDec.VersionID =
            res.responseField.declarationField.dMExtensionsField.versionIDField.valueField;
          perfectDec.CustomsStatus =
            res.responseField.statusField.nameCodeField.valueField;
          this.customStatus = perfectDec.CustomsStatus;
          localStorage.setItem('decVersion', perfectDec.VersionID);
          localStorage.setItem('CustomsStatus', perfectDec.CustomsStatus);
          this.loading = true;

          this.decService
            .updateDeclarationTs$(id, perfectDec)
            .pipe(
              tap((_) => (this.loading = false)),
              // tap(_ => this.msgs1 = [{ severity: 'success', summary: 'Success', detail: 'העידכונים נשמרו בהצלחה!' }])
            )
            .subscribe((res: any) => {
              this.isLocked = false;
              console.log(res);
            });

          // if (+dec.VersionID > 0.5) {
          //   this.msgs1 = [{ severity: 'error', summary: 'נשלחו 6 טיוטות שגויות', detail: '"שחרור ההצהרה עובר לתהליך של "חבר בוואטסאפ' }]
          // }
          if (res.responseField.errorField) {
            this.customsErrorsContent = res.responseField.errorField;
            // res.responseField.errorField[0].validationCodeField.nameField
            // res.responseField.errorField[1].validationCodeField.valueField
          }
        } else if (res.responseContentHeaderField) {
          this.customsError = res.responseContentHeaderField.exceptionField;
        }
      });
  }

  getFormErrors(checkInvoice: boolean) {
    const message = this.buildFormErrors(checkInvoice, true);
    if (checkInvoice) {
      this.deferFormErrorsMessageUpdate();
    }
    return message;
  }

  private deferFormErrorsMessageUpdate() {
    Promise.resolve().then(() => {
      this.formErrorsMessage = this.buildFormErrors(false, false);
    });
  }

  private buildFormErrors(checkInvoice: boolean, updateSupplierState: boolean) {
    let errors: string[] = [];

    if (checkInvoice && updateSupplierState) {
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
                //   case 'minlength':
                //     errors.push(`${fieldLabel}: חייב להכיל לפחות ${control.errors ? control.errors['minlength'].requiredLength : null} תווים`);
                //    break;
                // case 'maxlength':
                //     errors.push(`${fieldLabel}: לא יכול להכיל יותר מ-${control.errors['maxlength'].requiredLength} תווים`);
                //     break;
                case 'email':
                  errors.push(`${fieldLabel}: כתובת אימייל לא תקינה`);
                  break;
                //   default:
                //     errors.push(`${fieldLabel}: שגיאה כללית`);
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
    const version = +this.generalDeclarationForm.controls['VersionID'].value;

    return version > 0.5;
  }

  //get values by cargo Ids
  onCargoIDBlur(cargoIdNum: any) {
    if (cargoIdNum == 2) {
      const consignment = this.generalDeclarationForm.controls[
        'Consignments'
      ] as FormGroup;
      let secondCargoID = consignment.controls['SecondCargoID'].value;
      secondCargoID = secondCargoID.trim();
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
    }
    const consignment = this.generalDeclarationForm.controls[
      'Consignments'
    ] as FormGroup;
    const cargoType =
      consignment.controls['TransportContractDocumentTypeCode'].value?.code;
    const firstCargoID =
      consignment.controls['TransportContractDocumentID'].value;
    const secondCargoID = consignment.controls['SecondCargoID'].value;
    const thirdCargoID = consignment.controls['ThirdCargoID'].value;

    if (cargoType && firstCargoID && secondCargoID) {
      const params = { cargoType, firstCargoID, secondCargoID, thirdCargoID };
      this.decService
        .getCagroQueryMessage$(params)
        .pipe(takeUntil(this.destroy$))

        .subscribe((res: any) => {
          // console.log(res);
          if (res.cargoField) {
            const decId = localStorage.getItem('currentDecId') || '';

            const createDateField =
              res?.cargosVersionField?.[0]?.createDateField;

            this.decService.setCargoContext({
              decId,
              key: { cargoType, firstCargoID, secondCargoID, thirdCargoID },
              createDate: createDateField,
              receivedAtIso: new Date().toISOString(),
            });

            const totalNumberOfPackeges =
              res.cargoField.totalNumberOfPackegesField;
            const totalWeight = res.cargoField.totalWeightField;
            const typeCode = res.cargoItemField[0].packingTypeField;
            const loadingSite =
              res.cargoField.cargoAdditionalDataField[0].loadingSiteField;

            const ExportationCountryCode = {
              code: loadingSite.trim().split(' ')[0].substring(0, 2),
              name: this.declarationCountryOfExport.find(
                (element: any) =>
                  element.code ==
                  loadingSite.trim().split(' ')[0].substring(0, 2),
              ).name,
            };
            const LoadingLocation = {
              code: loadingSite.trim().split(' ')[0],
              name: this.declarationChargingCountry.find(
                (element: any) =>
                  element.code == loadingSite.trim().split(' ')[0],
              ).name,
            };
            const unloadingLocation = {
              code: res.cargoField.cargoAdditionalDataField[0]
                .unloadingLocationIDField,
              name: res.cargoField.cargoAdditionalDataField[0]
                .unloadingLocationNameField,
            };

            const acceptedArrivalSite = {
              code: res.cargoField.cargoAdditionalDataField[0]
                .acceptedArrivalSiteIDField,
              name: res.cargoField.cargoAdditionalDataField[0]
                .acceptedArrivalSiteNameField,
            };

            console.log(
              res.cargoField.cargoAdditionalDataField[0]
                .acceptedArrivalSiteIDField,
            );
            console.log(
              res.cargoField.cargoAdditionalDataField[0]
                .acceptedArrivalSiteNameField,
            );

            this.generalDeclarationForm.get('Consignments')?.patchValue(
              {
                FacilityType: this.facilityMap.get(
                  acceptedArrivalSite.code,
                ) || {
                  code: acceptedArrivalSite.code,
                  name: acceptedArrivalSite.name,
                },
                FacilityType2: this.facilityMap.get(
                  acceptedArrivalSite.code,
                ) || {
                  code: acceptedArrivalSite.code,
                  name: acceptedArrivalSite.name,
                }, // עדכון למשגור יצוא
              },
              { emitEvent: false },
            );

            this.decService.updatePackageData({
              totalNumberOfPackeges,
              totalWeight,
              typeCode,
              unloadingLocation,
              ExportationCountryCode,
              LoadingLocation,
            });
          }
        });
    }
  }

  serchVendor() {
    this.router.navigateByUrl('/search-vendor');
  }

  onExportationCountrySelect(event: any) {
    const supplierInvoicesFormArray = this.generalDeclarationForm.get(
      'SupplierInvoices',
    ) as FormArray;
    supplierInvoicesFormArray
      .at(0)
      .get('LocationID')
      ?.patchValue({ code: event?.value?.code, name: event?.value?.name });

    const mode = this.activeTabIndex === 0 ? 'import' : 'export';
    const selected = !!event?.value;

    if (mode === 'import') {
      this.isImportCountrySelected = selected;
      this.generalDeclarationForm.get('Consignments.LoadingLocation')?.reset();
      this.formDisabled
        ? null
        : this.generalDeclarationForm
            .get('Consignments.LoadingLocation')
            ?.enable();
    } else {
      this.isExportCountrySelected = selected;
      this.formDisabled
        ? null
        : this.generalDeclarationForm
            .get('Consignments.LoadingLocation2')
            ?.enable();
      this.generalDeclarationForm.get('Consignments.LoadingLocation2')?.reset();
    }

    this.loadingChargingCountry$.pipe(take(1)).subscribe((loading) => {
      if (!loading) {
        this.filterChargingCountryByExportCode(mode);
      }
    });
  }

  onRecipientIssueLocationSelect(event: any) {
    const supplierInvoicesFormArray = this.generalDeclarationForm.get(
      'SupplierInvoices',
    ) as FormArray;
    supplierInvoicesFormArray
      .at(0)
      .get('BuyerIssueLocation')
      ?.patchValue({ code: event?.value?.code, name: event?.value?.name });
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

  filterChargingCountryByExportCode(mode: 'import' | 'export') {
    const path =
      mode === 'import' ? 'ExportationCountryCode' : 'ExportationCountryCode2';
    const exportCountryCode = this.generalDeclarationForm
      .get('Consignments')
      ?.get(path)?.value?.code;

    const filtered = this.declarationChargingCountry.filter((site: any) =>
      site.code?.startsWith(exportCountryCode),
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

  filterDestinationCountry(event: any) {
    let filtered: any[] = [];
    let query = event.query?.toLowerCase() || '';
    for (let i = 0; i < this.declarationDestinationCountry.length; i++) {
      let a = this.declarationDestinationCountry[i];
      if (a.name.toLowerCase().indexOf(query) != -1) {
        filtered.push(a);
      }
    }
    this.filteredDestinationCountry = filtered;
  }

  filterRecipientCountries(event: any) {
    const query = event.query?.toLowerCase() || '';

    if (!query) {
      this.filteredRecipientCountries = this.recipientCountries;
    } else {
      this.filteredRecipientCountries = this.recipientCountries.filter(
        (country: any) => country.name.toLowerCase().includes(query),
      );
    }
  }

  filterCountryOfExport(event: any) {
    let filtered: any[] = [];
    let query = event.query?.toLowerCase();
    for (let i = 0; i < this.declarationCountryOfExport.length; i++) {
      let a = this.declarationCountryOfExport[i];
      if (a.name?.toLowerCase().indexOf(query) != -1 && a.code) {
        filtered.push(a);
      }
    }
    this.filteredCountryOfExport = filtered;
  }

  filterChargingCountry(event: any, mode: 'import' | 'export') {
    if (mode === 'export') {
      const country = this.generalDeclarationForm.get(
        'Consignments.ExportationCountryCode2',
      )?.value;
    }

    const query = event.query?.toLowerCase();
    const baseList =
      mode === 'import'
        ? this.filteredChargingCountryImport
        : this.filteredChargingCountryExport;

    const filtered: any[] = baseList.filter((location: any) =>
      location.name.toLowerCase().includes(query),
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
        preferred.push(a);
      } else if (a.name.indexOf(query) != -1) {
        others.push(a);
      }
    }
    // this.filteredUnpackingSite = filtered;
    this.filteredUnpackingSite = [...preferred, ...others];
  }

  filterUnpackingSiteByReceiptCountry(event: any) {
    let filtered: any[] = [];
    let query = event.query;
    for (let i = 0; i < this.declarationUnpackingSite2?.length; i++) {
      let a = this.declarationUnpackingSite2[i];
      if (a.name.indexOf(query) != -1) {
        filtered.push(a);
      }
    }
    this.filteredUnpackingSite = filtered;
  }

  filterUnpackingSiteByDestinationCountry(code: any) {
    const destinationCountry = code;

    // ✅ בדיקה אם declarationChargingCountry קיים
    if (
      !this.declarationChargingCountry ||
      !Array.isArray(this.declarationChargingCountry)
    ) {
      console.warn('⚠️ declarationChargingCountry לא נטען עדיין');
      this.declarationUnpackingSite2 = [];
      return of(void 0);
    }

    this.declarationUnpackingSite2 = this.declarationChargingCountry.filter(
      (site: any) => site.code?.startsWith(destinationCountry),
    );

    return of(void 0);
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

  filterTypeCode(event: any) {
    let filtered: any[] = [];
    let query = event.query.toLowerCase();
    for (let i = 0; i < this.declarationTypeCode.length; i++) {
      let a = this.declarationTypeCode[i];
      if (a.name.toLowerCase().indexOf(query) == 0) {
        filtered.push(a);
      }
    }
    this.filteredTypeCode = filtered;
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

  filterIssueLocation(event: any) {
    let query = event.query;

    const preferredValues = ['FOB', ''];

    let preferred: any[] = [];
    let others: any[] = [];

    for (let i = 0; i < this.declarationIssueLocation.length; i++) {
      let a = this.declarationIssueLocation[i];
      if (preferredValues.includes(a.code) && a.code.indexOf(query) === 0) {
        preferred.push(a);
      } else if (a.code.indexOf(query) === 0) {
        others.push(a);
      }
    }
    this.filteredIssueLocation = [...preferred, ...others];
  }

  filterRoleCode(event: any) {
    let query = event.query;

    const preferredValues = ['FOB', ''];

    let preferred: any[] = [];
    let others: any[] = [];

    for (let i = 0; i < this.declarationRoleCode.length; i++) {
      let a = this.declarationRoleCode[i];
      if (preferredValues.includes(a.code) && a.code.indexOf(query) === 0) {
        preferred.push(a);
      } else if (a.code.indexOf(query) === 0) {
        others.push(a);
      }
    }
    this.filteredRoleCode = [...preferred, ...others];
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
        localStorage.setItem('maxIndex', '1');
        this.stepService.updateMaxIndex(1);
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

  // copyDeclaration() {
  //   this.loading = true;

  //   // שמור את הנתונים הנוכחיים
  //   const currentFormValue = this.generalDeclarationForm.getRawValue();

  //   // נקה את שדות המטען
  //   const copiedData = {
  //     ...currentFormValue,
  //     Consignments: {
  //       ...currentFormValue.Consignments,
  //       // משגור יבוא - ניקוי שדות
  //       TransportContractDocumentID: '',
  //       SecondCargoID: '',
  //       ThirdCargoID: '',
  //       // משגור יצוא - ניקוי שדות
  //       TransportContractDocumentID2: '',
  //       SecondCargoID2: '',
  //       ThirdCargoID2: ''
  //     }
  //   };

  //   // המרה לאובייקט מושלם
  //   const perfectDec = this.convertToDecObj(copiedData);

  //   // הסר את ה-ID כדי ליצור הצהרה חדשה
  //   delete perfectDec.Id;
  //   delete perfectDec.DeclarationNumber;
  //   delete perfectDec.VersionID;
  //   perfectDec.CustomsStatus = null;

  //   // יצירת הצהרה חדשה
  //   this.decService.sendDeclarationToInternal(perfectDec).subscribe({
  //     next: (res: any) => {
  //       console.log('✅ Declaration copied:', res);
  //       localStorage.setItem('currentDecId', res.body?.Id);

  //       // ניווט להצהרה החדשה במצב עריכה
  //       this.router.navigate(['/declaration-main/dec-form-ts'], {
  //         queryParams: {
  //           Mode: 'e',
  //           type: this.declarationType
  //         }
  //       }).then(() => {
  //         this.loading = false;
  //         this.msgs1 = [{
  //           severity: 'success',
  //           summary: 'הצלחה',
  //           detail: 'ההצהרה הועתקה בהצלחה'
  //         }];
  //       });
  //     },
  //     error: (err) => {
  //       console.error('❌ Copy failed:', err);
  //       this.loading = false;
  //       this.msgs1 = [{
  //         severity: 'error',
  //         summary: 'שגיאה',
  //         detail: 'העתקת ההצהרה נכשלה'
  //       }];
  //     }
  //   });
  // }

  copyDeclaration() {
    const currentFormValue = this.generalDeclarationForm.getRawValue();

    const copiedData = {
      ...currentFormValue,
      Consignments: {
        ...currentFormValue.Consignments,
        TransportContractDocumentID: '',
        SecondCargoID: '',
        ThirdCargoID: '',
        TransportContractDocumentID2: '',
        SecondCargoID2: '',
        ThirdCargoID2: '',
      },
    };

    this.generalDeclarationForm.patchValue({
      Id: null,
      DeclarationNumber: '',
      VersionID: '',
      CustomsStatus: null,
      AgentFileReferenceID: '', // ✅ הוסף את זה!
    });

    this.generalDeclarationForm.patchValue(copiedData);

    localStorage.removeItem('currentDecId');
    // ✅ הוסף גם את זה:
    localStorage.removeItem('AgentFileReferenceID');

    this.mode = 'n';

    // ✅ צור מספר תיק חדש מהשרת
    this.customsDataService
      .GetSeq$('Customs')
      .pipe(takeUntil(this.destroy$))

      .subscribe((res) => {
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
  private loadAndCopyDeclaration() {
    const decId = localStorage.getItem('currentDecId');

    if (!decId) {
      this.loading = false;
      return;
    }

    this.decService
      .getDeclaration(decId)
      .pipe(takeUntil(this.destroy$))

      .subscribe((res) => {
        if (!res) {
          this.loading = false;
          return;
        }

        // ✅ טען את הנתונים לטופס (השתמש בפונקציה הקיימת)
        this.initElementsWithData(res);

        // ✅ אחרי הטעינה - הפעל את פונקצ העתקה
        setTimeout(() => {
          this.copyDeclaration();
          localStorage.removeItem('copyMode');
        }, 500);
      });
  }
}
