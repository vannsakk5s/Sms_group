import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { io, Socket } from 'socket.io-client';
import { Observable } from 'rxjs';
import { IMessage } from '../models/chat.model';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private http = inject(HttpClient);
  private socket: Socket = io('http://localhost:3000');
  private readonly API_URL = 'http://localhost:3000/api/chat';

  messages = signal<IMessage[]>([]);

  constructor() {
    this.socket.on('receive_message', (msg: IMessage) => {
      this.messages.update(prev => [...prev, msg]);
    });
  }

  joinRoom(room: string) {
  this.socket.emit('join_room', room);
  
  // លុប ឬ Comment ចោលនូវការទាញយក History ពី API
  // this.http.get<IMessage[]>(`${this.API_URL}/history/${room}`)
  //   .subscribe(data => this.messages.set(data));

  // កំណត់ឱ្យផ្ទាំងឆាតទទេរាល់ពេលចូល Room ថ្មី
  this.messages.set([]); 
}

  sendMessage(msg: IMessage) {
    this.socket.emit('send_message', msg);
  }
  
  clearMessages() {
    this.messages.set([]);
  }
}
