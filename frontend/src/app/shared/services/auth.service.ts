import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User, LoggedInUser } from '../model/User';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  headers = new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded'
  });

  login(email: string, password: string) {
    const body = new URLSearchParams();
    body.set('username', email);
    body.set('password', password);

    return this.http.post<LoggedInUser>('http://localhost:5000/login', body, {headers: this.headers, withCredentials: true});
  }

  register(user: User) {
    const body = new URLSearchParams();
    body.set('email', user.email);
    body.set('username', user.username);
    body.set('password', user.password);

    return this.http.post('http://localhost:5000/register', body, {headers: this.headers});
  }

  logout() {
    return this.http.post('http://localhost:5000/logout', {}, {withCredentials: true, responseType: 'text'});
  }

  checkAuth() {
    return this.http.get<Boolean>('http://localhost:5000/checkAuth', {withCredentials: true});
  }
}
