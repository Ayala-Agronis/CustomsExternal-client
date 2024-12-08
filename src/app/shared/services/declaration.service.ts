import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DeclarationService {

  private DecURL = `${environment.customsExternalApiUrl}Declaration/`;

  constructor(private http: HttpClient) { }

  addDeclaration(dec: any): Observable<HttpResponse<any>> {
    return this.http.post<any>(this.DecURL, dec, { observe: 'response' });
  }
}
