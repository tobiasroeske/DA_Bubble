import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CreateMessageAreaThreadComponent } from './create-message-area-thread/create-message-area-thread.component';
import { BoardService } from '../board.service';
@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [CommonModule, CreateMessageAreaThreadComponent],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {

  boardServ = inject(BoardService)
  specialBlue: string = "rgba(83, 90, 241, 1)"
}
