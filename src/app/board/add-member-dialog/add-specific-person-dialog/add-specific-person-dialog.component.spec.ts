import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSpecificPersonDialogComponent } from './add-specific-person-dialog.component';

describe('AddSpecificPersonDialogComponent', () => {
  let component: AddSpecificPersonDialogComponent;
  let fixture: ComponentFixture<AddSpecificPersonDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSpecificPersonDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddSpecificPersonDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
