import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { BoardService } from '../../board.service';
import { FirestoreService } from '../../../shared/services/firestore-service/firestore.service';
import { CurrentUser } from '../../../shared/interfaces/currentUser.interface';

@Component({
  selector: 'app-add-specific-person-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './add-specific-person-dialog.component.html',
  styleUrl: './add-specific-person-dialog.component.scss'
})
export class AddSpecificPersonDialogComponent {
  boardServ = inject(BoardService);
  firestore = inject(FirestoreService);
  title!: string;
  userList;

  constructor() {
    this.title = this.firestore.allChannels[this.boardServ.idx].title;
    this.userList = this.firestore.userList
    console.log(this.userList);
  }
}
