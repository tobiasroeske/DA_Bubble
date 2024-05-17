import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMessageAreaThreadComponent } from './create-message-area-thread.component';

describe('CreateMessageAreaThreadComponent', () => {
  let component: CreateMessageAreaThreadComponent;
  let fixture: ComponentFixture<CreateMessageAreaThreadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateMessageAreaThreadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateMessageAreaThreadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
