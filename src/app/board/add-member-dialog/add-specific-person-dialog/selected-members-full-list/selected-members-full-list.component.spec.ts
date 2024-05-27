import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedMembersFullListComponent } from './selected-members-full-list.component';

describe('SelectedMembersFullListComponent', () => {
  let component: SelectedMembersFullListComponent;
  let fixture: ComponentFixture<SelectedMembersFullListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectedMembersFullListComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SelectedMembersFullListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
