import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BoardService } from '../../shared/services/board.service';
import { AddSpecificPersonDialogComponent } from './add-specific-person-dialog/add-specific-person-dialog.component';
import { MemberDialogsService } from '../../shared/services/member-dialogs.service/member-dialogs.service';
import { FirestoreService } from '../../shared/services/firestore-service/firestore.service';
import { Channel } from '../../shared/models/channel.class';
import { CurrentUser } from '../../shared/interfaces/currentUser.interface';
import { AddSpecificPersonDialogMobileComponent } from './add-specific-person-dialog-mobile/add-specific-person-dialog-mobile.component';
@Component({
  selector: 'app-add-member-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, AddSpecificPersonDialogComponent, AddSpecificPersonDialogMobileComponent],
  templateUrl: './add-member-dialog.component.html',
  styleUrl: './add-member-dialog.component.scss'
})
export class AddMemberDialogComponent {
  @Input() currentChannel!: Channel;
  @Input() currentChannelId!: string;

  memberServ = inject(MemberDialogsService);
  boardServ = inject(BoardService);
  firestore = inject(FirestoreService);

  specificMember: boolean = false;
  allMembers: boolean = false;
  allUsers: CurrentUser[] = []

  onCheck(condition: string) {
    if (condition == "allMembers") {
      this.allMembers = !this.allMembers;
      this.specificMember = false;
    } else {
      this.specificMember = !this.specificMember;
      this.allMembers = false;
    }
  }

  async setAllUsersOnSelectedTrue(event: Event) {
    this.allUsers = this.firestore.userList;
    this.allUsers.forEach(u => {
      u.selected = true;
    })
    await this.firestore.updateChannelUsers(this.allUsers, this.currentChannelId)
    this.addUserToMemberArray();
    this.closeAddMemberDialog(event)
  }

  async addUserToMemberArray() {
    this.currentChannel.members = [];
    this.currentChannel.partecipantsIds = [];
    this.allUsers.forEach(user => {
      this.currentChannel.members.push(user);
    });
    this.currentChannel.members.forEach(async (members) => {
      await this.firestore.updateMembers(members, this.currentChannelId);
      if (members.id) {
        this.currentChannel.partecipantsIds.push(members.id)
      }
    });
    this.addIdsToPartecipantsIds();
  }

  addIdsToPartecipantsIds() {
    this.currentChannel.partecipantsIds.forEach(id => {
      if (this.currentChannel.id) {
        this.firestore.updatePartecipantsIds(id, this.currentChannelId)
      }
    })
  }

  closeAddMemberDialog(event: Event) {
    this.memberServ.addMemberDialogIsOpen = false;
    this.memberServ.addSpecificPerson = false;
    event.stopPropagation();
  }
}
