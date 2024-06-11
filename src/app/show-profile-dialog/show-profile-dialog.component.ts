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
  @Output() mobileOpen = new EventEmitter<boolean>();
  boardServ = inject(BoardService);

  closeDialog($event:Event) {
    this.boardServ.profileOptionsOpen = false;
    this.boardServ.editMode = false;
    this.boardServ.authService.errorCode = '';
    this.boardServ.profileOpen = false;
    this.boardServ.stopPropagation($event);
    this.closeMobileDialog();
  }

  closeMobileDialog() {
    this.mobileOpen.emit(false);
  }
}
