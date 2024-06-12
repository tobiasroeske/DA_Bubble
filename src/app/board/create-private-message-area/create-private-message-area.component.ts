import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, inject, Input, OnInit, Output } from '@angular/core';
import { CreateMessageAreaComponent } from '../create-message-area/create-message-area.component';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../shared/services/firestore-service/firestore.service';
import { BoardService } from '../board.service';
import { MemberDialogsService } from '../../shared/services/member-dialogs.service/member-dialogs.service';
import { CurrentUser } from '../../shared/interfaces/currentUser.interface';
import { ChatMessage } from '../../shared/interfaces/chatMessage.interface';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { PrivateChat } from '../../shared/models/privateChat.class';

@Component({
  selector: 'app-create-private-message-area',
  standalone: true,
  imports: [CommonModule, FormsModule, PickerComponent],
  templateUrl: './create-private-message-area.component.html',
  styleUrl: './create-private-message-area.component.scss'
})

export class CreatePrivateMessageAreaComponent extends CreateMessageAreaComponent implements OnInit {
  @Input() allUsers!: CurrentUser[]
  @Output() setToTrue: EventEmitter<boolean> = new EventEmitter<boolean>()

  firestore = inject(FirestoreService);
  boardServ = inject(BoardService);
  memberServ = inject(MemberDialogsService);

  currentChatPartner!: CurrentUser;
  privateChat!: ChatMessage[];
  chatId?: string;
  override message!: ChatMessage;

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.privateChat = this.firestore.directMessages[this.boardServ.chatPartnerIdx].chat;
  }

  override toggleTagMemberDialog() {
    this.filteredMembers = this.allUsers;
    this.tagMembers = !this.tagMembers
  }

  override filterMember() {
    let members: CurrentUser[] = this.allUsers;
    let lowerCaseTag = this.memberToTag.slice(1).toLowerCase();
    this.filteredMembers = members.filter(member => member.name.toLowerCase().includes(lowerCaseTag))
  }

  override async sendMessage(event?: Event) {
    if (this.boardServ.privateChatId) {
      let date = new Date().getTime();
      this.message = this.setMessageObject(date);
      if (this.message.message.trim() !== '' || this.uploadedFile.length > 0) {
        await this.firestore.updatePrivateChat(this.boardServ.privateChatId, this.message)
          .then(() => {
            this.resetTextArea();
          });
        setTimeout(() => {
          this.showMessageInChat();
        }, 1)
      }
    }
  }

  showMessageInChat() {
    let idx = this.firestoreService.directMessages.findIndex((dm: PrivateChat) => dm.guest.id == this.boardServ.currentChatPartner.id)
    if (idx == -1) {
      idx = this.firestoreService.directMessages.findIndex((dm: PrivateChat) => dm.creator.id == this.boardServ.currentChatPartner.id)
    }
    this.boardServ.startPrivateChat(idx, 'creator', event);
  }

  override resetTextArea() {
    this.uploadedFile = '';
    this.textMessage = '';
    this.filePath = '';
    this.boardServ.scrollToBottom(this.boardServ.chatFieldRef);
    this.checkIfPrivatChatIsEmpty();
  }

  checkIfPrivatChatIsEmpty() {
    if (this.privateChat.length > 0) {
      this.boardServ.firstPrivateMessageWasSent = true;
      setTimeout(() => {
        this.boardServ.hidePopUpChatPartner = true;
      }, 100);
    } else {
      this.boardServ.hidePopUpChatPartner = false
      setTimeout(() => {
        this.boardServ.firstPrivateMessageWasSent = false;
      }, 100);
    }
  }

  override setMessageObject(date: number): ChatMessage {
    return {
      date: date,
      user: this.currentUser,
      message: this.textMessage.replace('/\n/g', '<br>'),
      answers: [],
      reactions: [],
      fileUpload: this.uploadedFile,
      type: 'ChatMessage'
    }
  }
}
