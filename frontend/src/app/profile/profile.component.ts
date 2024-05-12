import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../shared/components/header/header.component';
import { UserService } from '../shared/services/user.service';
import { User } from '../shared/model/User';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { InfoDialogComponent } from '../shared/components/info-dialog/info-dialog.component';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [HeaderComponent, CommonModule, MatButtonModule, ConfirmationDialogComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit{
  user?: User;
  user_id: string = '';

  constructor(private userService: UserService, 
    private actRoute: ActivatedRoute, 
    private dialog: MatDialog,
    private infoDialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.actRoute.params.subscribe(params => {
      this.userService.getUser(params['username']).subscribe({
        next: (data) => {
          this.user = data;
          this.user_id = localStorage.getItem('id')!;
        }, error: (err) => {
          this.openDialog('Error', err.error);
        }
      });
    });
  }

  createChannel() {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { title: 'Create channel', message: 'Do you want to create a channel?', buttonText: 'Create', color: 'primary'}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.userService.createChannel(this.user!._id).subscribe({
          next: (user) => {
            this.openDialog('Success', 'Channel created successfully!');
            this.user = user;
            localStorage.setItem('role', this.user.role);
          }, error: (err) => {
            this.openDialog('Error', err.error);
          }
        });
      }
    });
  }

  openDialog(title: string, message: string) {
    this.infoDialog.open(InfoDialogComponent,  { data: { title: title, message: message }});
  }
}
