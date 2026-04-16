import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiConfig } from '../../config/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class CourierService {
  private baseUrl = `${apiConfig.customsApiUrl}Courier`;

  constructor(private http: HttpClient) {}

  getThirdKey$(waybillNumber: string, courierId: string): Observable<any> {
    return this.http.post<any>(this.baseUrl, {
      CourierBillOfLadingNumber: waybillNumber,
      CourierNumber: courierId,
    });
  }

  getCourierCompanies$(): Observable<any[]> {
    return this.http.get<any[]>(`${apiConfig.customsdbApiUrl}CourierCompanies`);
  }
}
