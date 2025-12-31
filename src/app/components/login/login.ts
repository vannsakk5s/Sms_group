import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { Router, RouterModule } from '@angular/router';
import { TelegramAuth } from "../telegram-auth/telegram-auth";

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, TranslateModule, RouterModule, TelegramAuth],
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  
  private authService = inject(AuthService);
  private router = inject(Router);

  credentials = { email: '', password: '' };

  onLogin() {
    this.authService.login(this.credentials).subscribe({
      next: () => {
        // ប្តូរទៅកាន់ URL /chat នៅពេល Login ជោគជ័យ
        this.router.navigate(['/chat']);
      },
      error: (err) => alert(err.error.message)
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

}
