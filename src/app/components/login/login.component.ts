import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { UserService } from '../../shared/services/user.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Message, MessageService } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, InputTextModule, PasswordModule, ProgressSpinnerModule, MessagesModule],
  providers: [MessageService],
  templateUrl: './login.component.html',
  // styleUrls: ['./login.component.scss', '../registration/registration.component.scss']
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  loginForm!: FormGroup;
  loading = false
  msg: Message[] = [];

  constructor(private fb: FormBuilder, private userService: UserService, private route: ActivatedRoute, private router: Router) {
    this.loginForm = this.fb.group({
      Email: ['', [Validators.required, Validators.email]],
      Password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    // this.userService.getAllUsers().subscribe(response => {
    //   console.log('Users:', response);
    // }, error => {
    //   console.error('Error:', error);
    // });
    const user = history.state.user
    if (user) {
      this.loginForm.controls["Email"].patchValue(user.Email);
      this.loginForm.controls["Password"].patchValue(user.Password);
    }
    // this.route.queryParams.subscribe(params => {
    //   const code = params['code'];
    //   console.log(code);

    //   if (code)
    //     this.userService.getDetails(code).subscribe(res => {
    //       console.log(res);
    //       if (res.Email)
    //         this.userService.loginByGoogle(res).subscribe((res: any) => {
    //           console.log(res)

    //           this.msg = [
    //             { severity: 'success', summary: 'התחברות', detail: 'hi' + res.FirsName },
    //           ];
    //         }
    //         )
    //     })
    // });
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

  onSubmit() {
    if (this.loginForm.valid) {
      this.loading = true
      console.log(this.loginForm.value);
      this.userService.login(this.loginForm.value).subscribe(
        res => {
          this.loading = false
          console.log(res);
          if (res.body.token) {
            localStorage.setItem('authToken', res.body.token)
            localStorage.setItem('isRegister', "true")
            localStorage.setItem('userId', res.body.user.Id)
            console.log(res.body.user);

            const userJson = JSON.stringify(res.body.user);
            localStorage.setItem('user', userJson);

          }
          this.router.navigate(['declaration-main/dec-form']);
        },
        error => {
          this.loading = false

          if (error.status === 401) {
            console.log(this.loading);

            const errorMessage = error.error?.message || 'שגיאה באימות פרטי ההתחברות';
            this.msg = [
              { severity: 'error', summary: '', detail: errorMessage },
            ];
          } else {
            this.msg = [
              { severity: 'error', summary: '', detail: 'שגיאה בלתי צפויה. נסה שוב מאוחר יותר.' },
            ];
          }
        }
      )
    } else {
      this.msg = [
        { severity: 'error', summary: '', detail: 'אנא מלא את כל השדות הנדרשים' },
      ];
    }
  }
}