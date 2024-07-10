import { Component, EventEmitter, Output, inject } from '@angular/core';
import { BoardService } from '../shared/services/board.service';

@Component({
  selector: 'app-show-profile-dialog',
  standalone: true,
  imports: [],
  templateUrl: './show-profile-dialog.component.html',
  styleUrl: './show-profile-dialog.component.scss'
})
export class ShowProfileDialogComponent {
  @Output() profileOpen = new EventEmitter<boolean>();
  @Output() editorOpen = new EventEmitter<boolean>();
  boardServ = inject(BoardService);

  readonly GUESTID = 'y7WnIAhufRhCn54XusoiYWlXl4S2';

  closeDialog() {
    this.profileOpen.emit(false);
  }

  openEditor(event:Event) {
    event.stopPropagation();
    this.editorOpen.emit(true);
  }
}
