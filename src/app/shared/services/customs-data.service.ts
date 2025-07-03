import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { apiConfig } from '../../config/api-endpoints';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomsDataService {

  constructor(private http: HttpClient) { }

  getCustomsTableValues$(id: string): Observable<any> {
    const url = `${apiConfig.customsdbApiUrl}/Sys`;
    return this.http.get<any>(url, { params: { id } });
  }

  getVendor$(): Observable<any> {
    const url = `${apiConfig.customsdbApiUrl}/vendors`;
    return this.http.get<any>(url);
  }

  GetSeq$(type: any): Observable<any> {
    return this.http.get<any>(`${apiConfig.customsdbApiUrl}GetSeq/${type}`);
  }

  GetClient$(ID: any): Observable<any>  {
    let body = new HttpParams()
      .set('Id',ID)
      .set('Passport','')

    return this.http.post(`${apiConfig.customsApiUrl}ImporterDetails`,
      body.toString(),
      {
        headers: new HttpHeaders()
          .set('Content-Type', 'application/x-www-form-urlencoded')
      }
    );
  }


}
