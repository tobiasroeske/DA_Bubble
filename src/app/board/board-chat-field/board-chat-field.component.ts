import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { CreateMessageAreaComponent } from '../create-message-area/create-message-area.component';
import { BoardService } from '../board.service';
import { FirestoreService } from '../../shared/services/firestore-service/firestore.service';


@Component({
  selector: 'app-board-chat-field',
  standalone: true,
  imports: [CommonModule, CreateMessageAreaComponent],
  templateUrl: './board-chat-field.component.html',
  styleUrl: './board-chat-field.component.scss'
})
export class BoardChatFieldComponent {

  mouseIsOverMessage: boolean = false;
  popUpReaction: boolean = false;
  boardServ = inject(BoardService);
  firestore = inject(FirestoreService);

  onHover(htmlElement: string) {
    if (htmlElement == 'message-box') {
      this.mouseIsOverMessage = true;
    } else {
      this.popUpReaction = true;
    }
  }

  onLeave(htmlElement: string) {
    if (htmlElement == 'message-box') {
      this.mouseIsOverMessage = false;
    } else {
      this.popUpReaction = false;
    }
  }
}

