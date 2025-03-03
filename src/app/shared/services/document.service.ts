import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {

  constructor(private http: HttpClient) { }

  getDocumentsByEntityId$(id: string): Observable<any> {    
    return this.http.get<any>(`${environment.customsdbApiUrl}Documents/entity/${id}`);
    // return this.http.get<any>(`${environment.customsExternalApiUrl}Document/entity/${id}`);
  }

  getDocumentsById$(id: string): Observable<any> { 
    return this.http.get<any>(`${environment.customsdbApiUrl}Documents/${id}`);
    // return this.http.get<any>(`${environment.customsExternalApiUrl}Document/${id}`);
  }

  postDocuments$(document: any): Observable<any> {
    return this.http.post<any>(`${environment.customsdbApiUrl}Documents`, document);
    // return this.http.post<any>(`${environment.customsExternalApiUrl}Document`, document);
  } 
  
  uploadDocument(formData: FormData) {
    return this.http.post(`${environment.azureBlobsUrl}BlobUtils`, formData);
  }

  sendToCustoms$(formData: FormData): Observable<any> {
    return this.http.post(`${environment.customsApiUrl}AddDocuments_2715`, formData);
  }

  // deleteDocumetAttributes$(docId: string): Observable<any> {
  //   return this.http.delete(`${environment.customsExternalApiUrl}DocumentAttribute/${docId}`)
  // }
  
  updateDocument$(id: string, doc: any):Observable<any> {
    return this.http.put(`${environment.customsdbApiUrl}Documents/${id}`, doc);
  }

  deleteDocument$(documentId: string): Observable<any> {
    return this.http.delete<any>(`${environment.customsdbApiUrl}Documents/${documentId}`);
  }

  // deleteDocument$(documentId: string): Observable<any> {
  //   return this.http.delete<any>(`${environment.customsExternalApiUrl}Document/${documentId}`);
  // }

   // updateDocument$(id: string, doc: any):Observable<any> {
  //   return this.http.put(`${environment.customsExternalApiUrl}Document/${id}`, doc);
  // }

  // sendDocToInternalDB(document: any): Observable<any> {
  //   return this.http.post<any>(`${environment.customsdbApiUrl}Documents`, document);
  // }
}
