import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BoardChatFieldComponent } from './board-chat-field.component';

describe('BoardChatFieldComponent', () => {
  let component: BoardChatFieldComponent;
  let fixture: ComponentFixture<BoardChatFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BoardChatFieldComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BoardChatFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
