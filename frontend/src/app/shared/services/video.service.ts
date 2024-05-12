import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Video } from '../model/Video';

@Injectable({
  providedIn: 'root'
})
export class VideoService {

  constructor(private http: HttpClient) { }

  headers = new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded'
  });

  streamVideo(id: string) {
    return this.http.get('http://localhost:5000/stream-video/' + id, {responseType: 'blob', withCredentials: true});
  }

  getVideo(id: string) {
    return this.http.get<Video>('http://localhost:5000/get-video/' + id, {withCredentials: true});
  }

  updateVideo(video_id: string, user_id: string, role: string, title: string, description: string) {
    const body = new URLSearchParams();
    body.set('title', title);
    body.set('description', description);

    return this.http.post<Video>('http://localhost:5000/update-video/' + video_id + '/' + user_id + '/' + role, body, {headers: this.headers, withCredentials: true});
  }

  deleteVideo(video_id: string, user_id: string, role: string) {
    return this.http.delete('http://localhost:5000/delete-video/' + video_id + '/' + user_id + '/' + role, {withCredentials: true});
  }

  listVideos() {
    return this.http.get<Video[]>('http://localhost:5000/list-videos', {withCredentials: true});
  }

  commentOnVideo(video_id: string, user_id: string, comment: string) {
    const body = new URLSearchParams();
    body.set('comment', comment);

    return this.http.post<Video>('http://localhost:5000/comment/' + video_id + '/' + user_id, body, {headers: this.headers, withCredentials: true});
  };

  deleteComment(video_id: string, user_id: string, comment_id: string) {
    return this.http.delete<Video>('http://localhost:5000/delete-comment/' + video_id + '/' + user_id + '/' + comment_id, {withCredentials: true});
  }

  likeVideo(video_id: string, user_id: string) {
    return this.http.get<Video>('http://localhost:5000/like-video/' + video_id + '/' + user_id, {withCredentials: true});
  };

  dislikeVideo(video_id: string, user_id: string) {
    return this.http.get<Video>('http://localhost:5000/dislike-video/' + video_id + '/' + user_id, {withCredentials: true});
  };
}
