// import { Injectable, signal, inject } from '@angular/core';
// import { Router } from '@angular/router';
// import { io, Socket } from 'socket.io-client';

// @Injectable({ providedIn: 'root' })
// export class MatchmakingService {
//   private socket: Socket;
//   private router = inject(Router);

//   isSearching = signal(false);

//   constructor() {
//     this.socket = io('http://localhost:3000', {
//       auth: { token: localStorage.getItem('authToken') }
//     });

//     this.socket.on('match_found', (data: { gameId: string, side: 'w' | 'b' }) => {
//     this.router.navigate(['/chess', data.gameId], { queryParams: { side: data.side } });
//     });
//   }

//   findMatch() {
//     this.isSearching.set(true);
//     this.socket.emit('find_match');
//   }

//   cancelSearch() {
//     this.isSearching.set(false);
//     this.socket.emit('cancel_search');
//   }
// }

// matchmaking.service.ts
import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { io } from 'socket.io-client';

@Injectable({ providedIn: 'root' })
export class MatchmakingService {
  private socket = io('https://childrens-selective-arthritis-vincent.trycloudflare.com');
  private router = inject(Router);
  
  isSearching = signal(false);

  findMatch() {
    this.isSearching.set(true);
    this.socket.emit('find_match');

    // ស្ដាប់សញ្ញាពេលរកឃើញគូប្រកួត
    this.socket.on('match_found', (data: { gameId: string, side: string }) => {
      this.isSearching.set(false);
      // ប្តូរទៅកាន់ទំព័រអុក ជាមួយ ID និង ពណ៌ (Side)
      this.router.navigate(['/chess', data.gameId], { 
        queryParams: { side: data.side } 
      });
    });
  }
}