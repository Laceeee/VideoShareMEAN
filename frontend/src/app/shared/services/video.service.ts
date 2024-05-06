import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

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
}
