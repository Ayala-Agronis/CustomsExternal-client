import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomsDataService {

  constructor(private http: HttpClient) { }

  getCustomsTableValues$(id: string): Observable<any> {
    const url = `${environment.customsdbApiUrl}/Sys`;
    return this.http.get<any>(url, { params: { id } });
  }

  getVendor$(): Observable<any> {
    const url = `${environment.customsdbApiUrl}/vendors`;
    return this.http.get<any>(url);
  }

  GetSeq$(type: any): Observable<any> {
    return this.http.get<any>(`${environment.customsdbApiUrl}GetSeq/${type}`);
  }


}
