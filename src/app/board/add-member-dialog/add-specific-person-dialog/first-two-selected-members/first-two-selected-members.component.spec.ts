import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirstTwoSelectedMembersComponent } from './first-two-selected-members.component';

describe('FirstTwoSelectedMembersComponent', () => {
  let component: FirstTwoSelectedMembersComponent;
  let fixture: ComponentFixture<FirstTwoSelectedMembersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FirstTwoSelectedMembersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FirstTwoSelectedMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
