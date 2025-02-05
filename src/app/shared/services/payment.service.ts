import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PaymentService {

  constructor(private http: HttpClient) { }

  private apiUrl = `${environment.customsdbApiUrl}SaveData/`;

  saveCustomerPayment(customersPayment: any): Observable<any> {
    const headers = new HttpHeaders().set('Data-Type', 'CustomersPayment');
    return this.http.post(this.apiUrl, customersPayment, { headers });
  }

  isDecPaid(decId:any):Observable<any>{
    return this.http.get(`${environment.customsdbApiUrl}IsDecPaid?decId=${decId}`)
  }

}
