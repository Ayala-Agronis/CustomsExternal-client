import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { apiConfig } from '../../config/api-endpoints';

@Injectable({
  providedIn: 'root'
})
export class ClientClassificationService {

  constructor(private http: HttpClient) { }

saveAllClassifications$(classifications: any[], clientId: string): Observable<any> {
  const payload = {
    ClientID: clientId,
    Classifications: classifications
  };

  return this.http.post(`${apiConfig.customsdbApiUrl}SaveClientClassifications`, payload);
}


  getClassifications$(clientId: string): Observable<any> {
    const url = `${apiConfig.customsdbApiUrl}GetClientClassifications/${clientId}`;
    return this.http.get<any>(url);
  }

  addClassification$(data: any): Observable<any> {
    const url = `${apiConfig.customsdbApiUrl}AddClientClassification`;
    return this.http.post<any>(url, data, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }

  updateClassification$(data: any): Observable<any> {
    const url = `${apiConfig.customsdbApiUrl}UpdateClientClassification`;
    return this.http.put<any>(url, data, {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' })
    });
  }
}
