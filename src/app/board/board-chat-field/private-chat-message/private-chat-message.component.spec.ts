import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateChatMessageComponent } from './private-chat-message.component';

describe('PrivateChatMessageComponent', () => {
  let component: PrivateChatMessageComponent;
  let fixture: ComponentFixture<PrivateChatMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivateChatMessageComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrivateChatMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
