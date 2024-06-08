import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchedUserPopUpComponent } from './searched-user-pop-up.component';

describe('SearchedUserPopUpComponent', () => {
  let component: SearchedUserPopUpComponent;
  let fixture: ComponentFixture<SearchedUserPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchedUserPopUpComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SearchedUserPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
