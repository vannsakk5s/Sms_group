import { Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

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

  // constructor(private translate: TranslateService) {
  //   const browserLang = localStorage.getItem('lang') || 'en';
  //   translate.use(browserLang);
  // }

  // useLanguage(language: string): void {
  //   this.translate.use(language);
  //   localStorage.setItem('lang', language); // រក្សាទុកក្នុងម៉ាស៊ីនអ្នកប្រើ
  // }

  // constructor(private translate: TranslateService) {}

  // ngOnInit() {
  //   // កូដដែលប្រើ translate ត្រូវដាក់ក្នុង lifecycle hook
  //   console.log(this.translate.currentLang);
  // }

  // constructor(private translate: TranslateService) {}

  // changeLang(lang: string) {
  //   this.translate.use(lang);
  // }
}
