import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { VideoService } from '../shared/services/video.service';
import { Video } from '../shared/model/Video';
import { MatTableDataSource, MatTableModule } from '@angular/material/table' 
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-list-videos',
  standalone: true,
  imports: [HeaderComponent, MatTableModule, MatPaginatorModule, DatePipe],
  templateUrl: './list-videos.component.html',
  styleUrl: './list-videos.component.scss'
})
export class ListVideosComponent implements AfterViewInit, OnInit {
  videos?: Video[];
  displayedColumns: string[] = ['title', 'description', 'upload-date', 'views'];
  dataSource = new MatTableDataSource<Video>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private videoService: VideoService) {}
  
  ngOnInit(): void {
    this.videoService.listVideos().subscribe({
      next: (data) => {
        this.videos = data;
        this.dataSource.data = this.videos || [];
      }, error: (err) => {
        console.log(err);
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  loadVideo(id: string) {
    console.log(id);
  }

}
