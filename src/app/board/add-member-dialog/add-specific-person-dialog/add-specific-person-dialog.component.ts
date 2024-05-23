import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { BoardService } from '../../board.service';
import { FirestoreService } from '../../../shared/services/firestore-service/firestore.service';
import { FormsModule } from '@angular/forms';
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
  selectedMember: any;
  showSuggestedList: boolean = false;
  searchValue!: string;

  constructor() {
    this.title = this.firestore.allChannels[this.boardServ.idx].title;
    this.userList = this.firestore.userList;
    this.filteredUsersList = this.userList;
    console.log(this.userList);
  }

  filterMembers(text: string) {
    if (!text) {
      this.filteredUsersList = this.userList;
      this.showSuggestedList = false;
    } else {
      this.filteredUsersList = this.userList.filter(ul => ul.name.toLowerCase().includes(text.toLowerCase()));
      this.showSuggestedList = true;
    }
  }

  addMemberToSelectedList(index: number) {
    this.selectedMember = this.filteredUsersList[index];
    let idx = this.selectedList.indexOf(this.selectedMember);
    if (idx == -1) {
      this.selectedList.push(this.selectedMember);
      this.searchValue = "";
    }
  }
}
