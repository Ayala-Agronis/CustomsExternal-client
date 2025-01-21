import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
// import { AuthService } from './auth.service'; 

@Injectable({
    providedIn: 'root'
})
export class AuthGuard implements CanActivate {

    constructor(private router: Router) { }

    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): Observable<boolean> | Promise<boolean> | boolean {
        // if (this.authService.isAuthenticated()) {
        //   return true;
        // }
        if (!localStorage.getItem('isRegister')) {
            this.router.navigate(['/login']);
            return false;
        }
        return true
        ;
    }
}