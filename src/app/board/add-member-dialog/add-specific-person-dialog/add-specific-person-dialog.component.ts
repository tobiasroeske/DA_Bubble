import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { BoardService } from '../../board.service';
import { FirestoreService } from '../../../shared/services/firestore-service/firestore.service';
import { FormsModule } from '@angular/forms';
import { Channel } from '../../../shared/models/channel.class';
import { CurrentUser } from '../../../shared/interfaces/currentUser.interface';
import { User } from '../../../shared/models/user.class';
import { SelectedMembersFullListComponent } from './selected-members-full-list/selected-members-full-list.component';
import { SuggestedListComponent } from './suggested-list/suggested-list.component';
import { FirstTwoSelectedMembersComponent } from './first-two-selected-members/first-two-selected-members.component';

@Component({
  selector: 'app-add-specific-person-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, SelectedMembersFullListComponent, SuggestedListComponent, FirstTwoSelectedMembersComponent],
  templateUrl: './add-specific-person-dialog.component.html',
  styleUrl: './add-specific-person-dialog.component.scss'
})


export class AddSpecificPersonDialogComponent implements OnInit {
  boardServ = inject(BoardService);
  firestore = inject(FirestoreService);
  title!: string;
  currentChannel!: Channel;
  channelId!: string;
  selectedMember: any;
  showSuggestedList: boolean = false;
  searchValue!: string;
  showAllSelectedMembers: boolean = false;
  placeholder: string = "Name eingeben";
  userList: CurrentUser[] = [];
  filteredUsersList: any[] = [];
  selectedList: any = [];
  channel:Channel = new Channel();

  constructor() {
    this.title = this.firestore.allChannels[this.boardServ.idx].title;
    this.currentChannel = new Channel(this.firestore.allChannels[this.boardServ.idx]);
    this.channelId = this.currentChannel.id!
  }

  ngOnInit(): void {
    this.loadUsers();
  };

  loadUsers() {
    this.currentChannel.allUsers.forEach((user) => {
      if (user.selected == false) {
        this.userList.push(user)
      }
    })
  }

  getFirstTwoMembers() {
    return this.selectedList.slice(0, 2);
  }

  addNewMembersToChannel() {
    this.selectedList.forEach((member: any) => {
      this.firestore.updateMembers(member, this.channelId);
      this.currentChannel.allUsers.forEach((user) => {
        if (user.name == member.name) {
          user.selected = true;
        }
      })
    })
    let updatedUsers = this.currentChannel.allUsers;
    this.firestore.updateChannelUsers(updatedUsers, this.channelId);
    this.selectedList = [];
  };

  filterMembers(text: string) {
    if (!text) {
      this.showSuggestedList = false;
    } else {
      this.filteredUsersList = this.userList.filter(ul => ul.name.toLowerCase().includes(text.toLowerCase()) && ul.selected == false);
      if (this.filteredUsersList.length > 0) {
        this.showSuggestedList = true;
      } else {
        this.showSuggestedList = false;
      }
    }
  };

  addMemberToSelectedList(index: number) {
    this.selectedMember = this.filteredUsersList[index];
    this.selectedMember.selected = true;
    this.selectedList.push(this.selectedMember);
    console.log(this.selectedList);
    this.searchValue = "";
  }


  removeMemberFromSelectedList(index: number) {
    this.selectedList[index].selected = false;
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
