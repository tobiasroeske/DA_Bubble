import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { BoardService } from '../../board.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent {
  @Output() notificationsOpen = new EventEmitter<boolean>();
  boardServ = inject(BoardService);

  closeDialog() {
    this.notificationsOpen.emit(false);
    
  }
}
