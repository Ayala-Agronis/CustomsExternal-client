// ✅ login.component.ts
import { CommonModule } from '@angular/common';
import {
  Component,
  AfterViewInit,
  ChangeDetectorRef,
  NgZone,
  ViewChild,
  ElementRef,
  OnInit,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { UserService } from '../../shared/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Message, MessageService } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { CustomsDataService } from '../../shared/services/customs-data.service';
import { MixpanelService } from '../../shared/services/mixpanel.service';

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
    MessagesModule,
  ],
  providers: [MessageService],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit, AfterViewInit {
  loginForm!: FormGroup;
  loading = false;
  msg: Message[] = [];

  @ViewChild('emailInput') emailInput!: ElementRef;
  @ViewChild('passwordInput') passwordInput!: ElementRef;
  typeDec: string = 'tr';
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private route: ActivatedRoute,
    private router: Router,
    private customsDataService: CustomsDataService,
    private cd: ChangeDetectorRef,
    private zone: NgZone,
    private mixpanel: MixpanelService,
  ) {
    this.loginForm = this.fb.group({
      Email: [
        '',
        {
          validators: [Validators.required, Validators.email],
          updateOn: 'change',
        },
      ],
      Password: [
        '',
        {
          validators: [Validators.required, Validators.minLength(6)],
          updateOn: 'change',
        },
      ],
    });
  }

  ngOnInit(): void {
    this.typeDec = localStorage.getItem('decType') || '';

    const user = history.state.user;
    if (user) {
      this.loginForm.controls['Email'].patchValue(user.Email);
      this.loginForm.controls['Password'].patchValue(user.Password);
    }

    // הוספה חדשה - בדיקה אם המשתמש הגיע אחרי הרשמה
    this.route.queryParams.subscribe((params) => {
      console.log('Query params:', params);
      console.log('registered value:', params['registered']);
      console.log('is true?:', params['registered'] === 'true');

      if (params['registered'] === 'true') {
        console.log('Setting message!');
        this.msg = [
          {
            severity: 'info',
            summary: '!נרשמת בהצלחה',
            detail: 'אשר את המייל שנשלח אליך כדי להתחבר',
          },
        ];
        console.log('msg after set:', this.msg);
      }
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      const emailCtrl = this.loginForm.get('Email');
      const passCtrl = this.loginForm.get('Password');

      const emailInput = document.getElementById('email') as HTMLInputElement;
      const passInput = document.getElementById('password') as HTMLInputElement;

      if (emailInput?.value && emailCtrl) {
        emailCtrl.setValue(emailInput.value);
      }

      if (passInput?.value && passCtrl) {
        passCtrl.setValue(passInput.value);
      }

      const overlayPanel = document.querySelector('.p-password-panel');
      if (overlayPanel) {
        (overlayPanel as HTMLElement).style.display = 'none';
      }

      this.cd.detectChanges();
    }, 300);
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
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
      console.log('in login');

      this.userService.login(this.loginForm.value).subscribe({
        next: (res) => {
          if (res.body.token) {
            localStorage.setItem('authToken', res.body.token);
            localStorage.setItem('isRegister', 'true');
            localStorage.setItem('userId', res.body.user.Id);

            this.customsDataService
              .GetClient$(res.body.Id)
              .subscribe((client) => {
                const status =
                  client?.generalCustomerDataField?.costomerStatusForCAField;
                localStorage.setItem(
                  'isClientAuthorized',
                  status === 6 ? 'false' : 'true',
                );
              });

            const userJson = JSON.stringify(res.body.user);
            localStorage.setItem('user', userJson);

            const user = res.body.user;
            this.mixpanel.identify(user.Id);
            this.mixpanel.setUserProperties({
              $name: `${user.FirstName} ${user.LastName}`,
              $email: user.Email,
              customerType: user.CustomerType,
              mobile: user.Mobile,
            });
            this.mixpanel.track('Login Successful', {
              email: user.Email,
              customerType: user.CustomerType,
            });
          }
          this.router.navigate(['home-page']);

          // if (this.typeDec == 'tr')
          //   this.router.navigate(['declaration-main/dec-form-ts']);
          // else
          //   this.router.navigate(['declaration-main/dec-form']);
        },

        error: (error) => {
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

            this.loading = false;
          });
        },

        complete: () => {
          this.zone.run(() => {
            this.loading = false;
          });
        },
      });
    } else {
      this.msg = [
        {
          severity: 'error',
          summary: '',
          detail: 'אנא מלא את כל השדות הנדרשים',
        },
      ];
    }
  }

  navigateToRegister(): void {
    this.router.navigate(['register']);
  }
}
