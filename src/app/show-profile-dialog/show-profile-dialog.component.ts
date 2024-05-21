import { Component, inject } from '@angular/core';
import { BoardService } from '../board/board.service';

@Component({
  selector: 'app-show-profile-dialog',
  standalone: true,
  imports: [],
  templateUrl: './show-profile-dialog.component.html',
  styleUrl: './show-profile-dialog.component.scss'
})
export class ShowProfileDialogComponent {
  boardServ = inject(BoardService);

  closeDialog($event:Event) {
    this.boardServ.toggleProfileOptions(); 
    this.boardServ.stopPropagation($event);
    this.boardServ.toggleProfileView();
  }
}
