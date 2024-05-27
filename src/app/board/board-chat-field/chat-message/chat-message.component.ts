import { Component, Input, inject } from '@angular/core';
import { BoardService } from '../../board.service';
import { FirestoreService } from '../../../shared/services/firestore-service/firestore.service';
import { CommonModule } from '@angular/common';
import { ChatMessage } from '../../../shared/interfaces/chatMessage.interface';

@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-message.component.html',
  styleUrl: './chat-message.component.scss'
})
export class ChatMessageComponent {
  @Input() chat!: ChatMessage;
  @Input() lastIndex!: boolean;
  mouseIsOverMessage: boolean = false;
  popUpReaction: boolean = false;
  memberDialogIsOpen: boolean = false;
  boardServ = inject(BoardService);
  firestore = inject(FirestoreService);
  membersList: any[] = []


  checkIfDateIsToday(date:number) {
    let todayAsString = new Date().toDateString();
    let dateToCheckAsString = new Date(date).toDateString();
    let sameDate = todayAsString == dateToCheckAsString;
    if (sameDate) {
      return true;
    } else {
      return false;
    }
  }

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

  showMembersDialogToggle() {
    this.memberDialogIsOpen = true;
  }
}
