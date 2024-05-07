import { CommonModule, Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from '../shared/services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { HeaderComponent } from '../header/header.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HeaderComponent, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;

  constructor(
    private formBuidler: FormBuilder, 
    private location: Location, 
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.signupForm = this.formBuidler.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.required, this.onlyLettersAndNumbers]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    }, {
      validator: this.mustMatch('password', 'confirmPassword')
    });
  }

  onlyLettersAndNumbers(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    const regex = /^[a-zA-Z0-9]*$/;
    const valid = regex.test(value);
    return valid? null : { invalidUsername: true };
  }

  mustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
      const control = formGroup.controls[controlName];
      const matchingControl = formGroup.controls[matchingControlName];

      if (matchingControl.errors && matchingControl.errors['mustMatch']) {
        return;
      }

      if (control.value != matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true});
      }
      else {
        matchingControl.setErrors(null);
      }
    }
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.authService.register(this.signupForm.value).subscribe({
        next: (data) => {
          if (data) {
            this.router.navigateByUrl('/login');
            console.log(data);
          }
        }, error: (err) => {
            console.log(err);
        }
      })
    }
    else {
      console.log('Form is not valid!');
    }
  }

  goBack() {
    this.location.back();
  }

}
