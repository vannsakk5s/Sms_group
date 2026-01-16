import { TestBed } from '@angular/core/testing';

import { ChessService } from './chess';

describe('ChessService', () => {
  let service: ChessService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ChessService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
