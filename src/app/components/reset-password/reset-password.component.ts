import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessagesModule } from 'primeng/messages';
import { Message } from 'primeng/api';
import { UserService } from '../../shared/services/user.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PasswordModule,
    ProgressSpinnerModule,
    MessagesModule,
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
})
export class ResetPasswordComponent implements OnInit {
  form: FormGroup;
  loading = false;
  msg: Message[] = [];
  token = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private userService: UserService,
  ) {
    this.form = this.fb.group(
      {
        NewPassword: ['', [Validators.required, this.passwordValidator()]],
        ConfirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordsMatchValidator() },
    );
  }

  // ✅ שימי את זה מחוץ ל-constructor
  passwordsMatchValidator(): ValidatorFn {
    return (group: AbstractControl): ValidationErrors | null => {
      const newPass = group.get('NewPassword')?.value;
      const confirm = group.get('ConfirmPassword')?.value;

      if (!newPass || !confirm) return null;

      return newPass === confirm ? null : { passwordsMismatch: true };
    };
  }

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!this.token) {
      this.msg = [
        { severity: 'error', summary: '', detail: 'קישור לא תקין (חסר token)' },
      ];
    }
  }

  submit(): void {
    if (!this.token) {
      this.msg = [
        { severity: 'error', summary: '', detail: 'הקישור אינו תקין.' },
      ];
      return;
    }

    const { NewPassword } = this.form.value;

    if (this.form.invalid) {
      this.msg = [
        {
          severity: 'error',
          summary: '',
          detail: 'יש לתקן את הסיסמה לפי הדרישות.',
        },
      ];
      return;
    }

    this.loading = true;
    this.msg = [];

    this.userService
      .resetPassword(this.token, NewPassword)
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe({
        next: () => {
          this.msg = [
            {
              severity: 'success',
              summary: '',
              detail: 'הסיסמה עודכנה בהצלחה. מתבצעת העברה להתחברות…',
            },
          ];
          setTimeout(() => this.router.navigate(['login']), 900);
        },
        error: (err) => {
          let errorMessage = 'אירעה שגיאה בלתי צפויה. נסה שוב מאוחר יותר.';

          if (err.status === 400) {
            errorMessage =
              err.error?.message || 'הקישור אינו תקין או שפג תוקפו.';
          }

          this.msg = [
            {
              severity: 'error',
              summary: '',
              detail: errorMessage,
            },
          ];
        },
      });
  }

  backToLogin(): void {
    this.router.navigate(['login']);
  }

  passwordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const hasNumber = /[0-9]/.test(value);
      const hasLetter = /[a-zA-Z]/.test(value);
      const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);
      const isValidChars =
        /^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/.test(value);
      const isLengthValid = value.length >= 8;

      if (!isValidChars) return { invalidChars: true };

      const valid = hasNumber && hasLetter && hasSpecial && isLengthValid;
      return valid ? null : { passwordStrength: true };
    };
  }

  getPasswordError(controlName: 'NewPassword' | 'ConfirmPassword'): string {
    const control = this.form.get(controlName);

    if (control?.hasError('required')) return 'סיסמה היא שדה חובה';

    if (controlName === 'NewPassword') {
      if (control?.hasError('invalidChars')) return 'הסר תווים לא חוקיים';
      if (control?.hasError('passwordStrength')) {
        const value = control.value || '';
        const missing: string[] = [];

        if (value.length < 8) missing.push('8 תווים');
        if (!/[a-zA-Z]/.test(value)) missing.push('אות באנגלית');
        if (!/[0-9]/.test(value)) missing.push('ספרה');
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value))
          missing.push('תו מיוחד');

        return 'חסר: ' + missing.join(', ');
      }
    }

    return '';
  }
}
