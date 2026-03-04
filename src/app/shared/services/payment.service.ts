import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { apiConfig } from '../../config/api-endpoints';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(private http: HttpClient) { }

  private apiUrl = `${apiConfig.customsdbApiUrl}SaveData/`;

  saveCustomerPayment(customersPayment: any): Observable<any> {
    const headers = new HttpHeaders().set('Data-Type', 'CustomersPayment');
    return this.http.post(this.apiUrl, customersPayment, { headers });
  }

  isDecPaid(decId:any):Observable<any>{
    return this.http.get(`${apiConfig.customsdbApiUrl}IsDecPaid?decId=${decId}`)
  }

}
