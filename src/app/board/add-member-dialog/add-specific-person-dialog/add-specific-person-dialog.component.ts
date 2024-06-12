import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, HostListener } from '@angular/core';
import { BoardService } from '../../board.service';
import { FirestoreService } from '../../../shared/services/firestore-service/firestore.service';
import { FormsModule } from '@angular/forms';
import { Channel } from '../../../shared/models/channel.class';
import { CurrentUser } from '../../../shared/interfaces/currentUser.interface';
import { User } from '../../../shared/models/user.class';
import { SelectedMembersFullListComponent } from './selected-members-full-list/selected-members-full-list.component';
import { SuggestedListComponent } from './suggested-list/suggested-list.component';
import { FirstTwoSelectedMembersComponent } from './first-two-selected-members/first-two-selected-members.component';
import { MemberDialogsService } from '../../../shared/services/member-dialogs.service/member-dialogs.service';

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
  memberServ = inject(MemberDialogsService)

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
  channel: Channel = new Channel();
  currentWindowWidth!: number;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.currentWindowWidth = event.target.innerWidth;
  }

  constructor() {
    this.title = this.firestore.allChannels[this.boardServ.idx].title;
    this.currentChannel = new Channel(this.firestore.allChannels[this.boardServ.idx]);
    this.channelId = this.currentChannel.id!
  }

  ngOnInit(): void {
    this.loadUsers();
  };

  async loadUsers() {
    await this.findNewAddedUsers();
    this.currentChannel.allUsers.forEach((user) => {
      if (user.selected == false) {
        this.userList.push(user)
      }
    })
  }

  async findNewAddedUsers() {
    let currentChannelUids = this.currentChannel.allUsers.map(user => user.id);
    let userList = this.firestore.userList;
    userList.forEach(user => {
      if (!currentChannelUids.includes(user.id)) {
        this.currentChannel.allUsers.push(user)
      }
    })
    await this.firestore.updateChannelUsers(this.currentChannel.allUsers, this.channelId);
  }

  getFirstTwoMembers() {
    return this.selectedList.slice(0, 2);
  }

  addNewMembersToChannel() {
    this.currentChannel.partecipantsIds = [];
    this.selectedList.forEach((member: CurrentUser) => {
      this.firestore.updateMembers(member, this.channelId);
      if (member.id) {
        this.currentChannel.partecipantsIds.push(member.id);
      }
      this.currentChannel.allUsers.forEach((user) => {
        if (user.name == member.name) {
          user.selected = true;
        }
      })
    })
    this.updateParticipants();
  };

  updateParticipants() {
    let updatedUsers = this.currentChannel.allUsers;
    this.firestore.updateChannelUsers(updatedUsers, this.channelId);
    this.selectedList = [];
    this.addPartecipantsIds();
    this.memberServ.addSpecificPerson = false;
  }

  addPartecipantsIds() {
    this.currentChannel.partecipantsIds.forEach(id => {
      this.firestore.updatePartecipantsIds(id, this.channelId)
    })
  }

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
