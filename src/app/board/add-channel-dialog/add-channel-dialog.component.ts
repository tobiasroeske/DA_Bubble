import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardService } from '../board.service';

@Component({
  selector: 'app-add-channel-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add-channel-dialog.component.html',
  styleUrl: './add-channel-dialog.component.scss'
})
export class AddChannelDialogComponent {
  boardServ = inject(BoardService);
}
