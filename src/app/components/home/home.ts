import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Login } from '../login/login';
import { Register } from '../register/register';
import { ChatRoom } from '../chat-room/chat-room';
import { ThemeSwitcher } from "../theme-switcher/theme-switcher";
import { LangSwitcher } from "../lang-switcher/lang-switcher";
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-home',
  imports: [CommonModule, Login, Register, ChatRoom, ThemeSwitcher, LangSwitcher],
  standalone: true,
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

  // ប្រើ Signal ដើម្បីគ្រប់គ្រងការបង្ហាញផ្ទាំងនីមួយៗ
  currentView = signal<'login' | 'register' | 'chat'>('login');

  // មុខងារប្តូរ View
  switchView(view: 'login' | 'register' | 'chat') {
    this.currentView.set(view);
  }

  constructor(private translate: TranslateService) {
    // ១. កំណត់ភាសាដំបូងដែល App ត្រូវប្រើ
    this.translate.addLangs(['en', 'kh']);
    
    // ២. ទាញយកភាសាដែលធ្លាប់រើស (បើមាន) ឬប្រើភាសាដើម 'en'
    const browserLang = localStorage.getItem('lang') || 'en';
    this.translate.use(browserLang);
  }

  ngOnInit() {}
}
