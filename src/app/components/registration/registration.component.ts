import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { RadioButtonModule } from 'primeng/radiobutton';
import { UserService } from '../../shared/services/user.service';
import { InputTextModule } from 'primeng/inputtext';
import { Password, PasswordModule } from 'primeng/password';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ActivatedRoute, Router } from '@angular/router';
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
  showPersonalDetails: boolean = false;
  user: any

  constructor(private fb: FormBuilder, private userService: UserService, private router: Router, private route: ActivatedRoute) {
    this.registrationForm = this.fb.group({
      FirstName: ['', [Validators.required, Validators.pattern('^[א-תA-Za-z ]+$')]],
      LastName: ['', [Validators.required, Validators.pattern('^[א-תA-Za-z ]+$')]],
      Mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      Email: ['', [Validators.required, Validators.email]],
      Password: ['', [Validators.required, Validators.minLength(6)]],
      CustomerType: ['', [Validators.required]],
      Id: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(9)]],
      RowId: [null],
    });
  }
  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['personalDetails']) {
        this.showPersonalDetails = true;
        this.user = JSON.parse(localStorage.getItem('user') || '{}');

        if (this.user) {
          this.registrationForm.patchValue({
            FirstName: this.user.FirstName,
            LastName: this.user.LastName,
            Mobile: this.user.Mobile,
            Email: this.user.Email,
            CustomerType: this.user.CustomerType,
            Id: this.user.Id,
            RowId: this.user.RowId,
            Password: this.user.Password,
          });
        }
      }
    });
  }

  onSubmit() {
    if (this.registrationForm.valid) {
      this.isLoading = true
      console.log(this.registrationForm.value);
      if (!this.showPersonalDetails) {
        this.userService.signUp(this.registrationForm.value).subscribe(
          res => {
            this.isLoading = false
            console.log(res);
            this.router.navigate(['login'], { state: { user: res.body } })
          }
        )
      }
      //save updated details
      else {debugger
        this.userService.editUser(this.user.RowId, this.registrationForm.value).subscribe( res => {
          this.isLoading = false
          console.log(res);
          this.msg = [
            { severity: 'success', summary: '', detail: 'העדכון התבצע בהצלחה' },
          ];
        })
      }
    } else {
      this.msg = [
        { severity: 'error', summary: '', detail: 'אנא מלא את כל השדות הנדרשים' },
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
