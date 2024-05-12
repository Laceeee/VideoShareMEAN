import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../shared/components/header/header.component';
import { UserService } from '../shared/services/user.service';
import { User } from '../shared/model/User';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [HeaderComponent, CommonModule, MatButtonModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit{
  user?: User;
  user_id: string = '';
  check_username: string = '';

  constructor(private userService: UserService, private actRoute: ActivatedRoute) { }

  ngOnInit(): void {
    this.actRoute.params.subscribe(params => {
      this.userService.getUser(params['username']).subscribe({
        next: (data) => {
          this.user = data;
          this.user_id = localStorage.getItem('id')!;
          this.check_username = localStorage.getItem('username')!;
        }, error: (err) => {
          console.log(err);
        }
      });
    });
  }

  createChannel() {
    this.userService.createChannel(this.user_id).subscribe({
      next: (user) => {
        this.user = user;
        localStorage.setItem('role', this.user.role);
      }, error: (err) => {
        console.log(err);
      }
    });
  }
}
