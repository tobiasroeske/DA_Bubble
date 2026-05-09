import {
  Component,
  EventEmitter,
  HostListener,
  inject,
  OnInit,
  Output,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CreateMessageAreaComponent } from '../create-message-area/create-message-area.component';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../shared/services/firestore-service/firestore.service';
import { BoardService } from '../../shared/services/board-service/board.service';
import { MemberDialogsService } from '../../shared/services/member-dialogs.service/member-dialogs.service';
import { UserProfile } from '../../shared/interfaces/user.interface';
import { Message } from '../../shared/interfaces/message.interface';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-create-private-message-area',
  imports: [FormsModule, PickerComponent],
  templateUrl: './create-private-message-area.component.html',
  styleUrl: './create-private-message-area.component.scss',
})
export class CreatePrivateMessageAreaComponent
  extends CreateMessageAreaComponent
  implements OnInit
{
  readonly allUsers = input.required<UserProfile[]>();
  @Output() setToTrue: EventEmitter<boolean> = new EventEmitter<boolean>();

  firestore = inject(FirestoreService);
  boardServ = inject(BoardService);
  memberServ = inject(MemberDialogsService);

  constructor() {
    super();
  }

  ngOnInit(): void {
    // DM messages are now loaded via firestore.dmMessages() signal
  }

  override toggleTagMemberDialog() {
    this.filteredMembers = this.allUsers();
    this.tagMembers = !this.tagMembers;
  }

  override filterMember() {
    const members: UserProfile[] = this.allUsers();
    const lowerCaseTag = this.memberToTag.slice(1).toLowerCase();
    this.filteredMembers = members.filter(member =>
      member.name.toLowerCase().includes(lowerCaseTag)
    );
  }

  override async sendMessage(event?: Event) {
    if (this.boardServ.privateChatId) {
      const msg = this.buildMessage();
      if (msg.text.trim() !== '' || this.uploadedFile.length > 0) {
        try {
          await this.firestore.addDmMessage(this.boardServ.privateChatId, msg);
          this.resetTextArea();
          setTimeout(() => {
            this.showMessageInChat();
          }, 1);
        } catch (error) {
          console.error('Error updating private chat:', error);
        }
      }
    }
  }

  showMessageInChat() {
    const currentUserId = this.boardServ.currentUser.id;
    const partnerId = this.boardServ.currentChatPartner?.id;
    let idx = -1;
    if (currentUserId && partnerId) {
      idx = this.firestoreService
        .directMessages()
        .findIndex(
          dm => dm.participantIds.includes(currentUserId) && dm.participantIds.includes(partnerId)
        );
    }
    this.boardServ.startPrivateChat(idx, undefined, event as Event | undefined);
  }

  override resetTextArea() {
    this.uploadedFile = '';
    this.textMessage = '';
    this.filePath = '';
    this.boardServ.scrollToBottom(this.boardServ.chatFieldRef);
    this.checkIfPrivatChatIsEmpty();
    this.boardServ.privateAnswerMessage = undefined;
  }

  checkIfPrivatChatIsEmpty() {
    if (this.firestore.dmMessages().length > 0) {
      this.boardServ.firstPrivateMessageWasSent.set(true);
      setTimeout(() => {
        this.boardServ.hidePopUpChatPartner.set(true);
      }, 100);
    } else {
      this.boardServ.hidePopUpChatPartner.set(false);
      setTimeout(() => {
        this.boardServ.firstPrivateMessageWasSent.set(false);
      }, 100);
    }
  }
}
