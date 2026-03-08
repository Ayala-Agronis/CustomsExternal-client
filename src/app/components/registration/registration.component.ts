import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { RadioButtonModule } from 'primeng/radiobutton';
import { UserService } from '../../shared/services/user.service';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ActivatedRoute, Router } from '@angular/router';
import { Message, MessageService } from 'primeng/api';
import { MessagesModule } from 'primeng/messages';
import { TableModule } from 'primeng/table';
import { ClientClassificationService } from '../../shared/services/client-classification.service';
import { CheckboxModule } from 'primeng/checkbox';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ReactiveFormsModule,
    CheckboxModule,
    ButtonModule,
    CardModule,
    RadioButtonModule,
    InputTextModule,
    PasswordModule,
    ProgressSpinnerModule,
    MessagesModule,
  ],
  providers: [MessageService],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss',
})
export class RegistrationComponent implements OnInit {
  registrationForm!: FormGroup;
  isLoading: boolean = false;
  msg: Message[] = [];
  showPersonalDetails: boolean = false;
  user: any;
  classifications: any[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private classificationService: ClientClassificationService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.registrationForm = this.fb.group({
      FirstName: [
        '',
        [Validators.required, Validators.pattern('^[א-תA-Za-z ]+$')],
      ],
      LastName: [
        '',
        [Validators.required, Validators.pattern('^[א-תA-Za-z ]+$')],
      ],
      Mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      Email: ['', [Validators.required, Validators.email]],
      Password: ['', [Validators.required, this.passwordValidator()]],
      CustomerType: ['', [Validators.required]],
      Id: [
        '',
        [Validators.required, Validators.minLength(6), Validators.maxLength(9)],
      ],
      RowId: [null],
      // ComissionPerTranc: [false]
    });
  }
  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
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
            ComissionPerTranc: this.user.ComissionPerTranc,
          });
        }
        this.loadClassifications();
      }
    });
  }

  onSubmit() {
    if (!this.registrationForm.valid) {
      this.msg = [
        {
          severity: 'error',
          summary: '',
          detail: 'אנא מלא את כל השדות הנדרשים',
        },
      ];
      return;
    }

    this.isLoading = true;
    this.msg = [];

    if (!this.showPersonalDetails) {
      this.userService
        .signUp(this.registrationForm.value)
        .pipe(
          finalize(() => {
            this.isLoading = false;
          }),
        )
        .subscribe({
          next: (res) => {
            console.log(res);
            this.router.navigate(['login'], {
              queryParams: { registered: 'true' },
            });
          },
          error: (err) => {
            console.log(err);
            this.msg = [
              {
                severity: 'error',
                summary: '',
                detail:
                  err.error?.Message ||
                  err.error?.message ||
                  'אירעה שגיאה בלתי צפויה. נסה שוב מאוחר יותר.',
              },
            ];
          },
        });
    } else {
      this.userService
        .editUser(this.user.RowId, this.registrationForm.value)
        .pipe(
          finalize(() => {
            this.isLoading = false;
          }),
        )
        .subscribe({
          next: (res) => {
            const userJson = JSON.stringify(res.body);
            localStorage.setItem('user', userJson);

            console.log(res);
            this.msg = [
              {
                severity: 'success',
                summary: '',
                detail: 'העדכון התבצע בהצלחה',
              },
            ];
          },
          error: (err) => {
            console.log(err);
            this.msg = [
              {
                severity: 'error',
                summary: '',
                detail:
                  err.error?.Message ||
                  err.error?.message ||
                  'אירעה שגיאה בלתי צפויה. נסה שוב מאוחר יותר.',
              },
            ];
          },
        });
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

    if (controlName === 'Password') {
      if (control?.hasError('required')) return 'סיסמה היא שדה חובה';
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

  goBack() {
    window.history.back();
  }

  addRow() {
    this.classifications.push({
      GoodsDescription: '',
      ClassificationBook: '',
      Classification: '',
    });
  }

  // deleteRow(row: any) {
  //   this.classifications = this.classifications.filter(r => r !== row);
  // }

  canEditRow(row: any): boolean {
    return !row.ClassificationBook || !row.Classification;
  }

  saveClassifications() {
    if (!this.user?.Id) {
      this.msg = [
        {
          severity: 'error',
          summary: '',
          detail: 'לא ניתן לשמור ללא מזהה משתמש',
        },
      ];
      return;
    }

    const classificationsPayload = this.classifications.map((c) => ({
      RowID: c.RowID ?? 0,
      ClientID: this.user.Id,
      GoodsDescription: c.GoodsDescription,
      ClassificationBook: c.ClassificationBook,
      Classification: c.Classification,
    }));

    this.isLoading = true;

    this.classificationService
      .saveAllClassifications$(classificationsPayload, this.user.Id)
      .subscribe({
        next: (res) => {
          this.isLoading = false;
          console.log(res);
          this.msg = [
            {
              severity: 'success',
              summary: '',
              detail: 'הסיווגים נשמרו בהצלחה',
            },
          ];
        },
        error: (err) => {
          this.isLoading = false;
          console.error(err);
          this.msg = [
            { severity: 'error', summary: '', detail: 'אירעה שגיאה בשמירה' },
          ];
        },
      });
  }

  // loadClassifications() {
  //   this.classificationService
  //     .getClassifications$(this.user.Id)
  //     .subscribe((res) => {
  //       this.classifications = res;
  //     });
  // }

  loadClassifications() {
    this.classificationService.getClassifications$(this.user.Id).subscribe({
      next: (res) => {
        this.classifications = res;
      },
      error: (err) => {
        console.error(err);
        this.msg = [
          {
            severity: 'error',
            summary: '',
            detail: 'אירעה שגיאה בטעינת הסיווגים',
          },
        ];
      },
    });
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
}
