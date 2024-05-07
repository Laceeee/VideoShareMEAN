import { Component, OnDestroy, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { ActivatedRoute } from '@angular/router';
import { Video } from '../shared/model/Video';
import { VideoService } from '../shared/services/video.service';

@Component({
  selector: 'app-video',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './video.component.html',
  styleUrl: './video.component.scss'
})
export class VideoComponent implements OnInit{
  id?: string;
  video?: Video;
  videoSource?: string;

  constructor(private route: ActivatedRoute, private videoService: VideoService) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.id = params['id'];
    });
    
    this.videoService.getVideo(this.id!).subscribe({
      next: (video) => {
        this.video = video;
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
}
