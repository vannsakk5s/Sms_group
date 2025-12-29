import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  standalone: true,
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  private authService = inject(AuthService);
  @Output() onSwitch = new EventEmitter<void>();

  authData = { username: '', email: '', password: '' };

  onRegister() {
    this.authService.register(this.authData).subscribe({
      next: () => {
        alert('ចុះឈ្មោះជោគជ័យ!');
        this.onSwitch.emit(); // ត្រឡប់ទៅផ្ទាំង Login
      },
      error: (err) => alert(err.error.message)
    });
  }
}
