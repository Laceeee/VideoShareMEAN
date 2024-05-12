import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-form-dialog',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule, MatFormFieldModule, FormsModule, MatInputModule, CommonModule],
  templateUrl: './form-dialog.component.html',
  styleUrl: './form-dialog.component.scss'
})
export class FormDialogComponent{
  constructor(public dialogRef: MatDialogRef<FormDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {}

  comment: string = '';
  videoTitle: string = this.data.videoTitle;
  videoDescription: string = this.data.videoDescription;

  onSubmit() {
    if (this.data.title === 'Comment' && this.comment) {
      this.dialogRef.close(this.comment);
    } else if (this.data.title === 'Edit Video' && this.videoTitle && this.videoDescription) {
      this.dialogRef.close({title: this.videoTitle, description: this.videoDescription});
    }
  }
          
}
