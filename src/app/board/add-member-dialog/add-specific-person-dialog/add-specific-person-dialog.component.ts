import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { BoardService } from '../../board.service';
import { FirestoreService } from '../../../shared/services/firestore-service/firestore.service';
import { FormsModule } from '@angular/forms';
import { Channel } from '../../../shared/models/channel.class';
import { CurrentUser } from '../../../shared/interfaces/currentUser.interface';

@Component({
  selector: 'app-add-specific-person-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-specific-person-dialog.component.html',
  styleUrl: './add-specific-person-dialog.component.scss'
})
export class AddSpecificPersonDialogComponent {
  boardServ = inject(BoardService);
  firestore = inject(FirestoreService);
  title!: string;
  userList;
  filteredUsersList;
  selectedList: any = [];
  currentChannel!: Channel;
  channelId!: string;
  selectedMember: any;
  showSuggestedList: boolean = false;
  searchValue!: string;
  showAllSelectedMembers: boolean = false;
  placeholder: string = "Name eingeben"

  constructor() {
    this.title = this.firestore.allChannels[this.boardServ.idx].title;
    this.userList = this.firestore.userList;
    this.filteredUsersList = this.userList;
    this.currentChannel = new Channel(this.firestore.allChannels[this.boardServ.idx]);
    this.channelId = this.currentChannel['id']!
  }

  addNewMembersToChannel() {
    this.selectedList.forEach((member: string) => {
      this.currentChannel.members.push(member);
    })
    this.firestore.updateChannel(this.currentChannel.toJSON(), this.channelId);
  }

  filterMembers(text: string) {
    if (!text) {
      this.filteredUsersList = this.userList;
      this.showSuggestedList = false;
    } else {
      this.filteredUsersList = this.userList.filter(ul => ul.name.toLowerCase().includes(text.toLowerCase()));
      if (this.filteredUsersList.length > 0) {
        this.showSuggestedList = true;
      } else {
        this.showSuggestedList = false;
      }
    }
  }

  addMemberToSelectedList(index: number) {
    this.selectedMember = this.filteredUsersList[index];
    let idx = this.selectedList.indexOf(this.selectedMember);
    if (idx == -1) {
      this.selectedList.push(this.selectedMember);
      this.searchValue = "";
      console.log(this.filteredUsersList);
    }
  }

  removeMemberFromSelectedList(index: number) {
    this.selectedList.splice(index, 1)
  }

  showSelectedMembersFullList() {
    this.showAllSelectedMembers = true
  }

  hideSelectedMembersFullList() {
    this.showAllSelectedMembers = false
  }

  hidePlaceholder() {
    this.placeholder = "";
  }

  showPlaceholder() {
    this.placeholder = "Name eingeben"
  }
}
