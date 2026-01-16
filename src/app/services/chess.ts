import { Injectable, signal } from '@angular/core';
import { Chess } from 'chess.js';

@Injectable({
  providedIn: 'root',
})
export class ChessService {
  private game = new Chess();
  
  // ប្រើ Signal សម្រាប់ Board State
  board = signal(this.game.board());
  turn = signal(this.game.turn());

  makeMove(from: string, to: string) {
    try {
      const move = this.game.move({ from, to, promotion: 'q' });
      if (move) {
        this.board.set(this.game.board());
        this.turn.set(this.game.turn());
        return move;
      }
    } catch (e) {
      return null;
    }
    return null;
  }
  
}
