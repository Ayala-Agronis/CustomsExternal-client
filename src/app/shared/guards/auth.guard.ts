import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // 🌟 שינוי: אם מגיעים עם guid ב-Query Params, מאשרים כניסה אוטומטית ללא טוקן
    const guid = route.queryParams['guid'];
    if (guid) {
      return true;
    }

    const token = localStorage.getItem('authToken');

    if (!token) {
      this.router.navigate(['/login']);
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;

      if (Date.now() > exp) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');

        this.router.navigate(['/login']);
        return false;
      }

      return true;

    } catch (e) {
      localStorage.clear();
      this.router.navigate(['/login']);
      return false;
    }
  }
}