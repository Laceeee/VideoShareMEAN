import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email: string = '';
  password: string = '';
  errorMessage: string = '';


  constructor(private router: Router, private authService: AuthService) { }  

  login() {
    if (this.email && this.password) {
      this.errorMessage = '';
      this.authService.login(this.email, this.password).subscribe({
        next: (data) => {
          if (data) {
            this.router.navigateByUrl('/user-management');
            console.log(data);
          }
        }, error: (err) => {
            console.log(err);
        }
      })
    }
    else {
      this.errorMessage = 'Form is empty.';
    }
  }

  navigate(to: string) {
    this.router.navigateByUrl(to);
  }
}
