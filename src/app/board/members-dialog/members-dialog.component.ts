import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { FirestoreService } from '../../shared/services/firestore-service/firestore.service';
import { BoardService } from '../../shared/services/board.service';
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
export class MembersDialogComponent implements OnInit {
  @Input() dialog!: boolean;

  firestore = inject(FirestoreService);
  boardServ = inject(BoardService);
  memberServ = inject(MemberDialogsService);

  currentChannel!: Channel;
  userList!: CurrentUser[];

  async ngOnInit(): Promise<void> {
    this.currentChannel = this.firestore.allChannels[this.boardServ.idx];
    this.userList = this.firestore.userList;
    let updatedUsers = this.updateLoginState();
    try {
      await this.firestore.updateChannelUsers(updatedUsers, this.currentChannel.id!);
    } catch (error) {
      console.error('Error updating channels', error)
    }
  }

  updateLoginState(): CurrentUser[] {
    let allUsers = this.currentChannel.allUsers;
    this.userList.forEach(user => {
      let index = allUsers.findIndex(u => u.id == user.id);
      if (index != -1 && allUsers[index].loginState != user.loginState) {
        allUsers[index].loginState = user.loginState;
      }
    })
    return allUsers
  }
}
