
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

  setTokenAndConnect() {
    const token = this.authService.getToken();
    if (this.socket) {
      // ប្តូរ Token ក្នុង Socket Auth
      this.socket.auth = { token: token };
      // បង្ខំឱ្យវា Connect ឡើងវិញជាមួយ Token ថ្មីនេះ
      this.socket.disconnect().connect();
      console.log('🔄 Socket reconnected with new token');
    }
  }

  connectSocket() {
    if (this.socket) {
      this.socket.disconnect(); // បិទអាខ្មោចចាស់ចោល
    }

    // បង្កើតការតភ្ជាប់ថ្មី ដោយយក Token ថ្មីចេញពី LocalStorage
    this.socket = io('http://localhost:3000', {
      auth: { token: this.authService.getToken() }
    });

    // ចាប់យកព្រឹត្តិការណ៍សារថ្មីឡើងវិញ
    this.socket.on('receive_message', (msg: IMessage) => {
      this.messages.update(prev => [...prev, msg]);
    });
  }

  // loadMessages(room: string) {
  //   const storedUser = localStorage.getItem('user');
  //   const loginTime = localStorage.getItem('loginTime') || ''; // ទាញម៉ោង Login

  //   if (!storedUser) return;
  //   const username = JSON.parse(storedUser).username;

  //   // បន្ថែម loginTime ទៅក្នុង URL query
  //   const url = `http://localhost:3000/api/chat/history/${room}&since=${loginTime}`;

  //   this.http.get<any[]>(url).subscribe({
  //     next: (msgs) => this.messages.set(msgs),
  //     error: (err) => console.error(err)
  //   });
  // }

  loadMessages(room: string) {
    // ទាញយក loginTime ឱ្យបានច្បាស់លាស់
    const loginTime = localStorage.getItem('loginTime');

    // បើអត់មាន loginTime ទេ (ករណី Error អីមួយ) ឱ្យវាទាញយកសារ 1 ម៉ោងមុនក៏បាន 
    // ដើម្បីកុំឱ្យ Refresh ទៅបាត់អស់រលីង
    const sinceParam = loginTime ? loginTime : new Date(Date.now() - 3600000).toISOString();

    const url = `http://localhost:3000/api/chat/history/${room}?since=${sinceParam}`;

    this.http.get<any[]>(url).subscribe({
      next: (msgs) => {
        console.log('Fetched messages after refresh:', msgs);
        this.messages.set(msgs);
      },
      error: (err) => console.error(err)
    });
  }

  reconnectWithNewToken() {
    if (this.socket) {
      this.socket.disconnect(); // បិទការភ្ជាប់ចាស់
    }

    // បង្កើតការភ្ជាប់ថ្មីជាមួយ Token ដែលទើបទទួលបាន
    this.socket.auth = { token: this.authService.getToken() };
    this.socket.connect();
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

  // chat.ts
  reconnectSocket() {
    const token = localStorage.getItem('token');
    if (this.socket) {
      // ១. ផ្ដាច់ការភ្ជាប់ចាស់ (ដែលគ្មាន Token)
      this.socket.disconnect();

      // ២. ដាក់ Token ថ្មីចូល
      this.socket.auth = { token: token };

      // ៣. ភ្ជាប់ឡើងវិញ
      this.socket.connect();
      console.log('🔄 Socket has reconnected with new token!');
    }
  }
}