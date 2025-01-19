import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  constructor(private http: HttpClient) { }

  // getDocumentAttributes$(id: string): Observable<any> {
  //   return this.http.get<any>(`${environment.customsExternalApiUrl}DocumentAttribute/Get/${id}`);
  // }

  getDocumentsByEntityId$(id: string): Observable<any> {
    console.log(`${environment.customsExternalApiUrl}Document/entity/${id}`);
    
    return this.http.get<any>(`${environment.customsExternalApiUrl}Document/entity/${id}`);
  }

  getDocumentsById$(id: string): Observable<any> {
    return this.http.get<any>(`${environment.customsExternalApiUrl}Document/${id}`);
  }

  postDocuments$(document: any): Observable<any> {
    return this.http.post<any>(`${environment.customsExternalApiUrl}Document`, document);
  }

  // addDocumentAttribute$(document: any): Observable<any> {
  //   return this.http.post<any>(`${environment.customsExternalApiUrl}DocumentAttribute`, document);
  // }

  // updateDocumentAttribute$(id: string, documentAttributes: any): Observable<any> {
  //   return this.http.put(`${environment.customsExternalApiUrl}DocumentAttribute/${id}`, documentAttributes);
  // }  
  
  uploadDocument(formData: FormData) {
    return this.http.post(`${environment.azureBlobsUrl}BlobUtils`, formData);
  }

  sendToCustoms$(formData: FormData): Observable<any> {
    return this.http.post(`${environment.customsApiUrl}AddDocuments_2715`, formData);
  }

  updateDocument$(id: string, doc: any):Observable<any> {
    return this.http.put(`${environment.customsExternalApiUrl}Document/${id}`, doc);
  }

  // deleteDocumetAttributes$(docId: string): Observable<any> {
  //   return this.http.delete(`${environment.customsExternalApiUrl}DocumentAttribute/${docId}`)
  // }

  deleteDocument$(documentId: string): Observable<any> {
    return this.http.delete<any>(`${environment.customsExternalApiUrl}Document/${documentId}`);
  }

  sendDocToInternalDB(document: any): Observable<any> {
    return this.http.post<any>(`${environment.customsdbApiUrl}Documents`, document);
  }
}
