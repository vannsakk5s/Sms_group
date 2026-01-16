
import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Chess, Square } from 'chess.js';
import { io, Socket } from 'socket.io-client';

@Component({
  selector: 'app-chessboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chessboard.html',
  styleUrl: './chessboard.css',
})
export class Chessboard implements OnInit {
  private chess = new Chess();
  private socket!: Socket;
  private route = inject(ActivatedRoute); // ប្រើសម្រាប់ទាញយក ID ពី URL
  private router = inject(Router);

  gameId: string = '';
  mySide = signal<'w' | 'b' | null>(null); // រក្សាទុកពណ៌ខ្លួនឯង

  board = signal(this.chess.board());
  turn = signal(this.chess.turn());
  selectedSquare = signal<string | null>(null);
  possibleMoves = signal<string[]>([]);
  gameStatus = signal<string>('កំពុងភ្ជាប់ទៅកាន់ហ្គេម...');

  ngOnInit() {
    // ១. ទាញយក Game ID ពី URL path
    this.gameId = this.route.snapshot.params['id'];

    // ២. ទាញយកពណ៌ពី Query Params (?side=w ឬ ?side=b)
    this.route.queryParams.subscribe((params: { [x: string]: string; }) => {
      this.mySide.set(params['side'] as 'w' | 'b');
    });

    this.initSocket();
  }

  ngOnDestroy() {
    // នៅពេល User ចាកចេញពី Component នេះ (ប្តូរទំព័រ ឬបិទ Tab)
    this.socket.emit('leave_game', { gameId: this.gameId });
    this.socket.disconnect(); // បិទការភ្ជាប់ Socket សម្រាប់ហ្គេមនេះ
  }

  private initSocket() {
    this.socket = io('http://localhost:3000', {
      auth: { token: localStorage.getItem('authToken') }
    });

    // ប្រាប់ Server ថាខ្ញុំចូលក្នុងបន្ទប់នេះ
    this.socket.emit('join_chess_game', this.gameId);

    this.socket.on('opponent_moved', (move: any) => {
      this.chess.move(move);
      this.updateState();
    });

    // ថែមក្នុង initSocket() នៃ chessboard.ts
    this.socket.on('opponent_resigned', () => {
      this.gameStatus.set('គូប្រកួតបានចុះចាញ់! អ្នកឈ្នះ!');
    });

    this.socket.on('player_joined', () => {
      this.gameStatus.set('គូប្រកួតបានចូលរួម!');
    });

    this.socket.on('opponent_left', () => {
      this.gameStatus.set('គូប្រកួតបានចាកចេញពីហ្គេម! ហ្គេមត្រូវបានបញ្ចប់។');
      // អ្នកអាចបង្ហាញ Popup ឬ Button សម្រាប់ឱ្យគាត់ត្រឡប់ទៅ Home វិញ
    });
  }

  leaveGame() {
    this.socket.emit('leave_game');
    this.router.navigate(['/chat']); // ឬទៅកាន់ទំព័រដើម
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
      this.updateState();
      return result;
    } catch (e) {
      return null;
    }
  }

  updateState() {
    this.board.set(this.chess.board());
    this.turn.set(this.chess.turn());
    if (this.chess.isCheckmate()) this.gameStatus.set('Checkmate!');
    else if (this.chess.isDraw()) this.gameStatus.set('ស្មើគ្នា!');
    else if (this.chess.isCheck()) this.gameStatus.set('ស្ដេចត្រូវគេឆែក!');
    else this.gameStatus.set('កំពុងលេង');
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
    if (confirm('តើអ្នកពិតជាចង់ចុះចាញ់មែនទេ?')) {
      this.socket.emit('game_resigned', { gameId: this.gameId });
      this.gameStatus.set('អ្នកបានចុះចាញ់!');
    }
  }
  resetGame() {
    this.chess.reset();
    this.clearSelection();
    this.updateState();
    this.gameStatus.set('កំពុងលេង');
  }
}