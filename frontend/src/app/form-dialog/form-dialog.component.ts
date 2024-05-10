import { Component, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-form-dialog',
  standalone: true,
  imports: [MatButton, MatDialogModule, MatFormFieldModule, FormsModule, MatInputModule],
  templateUrl: './form-dialog.component.html',
  styleUrl: './form-dialog.component.scss'
})
export class FormDialogComponent{
  constructor(public dialogRef: MatDialogRef<FormDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any) {}

  comment: string = '';

  onSubmit() {
    if (this.comment) {
      this.dialogRef.close(this.comment);
    }
  }
          
}
