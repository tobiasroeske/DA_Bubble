import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import { CreateMessageAreaComponent } from '../create-message-area/create-message-area.component';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../shared/services/firestore-service/firestore.service';
import { BoardService } from '../board.service';
import { MemberDialogsService } from '../../shared/services/member-dialogs.service/member-dialogs.service';
import { User } from '../../shared/models/user.class';
import { CurrentUser } from '../../shared/interfaces/currentUser.interface';
import { ChatMessage } from '../../shared/interfaces/chatMessage.interface';
import { PrivateChat } from '../../shared/models/privateChat.class';

@Component({
  selector: 'app-create-private-message-area',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-private-message-area.component.html',
  styleUrl: './create-private-message-area.component.scss'
})
export class CreatePrivateMessageAreaComponent extends CreateMessageAreaComponent implements OnInit {
  firestore = inject(FirestoreService);
  boardServ = inject(BoardService);
  memberServ = inject(MemberDialogsService);
  currentChatPartner!: CurrentUser;
  privateChat!: ChatMessage[];
  chatId?: string;
  override message!: ChatMessage;

  @Output() setToTrue: EventEmitter<boolean> = new EventEmitter<boolean>()

  constructor() {
    super();
  }

  ngOnInit(): void {
  }

  override sendMessage(): void {
    if (this.boardServ.privateChatId) {
      let date = new Date().getTime();
      this.message = this.setMessageObject(date);
      this.firestore.updatePrivateChat(this.boardServ.privateChatId, this.message).then(() => { this.boardServ.firstPrivateMessageWasSent = true })
      this.textMessage = "";
      console.log(this.privateChat);
    }
  }

  override setMessageObject(date: number): ChatMessage {
    return {
      date: date,
      user: this.currentUser,
      message: this.textMessage,
      answers: [],
      reactions: []
    }
  }
}
