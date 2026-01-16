import { Component, inject, ViewChild, ElementRef, effect, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat';
import { AuthService } from '../../core/auth.service';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { MatchmakingService } from '../../services/matchmaking';
import { ThemeService } from '../../core/theme.service';

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

  matchService = inject(MatchmakingService); // បន្ថែមនេះ

  constructor(public matchmakingService: MatchmakingService, public themeService: ThemeService) {
    effect(() => {
      if (this.chatService.messages().length > 0) {
        setTimeout(() => this.scrollToBottom(), 200);
      }
    });
  }

  async ngOnInit() {
    this.authService.loadUserFromStorage();
    const token = this.authService.getToken();
    if (!token) {
      this.router.navigate(['/login']);
      return;
    }

    this.chatService.clearMessages();
    this.chatService.loadMessages(this.activeRoom);

    setTimeout(() => {
      this.chatService.joinRoom(this.activeRoom);
    }, 1000);

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
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  startSearching() {
    this.matchmakingService.findMatch();
  }

  private scrollToBottom() {
    try {
      this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) { }
  }

}
