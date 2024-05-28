import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { FirestoreService } from '../../shared/services/firestore-service/firestore.service';
import { BoardService } from '../board.service';
import { MemberDialogsService } from '../../shared/services/member-dialogs.service/member-dialogs.service';
import { ShowMemberPopUpComponent } from './show-member-pop-up/show-member-pop-up.component';
import { Channel } from '../../shared/models/channel.class';
import { PrivateChat } from '../../shared/models/privateChat.class';
import { CurrentUser } from '../../shared/interfaces/currentUser.interface';
import { SignupService } from '../../shared/services/signup/signup.service';

@Component({
  selector: 'app-members-dialog',
  standalone: true,
  imports: [CommonModule, ShowMemberPopUpComponent],
  templateUrl: './members-dialog.component.html',
  styleUrl: './members-dialog.component.scss'
})
export class MembersDialogComponent {
  @Input() dialog!: boolean;
  firestore = inject(FirestoreService);
  boardServ = inject(BoardService);
  memberServ = inject(MemberDialogsService);
  currentChannel!: Channel;
  name!: string;
  avatarPath!: string;
  showMemberPopUpisOpen: boolean = false;
  privateChat = new PrivateChat();
  currentMember!: CurrentUser;

  openShowMemberPopUp(index: number) {
    this.currentChannel = this.firestore.allChannels[this.boardServ.idx];
    this.currentMember = this.currentChannel.members[index];
    this.name = this.currentChannel.members[index].name;
    this.avatarPath = this.currentChannel.members[index].avatarPath;
    this.showMemberPopUpisOpen = true;
  }

  setChatRoom(event: Event) {
    this.privateChat.guest = this.currentMember;
    this.privateChat.creator = this.boardServ.currentUser;
    this.firestore.addChatRoom(this.privateChat.toJSON());
    // console.log(this.privateChat);
    console.log(this.firestore.directMessages);
    event.preventDefault();
  }



  closeShowMemberPopUp(event: Event) {
    this.showMemberPopUpisOpen = false;
    event.stopPropagation();
  }
}
