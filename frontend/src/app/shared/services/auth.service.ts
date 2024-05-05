import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../model/User';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) { }

  headers = new HttpHeaders({
    'Content-Type': 'application/x-www-form-urlencoded'
  });

  // login
  login(email: string, password: string) {
    const body = new URLSearchParams();
    body.set('username', email);
    body.set('password', password);

    return this.http.post('http://localhost:5000/login', body, {headers: this.headers});
  }

  register(user: User) {
    const body = new URLSearchParams();
    body.set('email', user.email);
    body.set('username', user.username);
    body.set('password', user.password);

    return this.http.post('http://localhost:5000/register', body, {headers: this.headers});
  }
}
