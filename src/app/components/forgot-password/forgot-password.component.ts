import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessagesModule } from 'primeng/messages';
import { Message } from 'primeng/api';
import { UserService } from '../../shared/services/user.service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ProgressSpinnerModule,
    MessagesModule,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  form: FormGroup;
  loading = false;
  msg: Message[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private router: Router,
  ) {
    this.form = this.fb.group({
      Email: ['', [Validators.required, Validators.email]],
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.msg = [
        { severity: 'error', summary: '', detail: 'יש להזין כתובת מייל תקינה' },
      ];
      return;
    }

    this.loading = true;
    this.msg = [];

    const email = this.form.value.Email;

    this.userService
      .forgotPassword(email)
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
      )
      .subscribe({
        next: (res) => {
          this.msg = [
            {
              severity: 'success',
              summary: '',
              detail: res.body?.message || 'נשלחה הודעה לכתובת המייל שהוזנה.',
            },
          ];
        },
        error: (err) => {
          let errorMessage = 'אירעה שגיאה בלתי צפויה. נסה שוב מאוחר יותר.';

          if (err.status === 404) {
            errorMessage =
              err.error?.message || 'כתובת המייל אינה קיימת במערכת.';
          } else if (err.status === 400) {
            errorMessage = err.error?.message || 'יש להזין כתובת מייל תקינה.';
          } else if (err.status === 500 || err.status === 0) {
            errorMessage = 'אירעה שגיאה בלתי צפויה. נסה שוב מאוחר יותר.';
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
}
