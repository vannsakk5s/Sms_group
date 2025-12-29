import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-login',
  imports: [CommonModule, FormsModule, TranslateModule],
  standalone: true,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private authService = inject(AuthService);
  @Output() onSwitch = new EventEmitter<void>();
  @Output() onSuccess = new EventEmitter<void>();

  credentials = { email: '', password: '' };

  onLogin() {
    this.authService.login(this.credentials).subscribe({
      next: () => this.onSuccess.emit(), // ចូលទៅកាន់ផ្ទាំង Chat
      error: (err) => alert(err.error.message)
    });
  }

}
