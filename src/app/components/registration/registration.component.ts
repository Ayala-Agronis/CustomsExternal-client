import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { RadioButtonModule } from 'primeng/radiobutton';
import { UserService } from '../../shared/services/user.service';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, CardModule, RadioButtonModule,InputTextModule,PasswordModule],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss'
})
export class RegistrationComponent implements OnInit {
  registrationForm!: FormGroup;

  constructor(private fb: FormBuilder, private userService: UserService) {
    this.registrationForm = this.fb.group({
      FirstName: ['', [Validators.required, Validators.pattern('[A-Za-z]+')]],
      LastName: ['', [Validators.required, Validators.pattern('[A-Za-z]+')]],
      Mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
      Email: ['', [Validators.required, Validators.email]],
      Password: ['', [Validators.required, Validators.minLength(6)]],
      CustomerType: ['', [Validators.required]],
    });
  }
  ngOnInit(): void {
    // this.userService.getUsers().subscribe(
    //   res => {
    //     console.log(res);
    //   }
    // )
  }

  onSubmit() {
    if (this.registrationForm.valid) {
      console.log(this.registrationForm.value);
      this.userService.signUp(this.registrationForm.value).subscribe(
        res => {
          console.log(res);
        }
      )
      alert('טופס נשלח בהצלחה!');
    } else {
      alert('אנא מלא את כל השדות הנדרשים');
    }
  }
}
