import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuggestedListComponent } from './suggested-list.component';

describe('SuggestedListComponent', () => {
  let component: SuggestedListComponent;
  let fixture: ComponentFixture<SuggestedListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuggestedListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SuggestedListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
