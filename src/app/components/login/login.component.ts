import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { UserService } from '../../shared/services/user.service';
import { ActivatedRoute } from '@angular/router';

interface Window {
  gapi: any;
}


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CardModule, InputTextModule, PasswordModule],
  templateUrl: './login.component.html',
  // styleUrls: ['./login.component.scss', '../registration/registration.component.scss']
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  loginForm!: FormGroup;

  constructor(private fb: FormBuilder, private userService: UserService, private route: ActivatedRoute) {
    this.loginForm = this.fb.group({
      Email: ['', [Validators.required, Validators.email]],
      Password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const code = params['code'];
      console.log(code);

      if (code)
        this.userService.getDetails(code).subscribe(res => {
          console.log(res);
          if (res.Email)
            this.userService.loginByGoogle(res).subscribe((res: any) => {
              console.log(res)
              alert('hi' + res.FirsName)
            }
            )
        })
    });
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
      console.log(this.loginForm.value);
      this.userService.login(this.loginForm.value).subscribe(
        res => {
          console.log(res);
        },
        error => {
          console.error('Error:', error);
          alert('שגיאה.');
        }
      )
    } else {
      alert('אנא מלא את כל השדות הנדרשים');
    }
  }
}