import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Login } from '../login/login';
import { Register } from '../register/register';
import { ChatRoom } from '../chat-room/chat-room';

@Component({
  selector: 'app-home',
  imports: [ CommonModule, Login, Register, ChatRoom ],
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
}
