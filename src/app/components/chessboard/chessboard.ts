
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Chess, Square } from 'chess.js';
import { io, Socket } from 'socket.io-client';

@Component({
  selector: 'app-chessboard',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './chessboard.html',
  styleUrl: './chessboard.css',
})
export class Chessboard implements OnInit {
  private chess = new Chess();
  private socket!: Socket;
  private route = inject(ActivatedRoute); // ប្រើសម្រាប់ទាញយក ID ពី URL
  private router = inject(Router);
  private messageTimeout: any;
  private opponentTimeout: any;

  gameId: string = '';
  mySide = signal<'w' | 'b' | null>(null); // រក្សាទុកពណ៌ខ្លួនឯង
  currentMessage = signal<string | null>(null);
  opponentMessage = signal<string | null>(null);
  isGameOver = signal<boolean>(false);

  board = signal(this.chess.board());
  turn = signal(this.chess.turn());
  selectedSquare = signal<string | null>(null);
  possibleMoves = signal<string[]>([]);
  gameStatus = signal<string>('Connecting to game...');

  ngOnInit() {
    // ១. ទាញយក Game ID ពី URL path
    this.gameId = this.route.snapshot.params['id'];

    // ២. ទាញយកពណ៌ពី Query Params (?side=w ឬ ?side=b)
    this.route.queryParams.subscribe((params: { [x: string]: string; }) => {
      this.mySide.set(params['side'] as 'w' | 'b');
    });

    this.loadLocalState();
    this.initSocket();
  }

  sendMessage(input: HTMLInputElement) {
    const msg = input.value.trim();
    if (!msg) return;

    // ១. បង្ហាញលើខ្លួនឯងភ្លាមៗ
    this.currentMessage.set(msg);
    if (this.messageTimeout) clearTimeout(this.messageTimeout);
    this.messageTimeout = setTimeout(() => this.currentMessage.set(null), 3000);

    // ២. ផ្ញើទៅ Server (ប្រើ Event ឈ្មោះ send_chat_message)
    this.socket.emit('send_chat_message', {
      gameId: this.gameId,
      message: msg
    });

    input.value = ''; // លុបអក្សរក្នុង Input
  }

  showPopup(text: string) {
    this.currentMessage.set(text);

    if (this.messageTimeout) clearTimeout(this.messageTimeout);

    this.messageTimeout = setTimeout(() => {
      this.currentMessage.set(null);
    }, 3000);
  }

  // Save the board state to browser storage
  private saveLocalState() {
    if (this.gameId) localStorage.setItem(`chess_game_${this.gameId}`, this.chess.fen());
  }

  // Load the board state when component starts
  private loadLocalState() {
    const savedFen = localStorage.getItem(`chess_game_${this.gameId}`);
    if (savedFen) {
      this.chess.load(savedFen);
      this.updateState();
    }
  }

  ngOnDestroy() {
    // នៅពេល User ចាកចេញពី Component នេះ (ប្តូរទំព័រ ឬបិទ Tab)
    this.socket.emit('leave_game', { gameId: this.gameId });
    this.socket.disconnect(); // បិទការភ្ជាប់ Socket សម្រាប់ហ្គេមនេះ
  }

  private initSocket() {
    this.socket = io('https://childrens-selective-arthritis-vincent.trycloudflare.com', {
      auth: { token: localStorage.getItem('authToken') }
    });

    // ប្រាប់ Server ថាខ្ញុំចូលក្នុងបន្ទប់នេះ
    this.socket.emit('join_chess_game', this.gameId);

    this.socket.on('opponent_moved', (move: any) => {
      this.chess.move(move);
      this.saveLocalState();
      this.updateState();
    });

    this.socket.on('receive_chat_message', (data: { message: string }) => {
      this.opponentMessage.set(data.message);

      // លុបសារចេញវិញក្រោយ ៣ វិនាទី
      if (this.opponentTimeout) clearTimeout(this.opponentTimeout);
      this.opponentTimeout = setTimeout(() => {
        this.opponentMessage.set(null);
      }, 3000);
    });

    // chat message handler
    this.socket.on('opponent_said', (data: { message: string }) => {
      this.opponentMessage.set(data.message);

      // លុបសារចេញវិញក្រោយ ៣ វិនាទី
      if (this.opponentTimeout) clearTimeout(this.opponentTimeout);
      this.opponentTimeout = setTimeout(() => {
        this.opponentMessage.set(null);
      }, 3000);
    });

    // ថែមក្នុង initSocket() នៃ chessboard.ts
    this.socket.on('opponent_resigned', () => {
      this.gameStatus.set('Opponent resigned! You win! 🎉');
    });

    this.socket.on('player_joined', () => {
      this.gameStatus.set('Opponent joined!');
    });

    this.socket.on('opponent_left', () => {
      alert('Opponent forfeited! They have left the match.');
      this.leaveGame();
    });

    this.socket.on('rematch_requested', () => {
      // ប្រើ setTimeout ដើម្បីកុំឱ្យវាជាន់គ្នានឹង UI update
      setTimeout(() => {
        const accept = confirm('Opponent requests a rematch! Do you accept?');

        // ឆ្លើយតបទៅ Server វិញ
        this.socket.emit('respond_rematch', {
          gameId: this.gameId,
          accept: accept
        });
      }, 100);
    });

    this.socket.on('rematch_result', (data: { accept: boolean }) => {
      if (data.accept) {
        this.resetGame(); // ហ្គេមចាប់ផ្តើមថ្មីទាំងអស់គ្នា
        alert('New game started! 🎮');
      } else {
        // បើគេបដិសេធ (ហើយយើងជាអ្នកសុំ)
        if (this.gameStatus().includes('រង់ចាំ')) {
          this.gameStatus.set('Opponent declined the request. ❌');
          alert('The opponent does not agree to a rematch.');
        }
      }
    });
  }

