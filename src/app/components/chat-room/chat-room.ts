import { Component, inject, ViewChild, ElementRef, effect, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat';
import { AuthService } from '../../core/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat-room',
  imports: [CommonModule, FormsModule, TranslateModule],
  standalone: true,
  templateUrl: './chat-room.html',
  styleUrl: './chat-room.css',
})
export class ChatRoom {
  chatService = inject(ChatService);
  authService = inject(AuthService);
  private router = inject(Router);

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  newMessage = '';
  activeRoom = 'General';

  constructor() {
    // ធ្វើឱ្យអូសចុះក្រោមអូតូពេលមានសារថ្មី
    effect(() => {
      if (this.chatService.messages().length > 0) {
        setTimeout(() => this.scrollToBottom(), 200);
      }
    });
  }

  async ngOnInit() {
    const token = this.authService.getToken();
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    // ១. ទាញសារមកបង្ហាញសិន
    this.chatService.loadMessages(this.activeRoom);

    // ២. ចាំ ០.៥ វិនាទី ចាំ Join Socket (ដើម្បីកុំឱ្យវាជាន់គ្នា)
    setTimeout(() => {
      this.chatService.joinRoom(this.activeRoom);
    }, 500);
  }

  onSendMessage() {
    const user = this.authService.currentUser();
    if (this.newMessage.trim() && user) {
      this.chatService.sendMessage({
        sender: user.username,
        content: this.newMessage,
        room: this.activeRoom,
        timestamp: new Date()
      });
      this.newMessage = '';
    }
  }

  logout() {
    this.authService.logout();
    this.chatService.clearMessages();
    // ប្តូរ URL ទៅកាន់ /login វិញ
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  private scrollToBottom() {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }
}
