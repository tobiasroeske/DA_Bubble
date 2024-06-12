import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddSpecificPersonDialogMobileComponent } from './add-specific-person-dialog-mobile.component';

describe('AddSpecificPersonDialogMobileComponent', () => {
  let component: AddSpecificPersonDialogMobileComponent;
  let fixture: ComponentFixture<AddSpecificPersonDialogMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddSpecificPersonDialogMobileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddSpecificPersonDialogMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
