import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Video } from '../model/Video';

@Injectable({
  providedIn: 'root'
})
export class VideoService {

  constructor(private http: HttpClient) { }

  streamVideo(id: string) {
    return this.http.get('http://localhost:5000/stream-video/' + id, {responseType: 'blob', withCredentials: true});
  }

  getVideoMetadata(id: string) {
    return this.http.get('http://localhost:5000/get-video/' + id, {withCredentials: true});
  }

  listVideos() {
    return this.http.get<Video[]>('http://localhost:5000/list-videos', {withCredentials: true});
  }
}
