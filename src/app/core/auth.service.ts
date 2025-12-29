import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IUser } from '../models/User';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000/api/auth';
  
  currentUser = signal<IUser | null>(null);

  register(user: IUser) {
    return this.http.post(`${this.API_URL}/register`, user);
  }

  login(credentials: any) {
    return this.http.post<IUser>(`${this.API_URL}/login`, credentials).pipe(
      tap(user => this.currentUser.set(user))
    );
  }

  logout() {
    this.currentUser.set(null);
  }
}