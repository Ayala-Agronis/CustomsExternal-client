import { CommonModule } from '@angular/common';
import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, of } from 'rxjs';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
} from 'rxjs/operators';

import { Message } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessagesModule } from 'primeng/messages';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TopNavbarComponent } from '../../shared/components/top-navbar/top-navbar.component';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import {
  CustomsBookApiService,
  LawFilter,
} from '../../shared/services/customs-book-api.service';
import {
  CustomsBookDetails,
  CustomsBookSearchResult,
} from '../../shared/models/customs-book.models';

@Component({
  selector: 'app-customs-book-query',
  standalone: true,
  templateUrl: './customs-book-query.component.html',
  styleUrls: ['./customs-book-query.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    DropdownModule,
    AutoCompleteModule,
    TableModule,
    ProgressSpinnerModule,
    MessagesModule,
    ButtonModule,
    InputTextModule,
    TopNavbarComponent,
    TooltipModule,
    ToastModule,
  ],
  providers: [MessageService],
})
export class CustomsBookQueryComponent implements OnInit, OnChanges {
  @Input() popupMode = false;
  @Input() isDialogOpen = false;
  @Output() itemSelected = new EventEmitter<any>();

  selectItem(item: any) {
    this.itemSelected.emit(item);
  }

  loading = false;
  msgs: Message[] = [];

  lastUpdateDate: string | null = null;

  bookTypes = [
    { name: 'יבוא', id: 1, color: 'import' },
    { name: 'יצוא', id: 2, color: 'export' },
    { name: 'אוטונומיה', id: 3, color: 'autonomy' },
  ];
  bookTypeId = 1;

  // AutoComplete
  term = '';
  suggestions: CustomsBookSearchResult[] = [];
  selectedItem: CustomsBookSearchResult | null = null;

  // Details
  details: CustomsBookDetails | null = null;

  // Law filter
  lawFilter: LawFilter = 'all';

  private term$ = new Subject<string>();

  constructor(
    private api: CustomsBookApiService,
    private messageService: MessageService,
  ) {
    this.term$
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        switchMap((q) => {
          const t = (q || '').trim();
          if (t.length < 3) {
            this.suggestions = [];
            return of([]);
          }
          this.loading = true;
          return this.api.search(t, this.bookTypeId).pipe(
            catchError((_) => {
              this.msgs = [
                { severity: 'error', summary: 'שגיאה', detail: 'חיפוש נכשל' },
              ];
              return of([]);
            }),
            tap(() => (this.loading = false)),
          );
        }),
      )
      .subscribe((res) => (this.suggestions = res || []));
  }

ngOnInit(): void {
  this.onContextChanged(); // מאפס הכל בעת טעינה
  
  this.api.getLastUpdateDate().subscribe({
    next: (res) => {
      this.lastUpdateDate = res?.CustomsBookUpdateDate ?? null;
    },
    error: () => {
      this.lastUpdateDate = null;
    },
  });
}

