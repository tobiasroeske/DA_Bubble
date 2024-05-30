import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { CreateMessageAreaComponent } from '../create-message-area/create-message-area.component';
import { BoardService } from '../board.service';
import { FirestoreService } from '../../shared/services/firestore-service/firestore.service';
import { MembersDialogComponent } from '../members-dialog/members-dialog.component';
import { AddMemberDialogComponent } from '../add-member-dialog/add-member-dialog.component';
import { MemberDialogsService } from '../../shared/services/member-dialogs.service/member-dialogs.service';
import { ShowMemberPopUpComponent } from '../members-dialog/show-member-pop-up/show-member-pop-up.component';
import { CreatePrivateMessageAreaComponent } from '../create-private-message-area/create-private-message-area.component';
import { PrivateChatMessageComponent } from './private-chat-message/private-chat-message.component';
import { CurrentUser } from '../../shared/interfaces/currentUser.interface';
import { ChatMessageComponent } from './chat-message/chat-message.component';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-board-chat-field',
  standalone: true,
  imports: [CommonModule, CreateMessageAreaComponent, MembersDialogComponent, AddMemberDialogComponent, ChatMessageComponent, ShowMemberPopUpComponent, CreatePrivateMessageAreaComponent, PrivateChatMessageComponent],
  templateUrl: './board-chat-field.component.html',
  styleUrl: './board-chat-field.component.scss'
})
export class BoardChatFieldComponent implements OnInit {
  mouseIsOverMessage: boolean = false;
  popUpReaction: boolean = false;
  memberDialogIsOpen: boolean = false;
  boardServ = inject(BoardService);
  firestore = inject(FirestoreService);
  memberServ = inject(MemberDialogsService);
  membersList: any[] = [];
  chatPartnerName!: string;
  chatPartnerAvatar!: string;
  //channelId: string;

  constructor() {
  }

  ngOnInit(): void {
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

