import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Registration } from '../models/registration';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private userURL = `${environment.customsExternalApiUrl}User/`;

  constructor(private http: HttpClient) { }

  getUsers(): Observable<HttpResponse<any>> {
    return this.http.get<any>(this.userURL);
  }
  
  signUp(user: Registration): Observable<HttpResponse<any>> {
    return this.http.post<any>(this.userURL, user, { observe: 'response' });
  }
}
