import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { HeaderComponent } from '../shared/components/header/header.component';
import { CommonModule } from '@angular/common';
import { VideoService } from '../shared/services/video.service';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { InfoDialogComponent } from '../shared/components/info-dialog/info-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-upload-video',
  standalone: true,
  imports: [FormsModule, HeaderComponent, MatFormFieldModule, MatInputModule, MatButtonModule, CommonModule, MatProgressSpinnerModule],
  templateUrl: './upload-video.component.html',
  styleUrl: './upload-video.component.scss'
})
export class UploadVideoComponent implements OnInit{
  title: string = '';
  description: string = '';
  errorMessage: string = '';
  video: File | null = null;
  selectedFileName: string = '';

  isLoading: boolean = false;

  user_id: string = '';
  username: string = '';

  constructor(private videoService: VideoService, private router: Router, private infoDialog: MatDialog) { }

  ngOnInit() {
    if (localStorage.getItem('role') === 'viewer') {
      this.router.navigateByUrl('/videos');
    } else {
      this.user_id = localStorage.getItem('id')!;
      this.username = localStorage.getItem('username')!;
    }
  }

  onFileSelected(event: Event) {
    this.errorMessage = '';
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.selectedFileName = file.name;
      const fileSizeInBytes = file.size; 

      const fileSizeInKB = fileSizeInBytes / 1024;
      const fileSizeInMB = fileSizeInKB / 1024;

      if (fileSizeInMB > 50) {
        this.errorMessage = 'File size exceeds 50MB limit.';
        this.video = null;
        this.selectedFileName = '';
        return;
      }

      this.video = file;
    }
  }

  uploadVideo() {
    if (this.user_id && this.username && this.title && this.description && this.video) {
      this.errorMessage = '';
      this.isLoading = true;
        this.videoService.uploadVideo(this.user_id, this.username, this.title, this.description, this.video).subscribe({
          next: (video) => {
            this.isLoading = false;
            this.openDialog('Success', 'Video uploaded successfully.');
            this.router.navigate(['/video'], { queryParams: { watch: video._id } });
          }, error: (err) => {
            this.isLoading = false;
            this.errorMessage = 'An error occurred. Please try again later.'
            this.openDialog('Error', err.error);
         }
        });
    }
    else {
      this.errorMessage = 'Form is empty.';
    }
  }

  openDialog(title: string, message: string) {
    this.infoDialog.open(InfoDialogComponent,  { data: { title: title, message: message }});
  }

}
