import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TelegramAuth } from './telegram-auth';

describe('TelegramAuth', () => {
  let component: TelegramAuth;
  let fixture: ComponentFixture<TelegramAuth>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TelegramAuth]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TelegramAuth);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
