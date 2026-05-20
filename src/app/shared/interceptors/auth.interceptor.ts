import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const token = localStorage.getItem('authToken');

    // 🟡 בדיקה אם הטוקן פג תוקף לפני שליחה
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000;

        if (Date.now() > exp) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');

          this.router.navigate(['/login']);
          return throwError(() => new Error('Token expired'));
        }

      } catch (e) {
        localStorage.clear();
        this.router.navigate(['/login']);
        return throwError(() => new Error('Invalid token'));
      }
    }

    // 🟢 הוספת הטוקן לבקשה
    const authReq = token
      ? req.clone({
          setHeaders: {
          Authorization: `Bearer ${token}`
          }
        })
      : req;

    return next.handle(authReq).pipe(
      catchError((error: HttpErrorResponse) => {

        if (error.status === 401) {
          localStorage.clear();
          this.router.navigate(['/login']);
        }

        return throwError(() => error);
      })
    );
  }
}
