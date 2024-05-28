import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowMemberPopUpComponent } from './show-member-pop-up.component';

describe('ShowMemberPopUpComponent', () => {
  let component: ShowMemberPopUpComponent;
  let fixture: ComponentFixture<ShowMemberPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowMemberPopUpComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ShowMemberPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
