import { Injectable, inject } from '@angular/core';
import { UserProfile } from '../../interfaces/user.interface';
import { Channel } from '../../interfaces/channel.interface';
import { DirectMessage } from '../../interfaces/direct-message.interface';
import { FirestoreService } from '../firestore-service/firestore.service';
import { BoardService } from '../board-service/board.service';

@Injectable({
  providedIn: 'root'
})
export class MemberDialogsService {
  firestore = inject(FirestoreService);
  boardServ = inject(BoardService);

  membersDialogIsOpen: boolean = false;
  addMemberDialogIsOpen: boolean = false;
  addSpecificPerson: boolean = false;
  showMemberPopUpisOpen: boolean = false;

  currentChannel: Channel | undefined;
  name = '';
  avatarPath = '';
  email = '';
  currentMember: UserProfile | undefined;
  guestId: string | undefined;
  creatorId: string | undefined;
  searchedUserPopUpId: string | undefined;

  toggleMembersDialog(event: Event) {
    this.membersDialogIsOpen = !this.membersDialogIsOpen;
    event?.stopPropagation();
  }

  openAddMembersDialog(event: Event) {
    if (!this.boardServ.editDialogIsOpen()) {
      if (this.membersDialogIsOpen) {
        this.toggleMembersDialog(event);
      }
      this.addMemberDialogIsOpen = true;
    } else {
      this.goToAddSpecificPerson(event);
    }
  }

  goToAddSpecificPerson(event: Event) {
    this.addSpecificPerson = true;
    event.stopPropagation();
  }

  closeAddSpecDialogMobile(event: Event) {
    this.addSpecificPerson = false;
    event.stopPropagation();
  }

  openShowMemberPopUp(index: number) {
    if (!this.boardServ.privateChatIsStarted()) {
      this.startNewChat(index);
    } else {
      this.goToChat(index);
    }
    this.showMemberPopUpisOpen = true;
  }

  startNewChat(index: number) {
    this.currentChannel = this.firestore.allChannels()[this.boardServ.idx];
    if (this.currentChannel) {
      const memberId = this.currentChannel.memberIds[index];
      const member = this.firestore.userList().find(u => u.id === memberId);
      if (member) {
        this.currentMember = member;
        this.name = member.name;
        this.avatarPath = member.avatarPath;
        this.email = member.email;
      }
    }
  }

  goToChat(index: number) {
    const dm = this.firestore.directMessages()[index];
    const otherUserId = dm.participantIds.find(id => id !== this.boardServ.currentUser.id)
      ?? dm.participantIds[0];
    const partner = this.firestore.userList().find(u => u.id === otherUserId);
    if (partner) {
      this.name = partner.name;
      this.avatarPath = partner.avatarPath;
      this.email = partner.email;
      this.currentMember = partner;
    }
  }

  checkMemberLoginState(member: UserProfile): string | null {
    const user = this.firestore.userList().find(user => user.id === member.id);
    return user ? user.loginState : null;
  }

  async setChatRoom(event: Event) {
    event.preventDefault();
    this.guestId = this.currentMember?.id;
    this.creatorId = this.boardServ.currentUser.id;

    const existingDm = this.guestId && this.creatorId
      ? this.firestore.findExistingDm(this.creatorId, this.guestId)
      : undefined;

    if (existingDm) {
      this.handleExistingGuest(event, existingDm);
    } else {
      await this.addNewChatRoom(event);
    }
  }

  async addNewChatRoom(event: Event) {
    const participantIds = [this.creatorId!, this.guestId!].filter(Boolean);
    await this.firestore.addChatRoom(participantIds).then(() => {
      this.boardServ.privateChatId = this.firestore.chatRoomId;
      this.toggleMembersDialog(event);
      this.closeShowMemberPopUp(event);
      this.startPrivateChat(event);
    });
  }

  handleExistingGuest(event: Event, dm?: DirectMessage) {
    if (dm) {
      const idx = this.firestore.directMessages().findIndex(d => d.id === dm.id);
      if (idx !== -1) {
        this.boardServ.startPrivateChat(idx, undefined, event);
      }
    } else {
      this.startPrivateChat(event);
    }
    this.closeShowMemberPopUp(event);
  }

  startPrivateChat(event: Event) {
    const idx = this.firestore.directMessages().findIndex(dm =>
      dm.participantIds.includes(this.guestId!) && dm.participantIds.includes(this.creatorId!)
    );
    this.boardServ.startPrivateChat(idx, undefined, event);
  }

  closeShowMemberPopUp(event: Event) {
    this.showMemberPopUpisOpen = false;
    event.preventDefault();
    event.stopPropagation();
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }
}
