// ✅ login.component.ts
import { CommonModule } from '@angular/common';
import { Component, AfterViewInit, ChangeDetectorRef, NgZone, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { UserService } from '../../shared/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Message, MessageService } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { CustomsDataService } from '../../shared/services/customs-data.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    ProgressSpinnerModule,
    MessagesModule
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements AfterViewInit {

  loginForm!: FormGroup;
  loading = false;
  msg: Message[] = [];

  @ViewChild('emailInput') emailInput!: ElementRef;
  @ViewChild('passwordInput') passwordInput!: ElementRef;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private customsDataService: CustomsDataService,
    private cd: ChangeDetectorRef,
    private zone: NgZone
  ) {
    this.loginForm = this.fb.group({
      Email: ['', {
        validators: [Validators.required, Validators.email],
        updateOn: 'change'
      }],
      Password: ['', {
        validators: [Validators.required, Validators.minLength(6)],
        updateOn: 'change'
      }]
    });
  }

  ngOnInit(): void {
    const user = history.state.user;
    if (user) {
      this.loginForm.controls["Email"].patchValue(user.Email);
      this.loginForm.controls["Password"].patchValue(user.Password);
    }
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const emailCtrl = this.loginForm.get('Email');
      const passCtrl = this.loginForm.get('Password');

      const emailInput = document.getElementById('email') as HTMLInputElement;
      const passInput = document.getElementById('password') as HTMLInputElement;

      // לוודא שהערכים מתעדכנים ב־FormGroup גם כשמולאים אוטומטית
      if (emailInput?.value && emailCtrl) {
        emailCtrl.setValue(emailInput.value);
      }

      if (passInput?.value && passCtrl) {
        passCtrl.setValue(passInput.value);
      }

      // 💥 כאן החלק החדש – סגירת ה־Overlay של הסיסמה כדי שלא יחסום את הכפתור
      const overlayPanel = document.querySelector('.p-password-panel');
      if (overlayPanel) {
        (overlayPanel as HTMLElement).style.display = 'none';
      }

      // עדכון הידני ל־Change Detection
      this.cd.detectChanges();
    }, 300);
  }

  loginWithGoogle(): void {
    const googleLoginUrl =
      'https://accounts.google.com/o/oauth2/v2/auth/oauthchooseaccount?response_type=code' +
      '&client_id=671869099328-vs2trh5v6p8hsk1iodvi8mvp8n75fu63.apps.googleusercontent.com' +
      '&scope=profile%20email' +
      '&state=5gM0APxbCDaXWpU8J_5X0XVE_6gSTQvMynsUUqlFgK4%3D' +
      '&redirect_uri=http://localhost:4200/callback';

    window.location.href = googleLoginUrl;
    this.userService.IsConncet = true;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;

      this.userService.login(this.loginForm.value).subscribe({
        next: res => {
          if (res.body.token) {
            localStorage.setItem('authToken', res.body.token);
            localStorage.setItem('isRegister', "true");
            localStorage.setItem('userId', res.body.user.Id);

            this.customsDataService.GetClient$(res.body.Id).subscribe(client => {
              const status = client?.generalCustomerDataField?.costomerStatusForCAField;
              localStorage.setItem('isClientAuthorized', status === 6 ? 'false' : 'true');
            });

            const userJson = JSON.stringify(res.body.user);
            localStorage.setItem('user', userJson);
          }

          this.router.navigate(['declaration-main/dec-form']);
        },

        error: error => {
          this.zone.run(() => {
            let errorMessage = 'שגיאה בלתי צפויה. נסה שוב מאוחר יותר.';
            if (error.status === 401) {
              const errorCode = error.error?.code;
              if (errorCode === 'EmailNotConfirmed') {
                errorMessage = 'יש לאשר את ההרשמה בהודעה שנשלחה לאימייל שלך';
              } else if (errorCode === 'InvalidCredentials') {
                errorMessage = 'אימייל או סיסמה שגויים';
              } else {
                errorMessage = 'שגיאה באימות פרטי ההתחברות';
              }
            }

            this.msg = [
              { severity: 'error', summary: '', detail: errorMessage },
            ];

            this.loading = false; // 💥 עכשיו זה מתעדכן נכון
          });
        },

        complete: () => {
          this.zone.run(() => {
            this.loading = false;
          });
        }

      });

    } else {
      this.msg = [
        { severity: 'error', summary: '', detail: 'אנא מלא את כל השדות הנדרשים' },
      ];
    }
  }
}
