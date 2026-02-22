import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
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
  ],
})
export class CustomsBookQueryComponent {
  loading = false;
  msgs: Message[] = [];

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

  constructor(private api: CustomsBookApiService) {
    this.term$
      .pipe(
        debounceTime(350),
        distinctUntilChanged(),
        switchMap((q) => {
          const t = (q || '').trim();
          if (t.length < 4) {
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

  // PrimeNG AutoComplete completeMethod
  onSearch(event: any) {
    this.term$.next(event?.query ?? '');
  }

  // PrimeNG onSelect - item הוא האובייקט שנבחר
  onPick(item: CustomsBookSearchResult) {
    this.selectedItem = item;
    this.lawFilter = 'all';
    this.loadDetails();
  }

  setLawFilter(f: LawFilter) {
    if (!this.selectedItem) return;
    this.lawFilter = f;
    this.loadDetails();
  }

  onContextChanged() {
    // שינוי ספר מכס או תאריך -> איפוס
    this.term = '';
    this.suggestions = [];
    this.selectedItem = null;
    this.details = null;
    this.msgs = [];
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
}
