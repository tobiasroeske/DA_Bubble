import { Injectable, OnInit, inject, HostListener } from '@angular/core';
import { CurrentUser } from '../../interfaces/currentUser.interface';
import { PrivateChat } from '../../models/privateChat.class';
import { Channel } from '../../models/channel.class';
import { FirestoreService } from '../firestore-service/firestore.service';
import { BoardService } from '../../../board/board.service';
import { User } from '../../models/user.class';
import { ChatMessage } from '../../interfaces/chatMessage.interface';
import { PrivateChatMessageComponent } from '../../../board/board-chat-field/private-chat-message/private-chat-message.component';

@Injectable({
  providedIn: 'root'
})
export class MemberDialogsService implements OnInit {
  firestore = inject(FirestoreService);
  boardServ = inject(BoardService)

  membersDialogIsOpen: boolean = false;
  addMemberDialogIsOpen: boolean = false;
  addSpecificPerson: boolean = false;
  showMemberPopUpisOpen: boolean = false;

  privateChat = new PrivateChat();
  currentChannel!: Channel;
  name!: string;
  avatarPath!: string;
  email!: string;
  currentMember!: CurrentUser;
  guestId?: string;
  creatorId?: string;
  searchedUserPopUpId?: string;


  ngOnInit() {
  }

  toggleMembersDialog(event: Event) {
    this.membersDialogIsOpen = !this.membersDialogIsOpen;
    event?.stopPropagation();
  }

  openAddMembersDialog(event: Event) {
    if (!this.boardServ.editDialogIsOpen) {
      // if (this.membersDialogIsOpen) {
      // this.toggleMembersDialog(event)
      this.addMemberDialogIsOpen = true;
      // }
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
    if (!this.boardServ.privateChatIsStarted) {
      this.startNewChat(index);
    } else {
      this.goToChat(index);
    }
    this.showMemberPopUpisOpen = true;
  }

  startNewChat(index: number) {
    this.currentChannel = this.firestore.allChannels[this.boardServ.idx];
    this.currentMember = this.currentChannel.members[index];
    this.name = this.currentChannel.members[index].name;
    this.avatarPath = this.currentChannel.members[index].avatarPath;
    this.email = this.currentChannel.members[index].email;
  }

  goToChat(index: number) {
    this.name = this.firestore.directMessages[index].guest.name;
    this.avatarPath = this.firestore.directMessages[index].guest.avatarPath;
    this.email = this.firestore.directMessages[index].guest.email;
    this.currentMember = this.firestore.directMessages[index].guest;
  }

  checkMemberLoginState(member: CurrentUser) {
    let allUsers = this.firestore.userList;
    let user = allUsers.find(user => user.id == member.id);
    if (user != undefined) {
      return user.loginState
    } else {
      return null
    }
  }

  async setChatRoom(event: Event) {
    event.preventDefault();
    this.setThePrivateChatObject();

    if (this.isGuestExist()) {
      this.handleExistingGuest(event);
    } else {
      await this.addNewChatRoom(event);
    }
  }

  isGuestExist(): boolean {
    return this.firestore.directMessages.findIndex((dm: PrivateChat) => dm.guest.id == this.guestId) !== -1;
  }

  async addNewChatRoom(event: Event) {
    await this.firestore.addChatRoom(this.privateChat.toJSON()).then(() => {
      this.boardServ.privateChatId = this.firestore.chatRoomId;
      this.toggleMembersDialog(event);
      this.closeShowMemberPopUp(event);
      this.startPrivateChat(event);
    });
  }

  handleExistingGuest(event: Event) {
    this.startPrivateChat(event);
    this.closeShowMemberPopUp(event);
  }

  startPrivateChat(event: Event) {
    const idx = this.firestore.directMessages.findIndex((dm: PrivateChat) => dm.guest.id == this.guestId);
    this.boardServ.startPrivateChat(idx, 'creator', event);
  }

  setThePrivateChatObject() {
    this.privateChat.guest = this.currentMember;
    this.privateChat.creator = this.boardServ.currentUser;
    this.guestId = this.privateChat.guest.id;
    this.creatorId = this.privateChat.creator.id;
    if (this.guestId && this.creatorId) {
      this.privateChat.partecipantsIds = [];
      this.privateChat.partecipantsIds.push(this.guestId, this.creatorId)
    }
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
