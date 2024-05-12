import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../model/User';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  constructor(private http: HttpClient) { }

  getUser(username: string) {
    return this.http.get<User>('http://localhost:5000/get-user/' + username, {withCredentials: true});
  };

  getAll() {
    return this.http.get<User[]>('http://localhost:5000/getAllUsers', {withCredentials: true});
  };

  deleteUser(sender_id: string, id: string) {
    return this.http.delete<User[]>('http://localhost:5000/delete-user/' + sender_id + '/' + id, {withCredentials: true});
  };

  promoteUser(sender_id: string, id: string) {
    return this.http.get<User[]>('http://localhost:5000/promote-user/' + sender_id + '/' + id, {withCredentials: true});
  };

  createChannel(id: string) {
    return this.http.get<User>('http://localhost:5000/create-channel/' + id, {withCredentials: true});
  };
}
