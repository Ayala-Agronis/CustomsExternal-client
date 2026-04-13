import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable,map,of,catchError } from 'rxjs';
import { apiConfig } from '../../config/api-endpoints';

@Injectable({
  providedIn: 'root',
})
export class DocumentService {
  constructor(private http: HttpClient) {}

  getDocumentsByEntityId$(id: string): Observable<any> {
    return this.http.get<any>(
      `${apiConfig.customsdbApiUrl}Documents/entity/${id}`,
    );
    // return this.http.get<any>(`${environment.customsExternalApiUrl}Document/entity/${id}`);
  }

  getDocumentsById$(id: string): Observable<any> {
    return this.http.get<any>(`${apiConfig.customsdbApiUrl}Documents/${id}`);
    // return this.http.get<any>(`${environment.customsExternalApiUrl}Document/${id}`);
  }

  postDocuments$(document: any): Observable<any> {
    return this.http.post<any>(
      `${apiConfig.customsdbApiUrl}Documents`,
      document,
    );
    // return this.http.post<any>(`${environment.customsExternalApiUrl}Document`, document);
  }

  uploadDocument(formData: FormData) {
    return this.http.post(`${apiConfig.azureBlobsUrl}BlobUtils`, formData);
  }

  // sendToCustoms$(formData: FormData): Observable<any> {
  //   return this.http.post(`${apiConfig.customsApiUrl}AddDocuments_2715`, formData);
  // }
  // sendToCustoms$(formData: FormData): Observable<any> {
  //   return this.http.post(
  //     `${apiConfig.customsdocSendApiUrl}AddDocument`,
  //     formData,
  //   );
  // }

  // sendToCustoms$(formData: FormData): Observable<any> {
  //   console.log(
  //     'send url:',
  //     `${apiConfig.customsdocSendApiUrl}AddDocument/SendUnsignedDocument`,
  //   );
  //   return this.http.post(
  //     `${apiConfig.customsdocSendApiUrl}AddDocument/SendUnsignedDocument`,
  //     formData,
  //   );
  // }

  sendToCustoms$(formData: FormData): Observable<any> {
    console.log(
      'send url:',
      `${apiConfig.customsApiUrl}AddDocuments_2715/SendUnsignedDocument`,
    );
    return this.http.post(
      `${apiConfig.customsApiUrl}AddDocuments_2715/SendUnsignedDocument`,
      formData,
    );
  }
  // deleteDocumetAttributes$(docId: string): Observable<any> {
  //   return this.http.delete(`${environment.customsExternalApiUrl}DocumentAttribute/${docId}`)
  // }

  updateDocument$(id: string, doc: any): Observable<any> {
    return this.http.put(`${apiConfig.customsdbApiUrl}Documents/${id}`, doc);
  }

  deleteDocument$(documentId: string): Observable<any> {
    return this.http.delete<any>(
      `${apiConfig.customsdbApiUrl}Documents/${documentId}`,
    );
  }

  addDocumentAttributes$(attrs: any[]): Observable<any> {
    return this.http.post<any>(
      `${apiConfig.customsdbApiUrl}DocumentAttribute`,
      attrs,
    );
  }

  deleteDocumetAttributes$(docId: string): Observable<any> {
    return this.http.delete(
      `${apiConfig.customsdbApiUrl}DocumentAttribute/${docId}`,
    );
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

  hasDocumentsForDeclaration$(declarationId: string): Observable<boolean> {
    return this.getDocumentsByEntityId$(declarationId).pipe(
      map((docs: any[]) => Array.isArray(docs) && docs.length > 0),
      catchError((err) => {
        if (err?.status === 404 || err?.status === 204) {
          return of(false);
        }
        return of(false);
      }),
    );
  }
}
