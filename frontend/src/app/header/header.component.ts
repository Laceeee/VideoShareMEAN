import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { AuthService } from '../shared/services/auth.service';
import { CommonModule } from '@angular/common';
import { MatButton } from '@angular/material/button';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbarModule, CommonModule, MatButton],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  constructor(private router: Router, private authService: AuthService) {}

  isLoggedIn(): boolean {    
    if (localStorage.getItem('id') !== null) {
      return true;
    }
    return false;
  }

  logout() {
    localStorage.clear();
    this.authService.logout().subscribe({
      next: (data) => {
        this.router.navigateByUrl('/login');
        console.log(data);
      }, error: (err) => {
        console.log(err);
      }
    })
  }

  navigate(url: string) {
    this.router.navigate([url]);
  }

  reloadPage() {
    location.reload();
  }

}
