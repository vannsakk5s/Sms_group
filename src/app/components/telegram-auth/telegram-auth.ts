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


import { Component, AfterViewInit, OnDestroy, inject, NgZone, ElementRef, ViewChild } from '@angular/core';
import { AuthService } from '../../core/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-telegram-auth',
  standalone: true, // ប្រាកដថាវាជា standalone ប្រសិនបើអ្នកប្រើវាផ្ទាល់
  templateUrl: './telegram-auth.html',
  styleUrl: './telegram-auth.css',
})
export class TelegramAuth implements AfterViewInit, OnDestroy {
  private authService = inject(AuthService);
  private router = inject(Router);
  private ngZone = inject(NgZone);

  @ViewChild('telegramContainer', { static: true }) telegramContainer!: ElementRef;

  ngAfterViewInit() {
    this.renderWidget();
  }

  private renderWidget() {
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    
    // កំណត់ព័ត៌មាន Bot របស់អ្នក
    script.setAttribute('data-telegram-login', 'AUTHtelegram_bot'); 
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '10');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');

    this.telegramContainer.nativeElement.appendChild(script);

    // បង្កើត Global Callback
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
        // អ្នកអាចបន្ថែមការបង្ហាញ alert នៅទីនេះប្រសិនបើ login បរាជ័យ
      }
    });
  }

  // លុប callback ចោលពេលបិទ component
  ngOnDestroy() {
    delete (window as any).onTelegramAuth;
  }
}