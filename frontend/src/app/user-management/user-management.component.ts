import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { User } from '../shared/model/User';
import { UserService } from '../shared/services/user.service';
import { MatTableDataSource, MatTableModule } from '@angular/material/table' 
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { DatePipe } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HeaderComponent } from '../shared/components/header/header.component';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { InfoDialogComponent } from '../shared/components/info-dialog/info-dialog.component';
import { Router } from '@angular/router';


@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, HeaderComponent, HeaderComponent, MatTableModule, MatPaginatorModule, DatePipe, MatFormFieldModule, CommonModule, MatIconModule, FormsModule, MatButtonModule, MatInputModule, MatTooltipModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit, AfterViewInit{
  users?: User[];
  role?: string;
  displayedColumns: string[] = ['username', 'role', 'actions'];
  dataSource = new MatTableDataSource<User>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private infoDialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit() {
    if (localStorage.getItem('role') === 'admin') {
      this.userService.getAll().subscribe({
        next: (data) => {
          this.users = data;
          this.dataSource.data = this.users || [];
          this.role = localStorage.getItem('role')!;
        }, error: (err) => {
          this.openDialog('Error', err.error);
        }
      });
    }
    else {
      this.router.navigateByUrl('/videos');
    }
  }

  deleteUser(id: string, username: string) {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { title: `Delete user: ${username}`, message: `Are you sure you want to delete user: ${username}?`, buttonText: 'Delete', color: 'warn'}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const sender_id = localStorage.getItem('id')!; 
        this.userService.deleteUser(sender_id, id).subscribe({
          next: (users) => {
            this.openDialog('Success', `${username} has been deleted.`);
            this.users = users;
            this.dataSource.data = this.users || [];
          }, error: (err) => {
            this.openDialog('Error', err.error);
          }
        });
      }
    });
  }

  promoteUser(id: string, username: string) {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { title: `Promote user: ${username}`, message: `Promote ${username} to admin?`, buttonText: 'Promote', color: 'primary'}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const sender_id = localStorage.getItem('id')!; 
        this.userService.promoteUser(sender_id, id).subscribe({
          next: (users) => {
            this.openDialog('Success', `${username} has been promoted to admin.`);
            this.users = users;
            this.dataSource.data = this.users || [];
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

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

}
