import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Registration } from '../models/registration';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private userURL = `${environment.customsExternalApiUrl}User/`;
  IsConncet: boolean = false;

  constructor(private http: HttpClient) { }

  getUsers(): Observable<HttpResponse<any>> {
    return this.http.get<any>(this.userURL);
  }

  signUp(user: Registration): Observable<HttpResponse<any>> {
    return this.http.post<any>(this.userURL, user, { observe: 'response' });
  }

  login(user: any): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.userURL}login`, user, { observe: 'response' });
  }

  loginByGoogle(user: any): Observable<HttpResponse<any>> {
    return this.http.post<any>(`${this.userURL}loginByGoogle`, user, { observe: 'response' });
  }

  getDetails(code: string): Observable<any> {
    // const apiUrl = `${environment.customsExternalApiUrl}GoogleLogin/auth/${encodeURIComponent(code)}`;
    // console.log(`${environment.customsExternalApiUrl}GoogleLogin/auth`, { code });

    // return this.http.post<any>(`${environment.customsExternalApiUrl}GoogleLogin/auth`, { code });

    const formData = new HttpParams()
      .set('Code', code);

    return this.http.post<any>(`${environment.customsExternalApiUrl}GoogleLogin/auth`, formData.toString(), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })

  }


}
