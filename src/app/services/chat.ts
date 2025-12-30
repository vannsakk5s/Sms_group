
// import { Injectable, inject, signal } from '@angular/core';
// import { io, Socket } from 'socket.io-client';
// import { IMessage } from '../models/chat.model';
// import { AuthService } from '../core/auth.service';

// @Injectable({ providedIn: 'root' })
// export class ChatService {
//   private authService = inject(AuthService);
//   private socket: Socket;

//   messages = signal<IMessage[]>([]);

//   constructor() {
//     // បញ្ជូន Token ទៅជាមួយការ Connect Socket
//     this.socket = io('http://localhost:3000', {
//       auth: { token: this.authService.getToken() }
//     });

//     this.socket.on('receive_message', (msg: IMessage) => {
//       this.messages.update(prev => [...prev, msg]);
//     });

//     // បន្ថែម Error Handling សម្រាប់ Socket
//     this.socket.on('connect_error', (err) => {
//       console.error('Socket Connection Error:', err.message);
//     });
//   }

//   joinRoom(room: string) {
//     this.socket.emit('join_room', room);
//     this.messages.set([]); 
//   }

//   sendMessage(msg: IMessage) {
//     // បន្ថែម UserId ពី AuthService មុននឹងផ្ញើ (បើចាំបាច់)
//     const user = this.authService.currentUser();
//     if (user) {
//       msg.sender = user.username;
//     }
//     this.socket.emit('send_message', msg);
//   }
// }

import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { IMessage } from '../models/chat.model';
import { AuthService } from '../core/auth.service';

@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private socket: Socket;
  private apiUrl = 'http://localhost:3000/api/messages';
  messages = signal<any[]>([]);

  constructor() {
    this.socket = io('http://localhost:3000', {
      auth: { token: this.authService.getToken() }
    });

    this.socket.on('receive_message', (msg: IMessage) => {
      this.messages.update(prev => [...prev, msg]);
    });
  }

  loadMessages(room: string) {
    const storedUser = localStorage.getItem('user');
    const loginTime = localStorage.getItem('loginTime') || ''; // ទាញម៉ោង Login

    if (!storedUser) return;
    const username = JSON.parse(storedUser).username;

    // បន្ថែម loginTime ទៅក្នុង URL query
    const url = `http://localhost:3000/api/chat/history/${room}?username=${username}&since=${loginTime}`;

    this.http.get<any[]>(url).subscribe({
      next: (msgs) => this.messages.set(msgs),
      error: (err) => console.error(err)
    });
  }

  // បន្ថែម Function នេះដើម្បីបំបាត់ Error TS2339
  clearMessages() {
    this.messages.set([]);
  }

  joinRoom(room: string) {
    this.socket.emit('join_room', room);
    // this.messages.set([]);
  }

  sendMessage(msg: IMessage) {
    this.socket.emit('send_message', msg);
  }
}