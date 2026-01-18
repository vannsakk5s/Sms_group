import { TestBed } from '@angular/core/testing';

import { TicTacToeService } from './tic-tac-toe';

describe('TicTacToeService', () => {
  let service: TicTacToeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TicTacToeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
