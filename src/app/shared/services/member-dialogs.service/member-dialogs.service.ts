import { Injectable, OnInit, inject } from '@angular/core';
import { CurrentUser } from '../../interfaces/currentUser.interface';
import { PrivateChat } from '../../models/privateChat.class';
import { Channel } from '../../models/channel.class';
import { FirestoreService } from '../firestore-service/firestore.service';
import { BoardService } from '../../../board/board.service';

@Injectable({
  providedIn: 'root'
})
export class MemberDialogsService {

  firestore = inject(FirestoreService);
  boardServ = inject(BoardService)
  membersDialogIsOpen: boolean = false;
  addMemberDialogIsOpen: boolean = false;
  addSpecificPerson: boolean = false;
  currentChannel!: Channel;
  name!: string;
  avatarPath!: string;
  email!: string;
  showMemberPopUpisOpen: boolean = false;
  privateChat = new PrivateChat();
  currentMember!: CurrentUser;

  constructor() { }

 

  toggleMembersDialog(event: Event) {
    this.membersDialogIsOpen = !this.membersDialogIsOpen;
    event?.stopPropagation();
  }

  openAddMembersDialog(event: Event) {
    this.addMemberDialogIsOpen = true;
    if (this.membersDialogIsOpen) {
      this.toggleMembersDialog(event)
    }
  }

  goToAddSpecificPerson(event: Event) {
    this.addSpecificPerson = true;
    event.stopPropagation();
  }

  openShowMemberPopUp(index: number) {
    if (!this.boardServ.privateChatIsStarted) {
      this.currentChannel = this.firestore.allChannels[this.boardServ.idx];
      console.log(this.currentChannel);
      this.currentMember = this.currentChannel.allUsers[index];
      this.name = this.currentChannel.members[index].name;
      this.avatarPath = this.currentChannel.members[index].avatarPath;
      this.email = this.currentChannel.members[index].email;
    } else {
      this.name = this.firestore.directMessages[index].guest.name;
      this.avatarPath = this.firestore.directMessages[index].guest.avatarPath;
      this.email = this.firestore.directMessages[index].guest.email;
    }
    this.showMemberPopUpisOpen = true;
  }

  async setChatRoom(event: Event) {
    event.preventDefault();
    this.privateChat.guest = this.currentMember;
    this.privateChat.creator = this.boardServ.currentUser;
    await this.firestore.addChatRoom(this.privateChat.toJSON());
    this.toggleMembersDialog(event);
    console.log(this.privateChat);
    this.closeShowMemberPopUp(event);
  }

  closeShowMemberPopUp(event: Event) {
    this.showMemberPopUpisOpen = false;
    event.stopPropagation();
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }
}
