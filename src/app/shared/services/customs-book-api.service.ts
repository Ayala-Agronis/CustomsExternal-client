import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiConfig } from '../../config/api-endpoints';
import {
  CustomsBookDetails,
  CustomsBookSearchResult
} from '../models/customs-book.models';

export type LawFilter = 'all' | 'personal' | 'commercial';

@Injectable({
  providedIn: 'root'
})
export class CustomsBookApiService {

  private readonly baseUrl = `${apiConfig.customsdbApiUrl}CustomsBook`;

  constructor(private http: HttpClient) {}

  search(
    term: string,
    bookTypeId: number,
  ): Observable<CustomsBookSearchResult[]> {

    const params = new HttpParams()
      .set('term', term)
      .set('bookTypeId', bookTypeId.toString())

    return this.http.get<CustomsBookSearchResult[]>(
      `${this.baseUrl}/search`,
      { params }
    );
  }

  details(
    customsItemId: number,
    lawFilter: LawFilter
  ): Observable<CustomsBookDetails> {

    const params = new HttpParams()
      .set('customsItemId', customsItemId.toString())
      .set('lawFilter', lawFilter);

    return this.http.get<CustomsBookDetails>(
      `${this.baseUrl}/details`,
      { params }
    );
  }
}
