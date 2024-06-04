import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowChatParterPopUpComponent } from './show-chat-parter-pop-up.component';

describe('ShowChatParterPopUpComponent', () => {
  let component: ShowChatParterPopUpComponent;
  let fixture: ComponentFixture<ShowChatParterPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowChatParterPopUpComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShowChatParterPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
