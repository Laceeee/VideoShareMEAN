import { Component, OnInit, ViewChild } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Video } from '../shared/model/Video';
import { Comment } from '../shared/model/Comment';
import { VideoService } from '../shared/services/video.service';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleGroup, MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { MatTableDataSource, MatTableModule } from '@angular/material/table' 
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { FormDialogComponent } from '../form-dialog/form-dialog.component';

@Component({
  selector: 'app-video',
  standalone: true,
  imports: [HeaderComponent, DatePipe, MatIconModule, MatButtonToggleModule, MatTableModule, MatPaginatorModule, MatButtonModule, CommonModule],
  templateUrl: './video.component.html',
  styleUrl: './video.component.scss'
})
export class VideoComponent implements OnInit{
  id?: string;
  video?: Video;
  comments?: Comment[];
  videoSource?: string;
  user_id?: string;
  roleType?: string;
  displayedColumns: string[] = ['user', 'comment', 'delete'];
  dataSource = new MatTableDataSource<Comment>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('group') group!: MatButtonToggleGroup;

  constructor(private route: ActivatedRoute, 
    private videoService: VideoService, 
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.user_id = localStorage.getItem('id')!;
    this.roleType = localStorage.getItem('roleType')!;
    this.route.queryParams.subscribe(params => {
      this.id = params['watch'];
    });
    
    this.videoService.getVideo(this.id!).subscribe({
      next: (video) => {
        this.video = video;
        this.comments = this.video.comments;
        this.dataSource.data = this.video.comments || [];
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
            console.log('Error streaming videos: ', err);
          }
        })
      }, error: (err) => {
        console.log(err);
      }
    })
  }

  updateVideo() {
    
  }

  deleteVideo() {
    let dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { title: 'Delete Video', message: 'Are you sure you want to delete this video?', buttonText: 'Delete', color: 'warn'}
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log(result);
        /*this.videoService.deleteVideo(this.video!.video_id, this.user_id!, this.roleType!).subscribe({
          next: (success) => {
            this.router.navigateByUrl('/videos');
            console.log(success);
          }, error: (err) => {
            console.log(err);
          }
        });*/
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
            this.video = updatedVideo;
            this.comments = this.video.comments;
            this.dataSource.data = this.video.comments || [];
          }, error: (err) => {
            console.log(err);
          }
        });
      }
    });
  }

  commentOnVideo() {
    let dialogRef = this.dialog.open(FormDialogComponent, {
      data: { videoId: this.id}
    });
    dialogRef.afterClosed().subscribe(result => {0
      if (result) {
        this.videoService.commentOnVideo(this.id!, this.user_id!, result).subscribe({
          next: (updatedVideo) => {
            this.video = updatedVideo;
            this.comments = this.video.comments;
            this.dataSource.data = this.video.comments || [];
          }, error: (err) => {
            console.log(err);
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
            console.log(err);
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
            console.log(err);
          }
        })
      }
    }
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

}
