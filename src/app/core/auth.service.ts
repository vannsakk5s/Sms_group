// import { Injectable, inject, signal } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { IUser } from '../models/User';
// import { tap } from 'rxjs';

// @Injectable({ providedIn: 'root' })
// export class AuthService {
//   private http = inject(HttpClient);
//   private readonly API_URL = 'http://localhost:3000/api/auth';
//   private storedUser = localStorage.getItem('user');

//   currentUser = signal<any>(this.storedUser ? JSON.parse(this.storedUser) : null);

//   getToken(): string | null {
//     return localStorage.getItem('token');
//   }

//   register(user: IUser) {
//     return this.http.post(`${this.API_URL}/register`, user);
//   }

//   login(credentials: any) {
//     return this.http.post<any>(`${this.API_URL}/login`, credentials).pipe(
//       tap(res => {
//         // រក្សាទុកម៉ោង Login ចូលទៅក្នុង LocalStorage
//         const loginTime = new Date().toISOString();
//         localStorage.setItem('loginTime', loginTime);

//         localStorage.setItem('token', res.token);
//         localStorage.setItem('user', JSON.stringify(res.user));
//         this.currentUser.set(res.user);
//       })
//     );
//   }

//   logout() {
//     localStorage.removeItem('token'); // លុប Token
//     localStorage.removeItem('user');  // លុបព័ត៌មាន User
//     this.currentUser.set(null);
//   }
// }

import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IUser } from '../models/User';
import { tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000/api/auth';
  private storedUser = localStorage.getItem('user');

  currentUser = signal<any>(this.storedUser ? JSON.parse(this.storedUser) : null);

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  register(user: IUser) {
    return this.http.post(`${this.API_URL}/register`, user);
  }

  login(credentials: any) {
    return this.http.post<any>(`${this.API_URL}/login`, credentials).pipe(
      tap(res => this.handleAuthResponse(res))
    );
  }

  // --- បន្ថែមមុខងារថ្មីសម្រាប់ Telegram ---
  loginWithTelegram(telegramData: any) {
    return this.http.post<any>(`${this.API_URL}/telegram-login`, telegramData).pipe(
      tap(res => this.handleAuthResponse(res))
    );
  }

  // Helper function សម្រាប់កាត់បន្ថយកូដដែលសរសេរដដែលៗ
  private handleAuthResponse(res: any) {
    const loginTime = new Date().toISOString();
    localStorage.setItem('loginTime', loginTime);
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    this.currentUser.set(res.user);
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('loginTime');
    this.currentUser.set(null);
  }
}