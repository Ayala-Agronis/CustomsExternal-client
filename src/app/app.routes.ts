import { Routes } from '@angular/router';
import { AuthGuard } from './shared/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/home-page/home-page.component').then(
        (c) => c.HomePageComponent,
      ),
    pathMatch: 'full',
    // data: { title: 'דף ראשי' },
    data: { title: 'customsil' },
  },
  {
    path: 'home-page',
    loadComponent: () =>
      import('./components/home-page/home-page.component').then(
        (c) => c.HomePageComponent,
      ),
    // data: { title: 'דף הבית' },
    data: { title: 'customsil' },
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./components/registration/registration.component').then(
        (c) => c.RegistrationComponent,
      ),
    data: { title: 'הרשמה' },
  },
  {
    path: 'personal-details',
    loadComponent: () =>
      import('./components/registration/registration.component').then(
        (c) => c.RegistrationComponent,
      ),
    data: { title: 'פרטים אישיים' },
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/login/login.component').then(
        (c) => c.LoginComponent,
      ),
    data: { title: 'התחברות' },
  },
  {
    path: 'callback',
    loadComponent: () =>
      import('./components/declaration-main/declaration-main.component').then(
        (c) => c.DeclarationMainComponent,
      ),
    data: { title: '' },
  },
  {
    path: 'independent-payment',
    loadComponent: () =>
      import('./components/independent-payment/independent-payment.component').then(
        (c) => c.IndependentPaymentComponent,
      ),
    data: { title: ' תשלום מיסים באופן עצמאי' },
  },
  {
    path: 'dec-query',
    loadComponent: () =>
      import('./components/declaration-query/declaration-query.component').then(
        (c) => c.DeclarationQueryComponent,
      ),
    data: { title: ' הצהרות ' },
  },
  {
    path: 'search-vendor',
    loadComponent: () =>
      import('./components/search-vendor/search-vendor.component').then(
        (c) => c.SearchVendorComponent,
      ),
    data: { title: ' חיפוש ספק ' },
  },
  {
    path: 'customs-book-query',
    loadComponent: () =>
      import('./components/customs-book-query/customs-book-query.component').then(
        (c) => c.CustomsBookQueryComponent,
      ),
    data: { title: 'תעריף מכס' },
  },

  {
    path: 'privacy',
    loadComponent: () =>
      import('./components/privacy-policy/privacy-policy.component').then(
        (c) => c.PrivacyPolicyComponent,
      ),
    data: { title: 'מדיניות ביטול שירות והחזר כספי' },
  },

  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./components/forgot-password/forgot-password.component').then(
        (c) => c.ForgotPasswordComponent,
      ),
    data: { title: 'שכחתי סיסמה' },
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./components/reset-password/reset-password.component').then(
        (c) => c.ResetPasswordComponent,
      ),
    data: { title: 'איפוס סיסמה' },
  },

  // 🌟 השורה החדשה: מאפשרת גישה ישירה בלי 'declaration-main' עבור אורחים עם GUID.
  // שימי לב שהיא משתמשת ב-AuthGuard, והוא יאשר אותה אוטומטית בזכות התיקון שכבר עשית בו!
  // 🌟 הנתיב הציבורי האמיתי: מאפשר גישה מלאה וחופשית מהמייל (גם בהצלחה וגם בכישלון)
  {
    path: 'commission-payment',
    loadComponent: () =>
      import('./components/commission-payment/commission-payment.component').then(
        (c) => c.CommissionPaymentComponent,
      ),
    // 🛑 מחקנו מכאן את: canActivate: [AuthGuard],
    data: { title: 'תשלום עמלה חיצוני' },
  },

  {
    path: 'declaration-main',
    loadComponent: () =>
      import('./components/declaration-main/declaration-main.component').then(
        (c) => c.DeclarationMainComponent,
      ),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dec-form',
        loadComponent: () =>
          import('./components/declaration-form/declaration-form.component').then(
            (c) => c.DeclarationFormComponent,
          ),
        data: { title: 'טופס הצהרה' },
      },
      {
        path: 'dec-form-ts',
        loadComponent: () =>
          import('./components/declaration-form-Ts/declaration-form-Ts.component').then(
            (c) => c.DeclarationFormTsComponent,
          ),
        data: { title: 'טופס שטעון' },
      },
      {
        path: 'add-doc',
        loadComponent: () =>
          import('./components/add-documents/add-documents.component').then(
            (c) => c.AddDocumentsComponent,
          ),
        data: { title: 'הוספת מסמכים' },
      },
      {
        path: 'commission-payment',
        loadComponent: () =>
          import('./components/commission-payment/commission-payment.component').then(
            (c) => c.CommissionPaymentComponent,
          ),
        data: { title: ' תשלום עמלה' },
      },
      {
        path: 'independent-payment',
        loadComponent: () =>
          import('./components/independent-payment/independent-payment.component').then(
            (c) => c.IndependentPaymentComponent,
          ),
        data: { title: ' תשלום מיסים באופן עצמאי' },
      },
      {
        path: 'dec-print',
        loadComponent: () =>
          import('./components/declaration-print/declaration-print.component').then(
            (c) => c.DeclarationPrintComponent,
          ),
        data: { title: ' תשלום מיסים באופן עצמאי' },
      },
    ],
  },
];
