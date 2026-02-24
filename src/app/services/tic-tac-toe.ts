import { Injectable, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import { io, Socket } from 'socket.io-client';

@Injectable({
  providedIn: 'root'
})
export class TicTacToeService {
  private socket: Socket;
  private router = inject(Router);

  // State Signals
  isSearching = signal(false);
  gameId = signal<string>('');
  mySide = signal<'X' | 'O' | null>(null);
  
  board = signal<string[]>(Array(9).fill(''));
  turn = signal<'X' | 'O'>('X');
  winner = signal<string | null>(null);

  constructor() {
    // ត្រូវប្រាកដថា URL និង Token ត្រឹមត្រូវ
    this.socket = io('https://technical-officially-chelsea-workplace.trycloudflare.com', {
      auth: { token: localStorage.getItem('authToken') }
    });

    this.listenToEvents();
  }

  findMatch() {
    this.isSearching.set(true);
    this.resetGameData();
    // ហៅ Event ថ្មីដែលយើងបានបង្កើតនៅ Backend
    this.socket.emit('find_tictactoe_match');
  }

  private listenToEvents() {
    // ទទួល Event ពី Backend
    this.socket.on('tictactoe_match_found', (data: { gameId: string, side: 'X' | 'O' }) => {
      this.isSearching.set(false);
      this.gameId.set(data.gameId);
      this.mySide.set(data.side);
      
      // Navigate ទៅទំព័រលេង
      this.router.navigate(['/tictactoe', data.gameId]);
    });

    this.socket.on('tictactoe_opponent_move', (data: { index: number, player: 'X' | 'O' }) => {
      // Update ក្តារនៅពេលគូប្រកួតដើរ
      this.updateBoardState(data.index, data.player);
    });
  }

  makeMove(index: number) {
    // ឆែកលក្ខខណ្ឌ៖ ត្រូវតែជាវេនយើង + កន្លែងទំនេរ + មិនទាន់មានអ្នកឈ្នះ
    if (this.turn() !== this.mySide()) return;
    if (this.board()[index] !== '') return;
    if (this.winner()) return;

    // ១. Update ខ្លួនឯងភ្លាមៗ
    this.updateBoardState(index, this.mySide()!);

    // ២. ផ្ញើទៅ Server
    this.socket.emit('tictactoe_move', {
      gameId: this.gameId(),
      index: index,
      player: this.mySide()
    });
  }

  private updateBoardState(index: number, player: 'X' | 'O') {
    this.board.update(current => {
      const newBoard = [...current];
      newBoard[index] = player;
      return newBoard;
    });

    this.checkWinner();
    this.turn.set(player === 'X' ? 'O' : 'X');
  }

  private checkWinner() {
    const lines = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];
    const b = this.board();
    for (let [x,y,z] of lines) {
      if (b[x] && b[x] === b[y] && b[x] === b[z]) {
        this.winner.set(b[x]);
        return;
      }
    }
  }

  resetGameData() {
    this.board.set(Array(9).fill(''));
    this.turn.set('X');
    this.winner.set(null);
    this.mySide.set(null);
  }
}