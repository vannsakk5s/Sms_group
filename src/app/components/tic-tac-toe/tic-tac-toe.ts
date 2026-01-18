import { Component, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // ចាំបាច់សម្រាប់ ngClass, ngIf
import { TicTacToeService } from '../../services/tic-tac-toe'; // ឈ្មោះ file តាមដែលអ្នក save
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-tic-tac-toe',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tic-tac-toe.html',
  styleUrl: './tic-tac-toe.css',
})
export class TicTacToe implements OnInit {
  // Inject Service
  gameService = inject(TicTacToeService);
  private route = inject(ActivatedRoute);

  // ទាញយក Signal ពី Service មកប្រើផ្ទាល់
  board = this.gameService.board;
  currentPlayer = this.gameService.turn;
  mySide = this.gameService.mySide;
  winner = this.gameService.winner;

  // Computed: គណនាថាតើស្មើគ្នាឬអត់
  isDraw = computed(() => !this.winner() && this.board().every(cell => cell !== ''));

  ngOnInit() {
    // បើ User ចូលតាម URL ដោយមិនទាន់មាន GameID (ករណី Refresh Page)
    // អ្នកអាចបន្ថែម Logic ដើម្បី Re-join នៅទីនេះបាន
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
       this.gameService.gameId.set(id);
    }
  }

  makeMove(index: number) {
    // ហៅទៅ Service ជំនួសឱ្យការធ្វើ Local Logic
    this.gameService.makeMove(index);
  }

  // ប៊ូតុងស្វែងរកគូថ្មី
  findNewMatch() {
      this.gameService.findMatch();
  }
}