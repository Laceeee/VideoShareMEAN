import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { HeaderComponent } from '../shared/components/header/header.component';
import { VideoService } from '../shared/services/video.service';
import { Video } from '../shared/model/Video';
import { MatTableDataSource, MatTableModule } from '@angular/material/table' 
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-list-videos',
  standalone: true,
  imports: [HeaderComponent, MatTableModule, MatPaginatorModule, DatePipe, MatFormFieldModule, CommonModule, MatIconModule, FormsModule, MatButtonModule, MatInputModule, MatTooltipModule],
  templateUrl: './list-videos.component.html',
  styleUrl: './list-videos.component.scss'
})
export class ListVideosComponent implements AfterViewInit, OnInit {
  videos?: Video[];
  displayedColumns: string[] = ['title', 'uploader', 'upload-date', 'views'];
  dataSource = new MatTableDataSource<Video>();
  searchValue: string = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private videoService: VideoService, private router: Router) {}
  
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

  clearSearch() {
    this.searchValue = '';
    this.dataSource.filter = this.searchValue;
  }

  searchVideos(searvhValue: string) {
    this.dataSource.filter = searvhValue;
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  loadVideo(id: string) {
    this.router.navigate(['/video'], { queryParams: { watch: id } });
  }

}