  showOpponentPopup(text: string) {
    this.opponentMessage.set(text);
    if (this.opponentTimeout) clearTimeout(this.opponentTimeout);

    // បាត់ទៅវិញក្រោយ ៣ វិនាទី
    this.opponentTimeout = setTimeout(() => {
      this.opponentMessage.set(null);
    }, 3000);
  }

  playAgain() {
    // បើហ្គេមមិនទាន់ចប់ សួរបញ្ជាក់សិន (ការពារច្រឡំដៃ)
    if (!this.chess.isGameOver()) {
      const confirmRestart = confirm('The game is not over yet! Are you sure you want to request a rematch?');
      if (!confirmRestart) return;
    }

    this.gameStatus.set('Waiting for a response... ⏳');
    // ផ្ញើសំណើទៅ Server
    this.socket.emit('request_rematch', { gameId: this.gameId });
  }

  leaveGame() {
    this.socket.emit('leave_game', { gameId: this.gameId });
    localStorage.removeItem(`chess_game_${this.gameId}`);
    this.router.navigate(['/chat']);
  }

  handleSquareClick(rank: number, file: number) {
    // មិនឱ្យដើរ បើមិនមែនវេនខ្លួនឯង
    if (this.turn() !== this.mySide()) return;

    const coords = this.toAlgebraic(rank, file);

    if (this.selectedSquare()) {
      const move = this.makeMove(this.selectedSquare()!, coords);
      if (move) {
        // ប្រើ this.gameId ជំនួសឱ្យ 'room1'
        this.socket.emit('make_chess_move', {
          gameId: this.gameId,
          from: move.from,
          to: move.to,
          promotion: 'q'
        });
        this.clearSelection();
      } else {
        this.selectPiece(coords);
      }
    } else {
      this.selectPiece(coords);
    }
  }

  // មុខងាររើសកូនអុក និងគណនាក្រឡាដែលអាចដើរបាន
  private selectPiece(coords: string) {
    const piece = this.chess.get(coords as Square);
    // អនុញ្ញាតឱ្យរើសតែពណ៌ដែលដល់វេនប៉ុណ្ណោះ
    if (piece && piece.color === this.chess.turn()) {
      const moves = this.chess.moves({ square: coords as Square, verbose: true });
      this.selectedSquare.set(coords);
      this.possibleMoves.set(moves.map(m => m.to));
    } else {
      this.clearSelection();
    }
  }

  private clearSelection() {
    this.selectedSquare.set(null);
    this.possibleMoves.set([]);
  }

  makeMove(from: string, to: string) {
    try {
      const result = this.chess.move({ from, to, promotion: 'q' });
      this.saveLocalState();
      this.updateState();
      return result;
    } catch (e) {
      return null;
    }
  }

  updateState() {
    this.board.set(this.chess.board());
    this.turn.set(this.chess.turn());
    if (this.chess.isCheckmate()) this.gameStatus.set('Checkmate! Game over! 🏆🏆🏆');
    else if (this.chess.isDraw()) this.gameStatus.set('Draw! 🤝🤝🤝');
    else if (this.chess.isCheck()) this.gameStatus.set('Check! 🎉🎉🎉');
    else this.gameStatus.set('Playing');
  }

  toAlgebraic(r: number, c: number): string {
    return (String.fromCharCode(97 + c) + (8 - r));
  }

  getPieceIcon(type: string, color: string): string {
    const icons: any = {
      p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚'
    };
    return icons[type] || '';
  }

  resign() {
    if (confirm('Are you sure you want to resign?')) {
      this.socket.emit('game_resigned', { gameId: this.gameId });
      this.gameStatus.set('You resigned!');
    }
  }
  resetGame() {
    this.chess.reset();
    this.clearSelection();
    this.saveLocalState();
    this.updateState();
    this.gameStatus.set('Playing');
  }

  // popup
  isOpen = signal(false);

  open() { this.isOpen.set(true); }
  close() { this.isOpen.set(false); }


  // validate word
  handleWordLimit(input: HTMLInputElement) {
    const limit = 25;
    const words = input.value.split(/\s+/); // Splits by spaces

    if (words.length > limit) {
      // Keeps only the first 25 words
      input.value = words.slice(0, limit).join(' ');
    }
  }

}