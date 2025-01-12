import { Routes } from '@angular/router';

export const routes: Routes = [

  { path: '', loadComponent: () => import('./components/home-page/home-page.component').then(c => c.HomePageComponent), pathMatch: 'full', data: { title: 'דף ראשי' } },
  { path: 'home-page', loadComponent: () => import('./components/home-page/home-page.component').then(c => c.HomePageComponent), data: { title: 'דף הבית' } },
  { path: 'register', loadComponent: () => import('./components/registration/registration.component').then(c => c.RegistrationComponent), data: { title: 'הרשמה' } },
  { path: 'login', loadComponent: () => import('./components/login/login.component').then(c => c.LoginComponent), data: { title: 'התחברות' } },
  { path: 'callback', loadComponent: () => import('./components/home-page/home-page.component').then(c => c.HomePageComponent), data: { title: 'התחברות' } },
  { path: 'independent-payment', loadComponent: () => import('./components/independent-payment/independent-payment.component').then(c => c.IndependentPaymentComponent), data: { title: ' תשלום מיסים באופן עצמאי' } },

  // { path: 'dec-form', loadComponent: () => import('./components/declaration-form/declaration-form.component').then(c => c.DeclarationFormComponent), data: { title: 'טופס הצהרה' } },
  { path: 'docs', loadComponent: () => import('./components/documents/documents.component').then(c => c.DocumentsComponent), data: { title: 'מסמכים' } },
  {
    path: 'declaration-main', loadComponent: () => import('./components/declaration-main/declaration-main.component').then(c => c.DeclarationMainComponent), children: [
      { path: '', redirectTo: 'home-page', pathMatch: 'full' },
      { path: 'dec-form', loadComponent: () => import('./components/declaration-form/declaration-form.component').then(c => c.DeclarationFormComponent), data: { title: 'טופס הצהרה' } },
      { path: 'add-doc', loadComponent: () => import('./components/add-documents/add-documents.component').then(c => c.AddDocumentsComponent), data: { title: 'הוספת מסמכים' } },
      { path: 'commission-payment', loadComponent: () => import('./components/commission-payment/commission-payment.component').then(c => c.CommissionPaymentComponent), data: { title: ' תשלום עמלה' } },
      { path: 'independent-payment', loadComponent: () => import('./components/independent-payment/independent-payment.component').then(c => c.IndependentPaymentComponent), data: { title: ' תשלום מיסים באופן עצמאי' } },
      { path: 'dec-print', loadComponent: () => import('./components/declaration-print/declaration-print.component').then(c => c.DeclarationPrintComponent), data: { title: ' תשלום מיסים באופן עצמאי' } },
    ]
  }
];

