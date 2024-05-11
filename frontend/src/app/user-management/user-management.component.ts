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
import { HeaderComponent } from '../header/header.component';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MatDialog } from '@angular/material/dialog';


@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, HeaderComponent, HeaderComponent, MatTableModule, MatPaginatorModule, DatePipe, MatFormFieldModule, CommonModule, MatIconModule, FormsModule, MatButtonModule, MatInputModule, MatTooltipModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit, AfterViewInit{
  users?: User[];
  roleType?: string;
  displayedColumns: string[] = ['username', 'role', 'actions'];
  dataSource = new MatTableDataSource<User>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private userService: UserService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.userService.getAll().subscribe({
      next: (data) => {
        this.users = data;
        this.dataSource.data = this.users || [];
        this.roleType = localStorage.getItem('roleType')!;
      }, error: (err) => {
        console.log(err);
      }
    });
  }

  deleteUser(id: string, username: string) {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { title: `Delete user: ${username}`, message: `Are you sure you want to delete user: ${username}?`, buttonText: 'Delete', color: 'warn'}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('segg');
      }
    });
  }

  promoteUser(id: string, username: string) {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { title: `Promote user: ${username}`, message: `Promote ${username} to admin?`, buttonText: 'Promote', color: 'primary'}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('segg');
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

}
