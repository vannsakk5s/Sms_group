import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { ChatRoom } from './components/chat-room/chat-room';
import { Register } from './components/register/register';
import { Login } from './components/login/login';
import { authGuard } from './core/auth.guard';
import { Chessboard } from './components/chessboard/chessboard';
import { TicTacToe } from './components/tic-tac-toe/tic-tac-toe';

export const routes: Routes = [
    { path: 'login', component: Login },
    { path: 'register', component: Register },
    { path: 'chat', component: ChatRoom, canActivate: [authGuard] },
    { path: 'chess/:id', component: Chessboard, canActivate: [authGuard] },
    { path: 'tictactoe/:id', component: TicTacToe },
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: '**', redirectTo: 'login' }
];
