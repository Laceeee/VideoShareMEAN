import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-list-videos',
  standalone: true,
  imports: [HeaderComponent],
  templateUrl: './list-videos.component.html',
  styleUrl: './list-videos.component.scss'
})
export class ListVideosComponent {

}
