import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { RadioButtonModule } from 'primeng/radiobutton';
import { UserService } from '../../shared/services/user.service';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { Router } from '@angular/router';
import { Message, MessageService } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, CardModule, RadioButtonModule, InputTextModule, PasswordModule, ProgressSpinnerModule, MessagesModule],
  providers: [MessageService],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss'
})
export class RegistrationComponent implements OnInit {
  registrationForm!: FormGroup;
  isLoading: boolean = false;
  msg: Message[] = [];

  constructor(private fb: FormBuilder, private userService: UserService, private router: Router) {
    this.registrationForm = this.fb.group({
      FirstName: ['', [Validators.required, Validators.pattern('^[א-תA-Za-z ]+$')]],
      LastName: ['', [Validators.required, Validators.pattern('^[א-תA-Za-z ]+$')]],
      Mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      Email: ['', [Validators.required, Validators.email]],
      Password: ['', [Validators.required, Validators.minLength(6)]],
      CustomerType: ['', [Validators.required]],
      Id: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(9)]],
    });
  }
  ngOnInit(): void {

  }

  onSubmit() {
    if (this.registrationForm.valid) {
      this.isLoading = true
      console.log(this.registrationForm.value);
      this.userService.signUp(this.registrationForm.value).subscribe(
        res => {
          this.isLoading = false
          console.log(res);
          this.router.navigate(['login'], { state: { user: res.body } })
        }
      )
    } else {
      this.msg = [
        { severity: 'error', summary: 'שליחת מסמך למכס', detail: 'אנא מלא את כל השדות הנדרשים' },
      ];
    }
  }

  getErrorMessage(controlName: string): string {
    const control = this.registrationForm.get(controlName);
    if (control?.hasError('required')) {
      return 'שדה זה הוא חובה';
    }
    if (control?.hasError('pattern')) {
      switch (controlName) {
        case 'FirstName':
        case 'LastName':
          return 'יש להזין שם תקין (בעברית או באנגלית)';
        case 'Mobile':
          return 'יש להזין מספר סלולרי תקין בן 10 ספרות';
      }
    }
    if (control?.hasError('email')) {
      return 'כתובת המייל אינה תקינה';
    }
    if (control?.hasError('minlength')) {
      return 'הקש לפחות 6 תווים';
    }
    if (control?.hasError('maxlength')) {
      return 'הקש עד 9 ספרות';
    }
    return '';
  }

}
