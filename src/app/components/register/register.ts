import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { Router, RouterModule } from '@angular/router';
import { TelegramAuth } from "../telegram-auth/telegram-auth";

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, TranslateModule, RouterModule, TelegramAuth],
  standalone: true,
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private authService = inject(AuthService);
  private router = inject(Router);

  authData = { username: '', email: '', password: '' };

  onRegister() {
    this.authService.register(this.authData).subscribe({
      next: () => {
        // alert('success!'+JSON.stringify(this.authData));
        alert('✅ ចុះឈ្មោះជោគជ័យ! សូមចូលប្រើប្រាស់ដោយការចុះឈ្មោះថ្មីនេះ។');
        // ប្តូរទៅកាន់ URL /login បន្ទាប់ពីចុះឈ្មោះជោគជ័យ
        this.router.navigate(['/login']);
      },
      error: (err) => alert(err.error.message)
    });
  }
}
