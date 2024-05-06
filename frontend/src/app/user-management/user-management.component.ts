import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { User } from '../shared/model/User';
import { UserService } from '../shared/services/user.service';
import { AuthService } from '../shared/services/auth.service';
import { Router } from '@angular/router';
import { VideoService } from '../shared/services/video.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent {
  users?: User[];
  videoSource?: string;

  constructor(
    private userService: UserService, 
    private authService: AuthService, 
    private router: Router,
    private videoService: VideoService
  ) {}

  ngOnInit() {
    this.userService.getAll().subscribe({
      next: (data) => {
        this.users = data;
      }, error: (err) => {
        console.log(err);
      }
    });

    console.log(sessionStorage.getItem('userId'), sessionStorage.getItem('roleType'))

    this.streamVideo('66394ebeb064d926deea292a');
  }

  logout() {
    this.authService.logout().subscribe({
      next: (data) => {
        this.router.navigateByUrl('/login');
        console.log(data);
      }, error: (err) => {
        console.log(err);
      }
    })
  }

  streamVideo(id: string) {
    this.videoService.streamVideo(id).subscribe({
      next: (blob) => {
        this.videoSource = URL.createObjectURL(blob);
      }, error: (err) => {
        console.log('Error streaming videos: ', err);
      }
    });
  }
}
