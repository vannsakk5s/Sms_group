// import { Component, AfterViewInit, inject, NgZone, ElementRef, ViewChild } from '@angular/core';
// import { AuthService } from '../../core/auth.service';
// import { Router } from '@angular/router';

// @Component({
//   selector: 'app-telegram-auth',
//   imports: [],
//   templateUrl: './telegram-auth.html',
//   styleUrl: './telegram-auth.css',
// })
// export class TelegramAuth {
//   private authService = inject(AuthService);
//   private router = inject(Router);
//   private ngZone = inject(NgZone);

//   @ViewChild('telegramContainer', { static: true }) telegramContainer!: ElementRef;

//   ngAfterViewInit() {
//     this.renderWidget();
//   }

//   private renderWidget() {
//     const script = document.createElement('script');
//     script.src = 'https://telegram.org/js/telegram-widget.js?22';

//     // កំណត់ព័ត៌មាន Bot របស់អ្នក
//     script.setAttribute('data-telegram-login', 'AUTHtelegram_bot'); 
//     script.setAttribute('data-size', 'large');
//     script.setAttribute('data-radius', '10');
//     script.setAttribute('data-onauth', 'onTelegramAuth(user)');
//     script.setAttribute('data-request-access', 'write');

//     this.telegramContainer.nativeElement.appendChild(script);

//     // បង្កើត Global Callback
//     (window as any).onTelegramAuth = (user: any) => {
//       this.ngZone.run(() => {
//         this.handleLogin(user);
//       });
//     };
//   }

//   private handleLogin(user: any) {
//     this.authService.loginWithTelegram(user).subscribe({
//       next: () => {
//         this.router.navigate(['/chat-room']); 
//       },
//       error: (err) => console.error('Telegram Login Error:', err)
//     });
//   }
// }

import { Component, AfterViewInit, OnDestroy, inject, NgZone, ElementRef, ViewChild, OnInit } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';
import { io, Socket } from 'socket.io-client'; // កុំភ្លេច install: npm install socket.io-client

@Component({
  selector: 'app-telegram-auth',
  standalone: true,
  templateUrl: './telegram-auth.html',
  styleUrl: './telegram-auth.css',
})
export class TelegramAuth implements OnInit, AfterViewInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private ngZone = inject(NgZone);
  private socket!: Socket;

  @ViewChild('telegramContainer', { static: true }) telegramContainer!: ElementRef;

  ngOnInit() {
    this.socket = io('http://localhost:3000'); // ឬប្រើ ngrok URL

    this.socket.on('connect', () => {
      console.log('✅ Socket បានភ្ជាប់ទៅ Backend ជោគជ័យ! ID:', this.socket.id);
    });

    this.socket.on('telegram_auth_success', (data: any) => {
      console.log('🎁 ទទួលបានទិន្នន័យពី Telegram Bot ហើយ!', data);
      this.ngZone.run(() => {
        localStorage.setItem('token', data.token);
        this.router.navigate(['/chat-room']);
      });
    });

    this.socket.on('connect_error', (err) => {
      console.error('❌ Socket ភ្ជាប់មិនចូលទេ:', err.message);
    });
  }
  ngAfterViewInit() {
    this.renderWidget();
  }

  private renderWidget() {
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';

    script.setAttribute('data-telegram-login', 'AUTHtelegram_bot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '10');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');

    this.telegramContainer.nativeElement.appendChild(script);

    (window as any).onTelegramAuth = (user: any) => {
      this.ngZone.run(() => {
        this.handleLogin(user);
      });
    };
  }

  private handleLogin(user: any) {
    this.authService.loginWithTelegram(user).subscribe({
      next: () => {
        this.router.navigate(['/chat-room']);
      },
      error: (err) => {
        console.error('Telegram Login Error:', err);
      }
    });
  }

  ngOnDestroy() {
    // បិទការភ្ជាប់ Socket និងលុប Callback ពេលចាកចេញពី Component
    if (this.socket) {
      this.socket.disconnect();
    }
    delete (window as any).onTelegramAuth;
  }

  // បន្ថែម Function សម្រាប់ឱ្យ User ចុចបើក Telegram Bot ផ្ទាល់ (ករណី Widget មិនដើរ)
  openTelegramBot() {
    window.open('https://t.me/AUTHtelegram_bot', '_blank');
  }
}