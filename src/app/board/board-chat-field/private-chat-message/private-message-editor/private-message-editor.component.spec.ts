import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrivateMessageEditorComponent } from './private-message-editor.component';

describe('PrivateMessageEditorComponent', () => {
  let component: PrivateMessageEditorComponent;
  let fixture: ComponentFixture<PrivateMessageEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrivateMessageEditorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PrivateMessageEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
