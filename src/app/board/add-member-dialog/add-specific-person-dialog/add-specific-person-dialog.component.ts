import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { BoardService } from '../../../shared/services/board-service/board.service';
import { FirestoreService } from '../../../shared/services/firestore-service/firestore.service';
import { FormsModule } from '@angular/forms';
import { Channel } from '../../../shared/interfaces/channel.interface';
import { UserProfile } from '../../../shared/interfaces/user.interface';
import { SelectedMembersFullListComponent } from './selected-members-full-list/selected-members-full-list.component';
import { SuggestedListComponent } from './suggested-list/suggested-list.component';
import { FirstTwoSelectedMembersComponent } from './first-two-selected-members/first-two-selected-members.component';
import { MemberDialogsService } from '../../../shared/services/member-dialogs.service/member-dialogs.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-add-specific-person-dialog',
  imports: [
    CommonModule,
    FormsModule,
    SelectedMembersFullListComponent,
    SuggestedListComponent,
    FirstTwoSelectedMembersComponent,
  ],
  templateUrl: './add-specific-person-dialog.component.html',
  styleUrl: './add-specific-person-dialog.component.scss',
})
export class AddSpecificPersonDialogComponent implements OnInit {
  boardServ = inject(BoardService);
  firestore = inject(FirestoreService);
  memberServ = inject(MemberDialogsService);

  title!: string;
  currentChannel!: Channel;
  channelId!: string;
  selectedMember: any;
  showSuggestedList: boolean = false;
  searchValue!: string;
  showAllSelectedMembers: boolean = false;
  placeholder: string = 'Name eingeben';
  userList: UserProfile[] = [];
  filteredUsersList: UserProfile[] = [];
  selectedList: UserProfile[] = [];
  currentWindowWidth!: number;

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.currentWindowWidth = event.target.innerWidth;
  }

  constructor() {
    this.currentChannel = this.firestore.allChannels()[this.boardServ.idx];
    this.channelId = this.currentChannel.id!;
    this.title = this.currentChannel.title;
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers() {
    const memberIdSet = new Set(this.currentChannel.memberIds);
    this.userList = this.firestore.userList().filter(u => !memberIdSet.has(u.id!));
  }

  getFirstTwoMembers() {
    return this.selectedList.slice(0, 2);
  }

  async addNewMembersToChannel() {
    for (const member of this.selectedList) {
      if (member.id) {
        await this.firestore.addMember(this.channelId, member.id);
      }
    }
    this.selectedList = [];
    this.closeTheAddMembersDialogs();
  }

  closeTheAddMembersDialogs() {
    this.memberServ.addSpecificPerson = false;
    setTimeout(() => {
      this.memberServ.addMemberDialogIsOpen = false;
    });
  }

  filterMembers(text: string) {
    if (!text) {
      this.showSuggestedList = false;
    } else {
      const memberIdSet = new Set(this.currentChannel.memberIds);
      this.filteredUsersList = this.userList.filter(
        ul => ul.name.toLowerCase().includes(text.toLowerCase()) && !memberIdSet.has(ul.id!)
      );
      if (this.filteredUsersList.length > 0) {
        this.showSuggestedList = true;
      } else {
        this.showSuggestedList = false;
      }
    }
  }

  addMemberToSelectedList(index: number) {
    this.selectedMember = this.filteredUsersList[index];
    this.selectedList.push(this.selectedMember);
    this.searchValue = '';
  }

  removeMemberFromSelectedList(index: number) {
    this.selectedList.splice(index, 1);
  }

  showSelectedMembersFullList() {
    this.showAllSelectedMembers = true;
  }

  hideSelectedMembersFullList() {
    this.showAllSelectedMembers = false;
  }

  hidePlaceholder() {
    this.placeholder = '';
  }

  showPlaceholder() {
    this.placeholder = 'Name eingeben';
  }
}
