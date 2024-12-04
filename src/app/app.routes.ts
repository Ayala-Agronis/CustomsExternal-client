import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./components/declaration-form/declaration-form.component').then(c => c.DeclarationFormComponent), pathMatch: 'full' },
    { path: 'register', loadComponent: () => import('./components/registration/registration.component').then(c => c.RegistrationComponent), pathMatch: 'full' },
    { path: 'dec-form', loadComponent: () => import('./components/declaration-form/declaration-form.component').then(c => c.DeclarationFormComponent), pathMatch: 'full' },
];
