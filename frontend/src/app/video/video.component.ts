import { Component, OnInit, ViewChild } from '@angular/core';
import { HeaderComponent } from '../shared/components/header/header.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Video } from '../shared/model/Video';
import { Comment } from '../shared/model/Comment';
import { VideoService } from '../shared/services/video.service';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleGroup, MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../shared/components/confirmation-dialog/confirmation-dialog.component';
import { MatTableDataSource, MatTableModule } from '@angular/material/table' 
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { FormDialogComponent } from '../shared/components/form-dialog/form-dialog.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InfoDialogComponent } from '../shared/components/info-dialog/info-dialog.component';

@Component({
  selector: 'app-video',
  standalone: true,
  imports: [HeaderComponent, DatePipe, MatIconModule, MatButtonToggleModule, MatTableModule, MatPaginatorModule, MatButtonModule, CommonModule, MatTooltipModule],
  templateUrl: './video.component.html',
  styleUrl: './video.component.scss'
})
export class VideoComponent implements OnInit{
  id?: string;
  video?: Video;
  comments?: Comment[];
  videoSource?: string;
  user_id?: string;
  role?: string;
  displayedColumns: string[] = ['user', 'comment', 'delete'];
  dataSource = new MatTableDataSource<Comment>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('group') group!: MatButtonToggleGroup;

  constructor(private route: ActivatedRoute, 
    private videoService: VideoService,
    private router: Router, 
    private dialog: MatDialog,
    private infoDialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.user_id = localStorage.getItem('id')!;
    this.role = localStorage.getItem('role')!;
    this.route.queryParams.subscribe(params => {
      this.id = params['watch'];
    });
    
    this.videoService.getVideo(this.id!).subscribe({
      next: (video) => {
        this.video = video;
        this.comments = this.video.comments;
        const reversedComments = [...this.comments].reverse();
        this.dataSource.data = reversedComments;
        if (this.video.likedBy?.includes(this.user_id!)) {
          this.group.value = 'like';
        }
        else if (this.video.dislikedBy?.includes(this.user_id!)) {
          this.group.value = 'dislike';
        }
        this.videoService.streamVideo(this.video!.video_id).subscribe({
          next: (blob) => {
            this.videoSource = URL.createObjectURL(blob);
          }, error: (err) => {
            this.openDialog('Error', 'Error streaming video:' + err.error);
          }
        })
      }, error: (err) => {
        this.openDialog('Error', err.error);
      }
    })
  }

  updateVideo() {
    let dialogRef = this.dialog.open(FormDialogComponent, {
      data: { title: 'Edit Video', videoTitle: this.video?.title, videoDescription: this.video?.description}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.videoService.updateVideo(this.id!, this.user_id!, this.role!, result.title, result.description).subscribe({
          next: (updatedVideo) => {
            this.openDialog('Success', 'Video updated successfully.');
            this.video = updatedVideo;
            this.comments = this.video.comments;
            const reversedComments = [...this.comments].reverse();
            this.dataSource.data = reversedComments;
          }, error: (err) => {
            this.openDialog('Error', err.error);
          }
        });
      }
    });
  }

  deleteVideo() {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { title: 'Delete Video', message: 'Are you sure you want to delete this video?', buttonText: 'Delete', color: 'warn'}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.videoService.deleteVideo(this.id!, this.user_id!, this.role!).subscribe({
          next: (success) => {
            this.openDialog('Success', 'Video deleted successfully.');
            this.router.navigateByUrl('/videos');
          }, error: (err) => {
            this.openDialog('Error', err.error);
          }
        });
      }
    });
  }

  deleteComment(comment_id: string) {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { title: 'Delete Comment', message: 'Are you sure you want to delete this comment?', buttonText: 'Delete', color: 'warn'}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.videoService.deleteComment(this.id!, this.user_id!, comment_id).subscribe({
          next: (updatedVideo) => {
            this.openDialog('Success', 'Comment deleted successfully.');
            this.video = updatedVideo;
            this.comments = this.video.comments;
            const reversedComments = [...this.comments].reverse();
            this.dataSource.data = reversedComments;
          }, error: (err) => {
            this.openDialog('Error', err.error);
          }
        });
      }
    });
  }

  commentOnVideo() {
    let dialogRef = this.dialog.open(FormDialogComponent, {
      data: { title: 'Comment'}
    });
    dialogRef.afterClosed().subscribe(result => {0
      if (result) {
        this.videoService.commentOnVideo(this.id!, this.user_id!, result).subscribe({
          next: (updatedVideo) => {
            this.video = updatedVideo;
            this.comments = this.video.comments;
            const reversedComments = [...this.comments].reverse();
            this.dataSource.data = reversedComments;
          }, error: (err) => {
            this.openDialog('Error', err.error);
          }
        });
      }
    })
  }

  rateVideo() {
    if (this.group.value === 'like') {
      if (!(this.video?.likedBy?.includes(this.user_id!))) {
        this.videoService.likeVideo(this.id!, this.user_id!).subscribe({
          next: (updatedVideo) => {
            this.video = updatedVideo;
          }, error: (err) => {
            this.openDialog('Error', err.error);
          }
        })
      }
    }
    else if (this.group.value === 'dislike') {
      if (!(this.video?.dislikedBy?.includes(this.user_id!))) {
        this.videoService.dislikeVideo(this.id!, this.user_id!).subscribe({
          next: (updatedVideo) => {
            this.video = updatedVideo;
          }, error: (err) => {
            this.openDialog('Error', err.error);
          }
        })
      }
    }
  }

  openDialog(title: string, message: string) {
    this.infoDialog.open(InfoDialogComponent,  { data: { title: title, message: message }});
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

}
