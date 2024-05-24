import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatMessage } from '../../shared/interfaces/chatMessage.interface';
import { BoardService } from '../board.service';
import { FirestoreService } from '../../shared/services/firestore-service/firestore.service';
import { LocalStorageService } from '../../shared/services/local-storage-service/local-storage.service';
import { CurrentUser } from '../../shared/interfaces/currentUser.interface';

@Component({
  selector: 'app-create-message-area',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-message-area.component.html',
  styleUrl: './create-message-area.component.scss'
})
export class CreateMessageAreaComponent {
  boardService = inject(BoardService);
  firestoreService = inject(FirestoreService);
  textMessage: string = '';
  message!: ChatMessage;
  currentUser: any;
  @Input() index!: number;
  @Input() channelId!: string;

  constructor() {
    this.currentUser = this.boardService.currentUser;
  }

  sendMessage(index:number) {
    let date = new Date().getTime();
    this.firestoreService.updateChats(this.channelId, this.setMessageObject(date))
    .then(() => this.textMessage = '')
  }

  setMessageObject(date: number): ChatMessage {
    return {
    date: date,
    user: this.currentUser,
    message: this.textMessage,
    answers: [],
    reactions: [],
    }
  }
}
