import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MatToolbarModule, CommonModule, MatButtonModule, MatMenuModule, MatIconModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  username: string = '';
  role: string = '';
  
  constructor(private router: Router, private authService: AuthService) {}

  isLoggedIn(): boolean {    
    if (localStorage.getItem('id') !== null) {
      this.username = localStorage.getItem('username')!;
      this.role = localStorage.getItem('role')!;
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
  
  navigateToProfile() {
    this.router.navigate(['/profile', this.username]);
  }

  reloadPage() {
    location.reload();
  }

}
