import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreatePrivateMessageAreaComponent } from './create-private-message-area.component';

describe('CreatePrivateMessageAreaComponent', () => {
  let component: CreatePrivateMessageAreaComponent;
  let fixture: ComponentFixture<CreatePrivateMessageAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreatePrivateMessageAreaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreatePrivateMessageAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
