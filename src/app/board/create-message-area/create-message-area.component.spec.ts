import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateMessageAreaComponent } from './create-message-area.component';

describe('CreateMessageAreaComponent', () => {
  let component: CreateMessageAreaComponent;
  let fixture: ComponentFixture<CreateMessageAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateMessageAreaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CreateMessageAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
