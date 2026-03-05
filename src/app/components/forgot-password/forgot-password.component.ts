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
        { severity: 'error', summary: '', detail: 'אנא הזיני אימייל תקין' },
      ];
      return;
    }

    this.loading = true;
    this.msg = [];

    const email = this.form.value.Email;

    this.userService.forgotPassword(email).subscribe({
      next: () => {
        this.msg = [
          {
            severity: 'info',
            summary: '',
            detail: 'אם האימייל קיים במערכת, נשלחה הודעה עם קישור לאיפוס סיסמה',
          },
        ];
      },
      error: () => {
        this.msg = [
          {
            severity: 'info',
            summary: '',
            detail: 'אם האימייל קיים במערכת, נשלחה הודעה עם קישור לאיפוס סיסמה',
          },
        ];
      },
      complete: () => (this.loading = false),
    });
  }

  backToLogin(): void {
    this.router.navigate(['login']);
  }
}