ngOnChanges(changes: SimpleChanges): void {
  // כשהדיאלוג נפתח (isDialogOpen משתנה ל-true), אפס הכל
  if (changes['isDialogOpen'] && this.isDialogOpen === true) {
    this.reset();
  }
}

  reset() {
    this.term = '';
    this.term$.next(''); // אפס גם את ה-Subject כדי שיזכור שהערך הוא ''
    this.suggestions = [];
    this.selectedItem = null;
    this.details = null;
    this.msgs = [];
    this.loading = false;
  }

  onClose() {
    this.reset();
    // אם יש פה אירוע שסוגר את הפופאפ בהורה, תעיפי אותו כאן
  }

  // // PrimeNG AutoComplete completeMethod
  // onSearch(event: any) {
  //   this.term$.next(event?.query ?? '');
  // }

  onTermChange(value: string) {
    this.term = value ?? '';
    this.details = null;
    this.selectedItem = null;
    this.suggestions = []; // הוספתי את זה
    this.term$.next(value ?? '');
  }

  // PrimeNG onSelect - item הוא האובייקט שנבחר
  onPick(item: CustomsBookSearchResult) {
    this.selectedItem = item;
    this.lawFilter = 'all';
    this.suggestions = [];
    this.term = item.FullClassification;
    // this.term='';
    this.loadDetails();
  }

  // setLawFilter(f: LawFilter) {
  //   if (!this.selectedItem) return;
  //   this.lawFilter = f;
  //   this.loadDetails();
  // }

  setLawFilter(f: LawFilter) {
    this.lawFilter = f;
  }

  onContextChanged() {
    // שינוי ספר מכס או תאריך -> איפוס
    this.term = '';
    this.suggestions = [];
    this.selectedItem = null;
    this.details = null;
    this.msgs = [];
    this.loading = false; // מומלץ
  }

  private loadDetails() {
    if (!this.selectedItem) return;

    this.loading = true;
    this.msgs = [];

    this.api
      .details(this.selectedItem.CustomsItemID, this.lawFilter)
      .pipe(
        catchError((_) => {
          this.msgs = [
            {
              severity: 'error',
              summary: 'שגיאה',
              detail: 'טעינת פרטים נכשלה',
            },
          ];
          return of(null);
        }),
        tap(() => (this.loading = false)),
      )
      .subscribe((res) => (this.details = res));
  }

  // fmtDate(value?: string | null): string {
  //   return value ? value.substring(0, 10) : '';
  // }

  fmtDate(value: any): string {
    if (!value) return '';
    if (value instanceof Date) return value.toISOString().substring(0, 10);
    return String(value).substring(0, 10);
  }

  private escapeHtml(s: string): string {
    return (s ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private escapeRegExp(s: string): string {
    return (s ?? '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /** מדגיש את מילת החיפוש בתוך טקסט (למשל GoodsDescription) */
  highlight(
    text: string | null | undefined,
    term: string | null | undefined,
  ): string {
    const t = (term ?? '').trim();
    const src = this.escapeHtml(text ?? '');
    if (!t || t.length < 2) return src;

    const re = new RegExp(this.escapeRegExp(this.escapeHtml(t)), 'gi');
    return src.replace(re, (m) => `<mark class="hit">${m}</mark>`);
  }

  /** צובע את ה־FullClassification לפי קבוצות (כמו באפיון) */
  // formatClassification(full: string | null | undefined): string {
  //   const s = (full ?? '').trim();
  //   if (!s) return '';

  //   // אם מגיע עם "/" או בלי רווחים - עדיין נעבוד:
  //   const parts = s.split(/\s+/).filter(Boolean);

  //   // מחלק צבעים במחזוריות
  //   return parts
  //     .map(
  //       (p, i) =>
  //         `<span class="fc-part fc-${(i % 4) + 1}">${this.escapeHtml(p)}</span>`,
  //     )
  //     .join(' ');
  // }

  // formatClassification(full: string | null | undefined): string {
  //   const raw = (full ?? '').trim();
  //   if (!raw) return '';

  //   // בודקים אם יש מינוס בהתחלה
  //   const isNegative = raw.startsWith('-');
  //   // מפרידים את חלק המספר מה-suffix
  //   const [mainWithMinus, suffix] = raw.split('/');
  //   const main = isNegative ? mainWithMinus.substring(1) : mainWithMinus;

  //   // משאירים רק ספרות
  //   const digits = main.replace(/\D/g, '');

  //   // חלוקה כל 2 תווים
  //   const parts = digits.match(/.{1,2}/g) || [];

  //   // צבעים מחזוריים
  //   const colored = parts
  //     .map(
  //       (p, i) =>
  //         `<span class="fc-part fc-${(i % 4) + 1}">${this.escapeHtml(p)}</span>`,
  //     )
  //     .join(' ');

  //   // מחזירים מינוס אם צריך + סיומת אם קיימת
  //   return `${isNegative ? '-' : ''}${colored}${
  //     suffix ? `<span class="fc-part">/${this.escapeHtml(suffix)}</span>` : ''
  //   }`;
  // }

  formatClassification(value: string): string {
    if (!value) return '';

    const clean = value.replace(/\s+/g, '');

    const slashIndex = clean.indexOf('/');
    const mainPart = slashIndex >= 0 ? clean.slice(0, slashIndex) : clean;
    const suffix = slashIndex >= 0 ? clean.slice(slashIndex + 1) : '';

    const startsWithDash = mainPart.startsWith('-');
    const numericPart = startsWithDash ? mainPart.slice(1) : mainPart;

    const grouped = numericPart.match(/.{1,2}/g)?.join(' ') ?? numericPart;

    return `${startsWithDash ? '-' : ''}${grouped}${slashIndex >= 0 ? ' /' + suffix : ''}`;
  }

  loadMock() {
    this.details = {
      CustomsItemID: 123456,
      FullClassification: '64 03 12 00 00',
      GoodsDescription: 'נעליים עם סוליה מגומי/פלסטיק וחלק עליון מעור',
      CustomsBookTypeIDNum: 1,
      CustomsBookTypeName: 'יבוא',
      PartCustomsItemID: 64000000,
      PartDescription: 'הנעלה, כיסויי ראש, מטריות וכו׳',
      ChapterCustomsItemID: 6403,
      ChapterDescription: 'נעליים, מגפיים ודומיהם',
      MeasurementUnitID: 1,
      MeasurementUnitName: 'יחידה',
      Tariffs: [
        {
          TariffID: 7771,
          StartDate: new Date('2025-01-01') as any,
          EndDate: new Date('2026-12-31') as any,
          TradeAgreementID: 10,
          TradeAgreementTitle: 'הסכם לדוגמה',
          QuotaID: 5,
          QuotaTitle: 'מכסה לדוגמה',
          WithoutQuota_ComputationMethodDataID: 100,
          WithoutQuota_CalculationReference: '12%',
          WithoutQuota_OptionalTaxAddition: 0,
          WithinQuota_ComputationMethodDataID: 101,
          WithinQuota_CalculationReference: '6%',
          WithinQuota_OptionalTaxAddition: 0,
        },
      ],
      Regularities: [
        {
          RegularityRequirementID: 9001,
          StartDate: new Date('2024-01-01') as any,
          EndDate: new Date('2026-12-31') as any,
          RegularitySourceCodeID: 1,
          RegularitySourceName: 'משרד הכלכלה',
          RegularityPublicationCodeID: 20,
          RegularityPublicationName: 'יבוא אישי',
          ImportType: 'personal',
          RequirementGoodsDescription: 'הנעלה לצרכן סופי',
          ConfirmationTypeID: 3,
          ConfirmationTypeName: 'אישור',
          AuthorityID: 7,
          AuthorityName: 'מכון התקנים',
          TextualCondition: 'נדרש סימון תקין על המוצר',
          TrNumber: 1234,
        },
        {
          RegularityRequirementID: 9002,
          StartDate: new Date('2024-01-01') as any,
          EndDate: new Date('2026-12-31') as any,
          RegularitySourceCodeID: 2,
          RegularitySourceName: 'משרד הבריאות',
          RegularityPublicationCodeID: 10,
          RegularityPublicationName: 'מסחרי',
          ImportType: 'commercial',
          RequirementGoodsDescription: 'בדיקת חומרים / תוויות',
          ConfirmationTypeID: 2,
          ConfirmationTypeName: 'רישיון',
          AuthorityID: 5,
          AuthorityName: 'רשות מוסמכת',
          TextualCondition: 'אישור יבואן מורשה',
          TrNumber: null,
        },
      ],
    } as any;
  }

  get filteredRegularities() {
    const all = this.details?.Regularities ?? [];

    if (this.lawFilter === 'personal') {
      return all.filter((r) => r.ImportType === 'personal');
    }

    if (this.lawFilter === 'commercial') {
      return all.filter((r) => r.ImportType === 'commercial');
    }

    return all;
  }

  copyCustomsCode(item: CustomsBookSearchResult, event: Event): void {
    event.stopPropagation();

    const code = item.FullClassification.replace(/\s+/g, '');

    navigator.clipboard.writeText(code).then(() => {
      this.messageService.add({
        severity: 'success',
        summary: '',
        detail: 'פרט המכס הועתק בהצלחה',
        life: 2000,
      });
    });
  }

  
}
