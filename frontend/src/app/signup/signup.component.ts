import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from '../shared/services/auth.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { HeaderComponent } from '../shared/components/header/header.component';
import { Router } from '@angular/router';
import { InfoDialogComponent } from '../shared/components/info-dialog/info-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HeaderComponent, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent implements OnInit {
  signupForm!: FormGroup;
  errorMessage: string = '';

  constructor(
    private formBuidler: FormBuilder, 
    private authService: AuthService,
    private router: Router,
    private infoDialog: MatDialog
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
            this.openDialog('Success', 'Account created successfully. Please login.');
            this.router.navigateByUrl('/login');
          }
        }, error: (err) => {
          this.errorMessage = err.error;
        }
      })
    }
    else {
      this.errorMessage ='Form is not valid!';
    }
  }

  openDialog(title: string, message: string) {
    this.infoDialog.open(InfoDialogComponent,  { data: { title: title, message: message }});
  }

  goBack() {
    this.router.navigateByUrl('/login');
  }

}
