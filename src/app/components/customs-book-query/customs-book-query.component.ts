import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, switchMap, tap } from 'rxjs/operators';

import { Message } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { TableModule } from 'primeng/table';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessagesModule } from 'primeng/messages';
import { ButtonModule } from 'primeng/button';

import { CustomsBookApiService, LawFilter } from '../../shared/services/customs-book-api.service';
import { CustomsBookDetails, CustomsBookSearchResult } from '../../shared/models/customs-book.models';

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
    ButtonModule
  ]
})
export class CustomsBookQueryComponent {

  loading = false;
  msgs: Message[] = [];

  bookTypes = [
    { name: 'יבוא', id: 1 },
    { name: 'יצוא', id: 2 },
      { name: 'אוטונומיה', id: 3 }

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
        switchMap(q => {
          const t = (q || '').trim();
          if (t.length < 4) {
            this.suggestions = [];
            return of([]);
          }
          this.loading = true;
          return this.api.search(t, this.bookTypeId).pipe(
            catchError(_ => {
              this.msgs = [{ severity: 'error', summary: 'שגיאה', detail: 'חיפוש נכשל' }];
              return of([]);
            }),
            tap(() => (this.loading = false))
          );
        })
      )
      .subscribe(res => (this.suggestions = res || []));
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

    this.api.details(
      this.selectedItem.customsItemID,
      this.lawFilter
    )
    .pipe(
      catchError(_ => {
        this.msgs = [{ severity: 'error', summary: 'שגיאה', detail: 'טעינת פרטים נכשלה' }];
        return of(null);
      }),
      tap(() => (this.loading = false))
    )
    .subscribe(res => (this.details = res));
  }


  fmtDate(value?: string | null): string {
    return value ? value.substring(0, 10) : '';
  }
}