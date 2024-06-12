import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { BoardService } from '../board.service';
import { FirestoreService } from '../../shared/services/firestore-service/firestore.service';
import { MemberDialogsService } from '../../shared/services/member-dialogs.service/member-dialogs.service';

@Component({
  selector: 'app-searched-user-pop-up',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './searched-user-pop-up.component.html',
  styleUrl: './searched-user-pop-up.component.scss'
})
export class SearchedUserPopUpComponent {
  boardServ = inject(BoardService);
  firestore = inject(FirestoreService);
  memberServ = inject(MemberDialogsService);

  closeSearchedUserPopUp() {
    this.boardServ.showUserPopUp = false;
  }

  setChatWithSelectedUser(event: Event) {
    this.memberServ.currentMember = this.boardServ.userObjectPopUp;
    this.memberServ.setChatRoom(event);
    this.closeSearchedUserPopUp();
    event.preventDefault();
  }

}
