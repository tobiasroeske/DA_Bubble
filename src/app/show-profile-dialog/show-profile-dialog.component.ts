import { Component, EventEmitter, Output, inject } from '@angular/core';
import { BoardService } from '../board/board.service';

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

  readonly GUESTID = 'FxAZJUx5LUa049q1I8MPue15PMS2';

  closeDialog() {
    this.profileOpen.emit(false);
  }

  openEditor(event:Event) {
    event.stopPropagation();
    this.editorOpen.emit(true);
  }
}
