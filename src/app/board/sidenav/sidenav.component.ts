import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardService } from '../board.service';
import { FirestoreService } from '../../shared/services/firestore-service/firestore.service';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss'
})
export class SidenavComponent {
  boardServ = inject(BoardService);
  firestore = inject(FirestoreService);

  channelHeaderIsClicked: boolean = true;
  directMessHeaderisClicked: boolean = true;
  canTranslateYChannel: boolean = true;
  canTranslateYUserList: boolean = true;

  onHeaderClick() {
    if (!this.channelHeaderIsClicked) {
      this.channelHeaderIsClicked = true;
      setTimeout(() => {
        this.canTranslateYChannel = true;
      }, 30)
    } else if (this.channelHeaderIsClicked) {
      this.canTranslateYChannel = false;
      setTimeout(() => {
        this.channelHeaderIsClicked = false;
      }, 50)
    }
  }

  onDirectMessageClick() {
    if (!this.directMessHeaderisClicked) {
      this.directMessHeaderisClicked = true;
      setTimeout(() => {
        this.canTranslateYUserList = true;
      }, 30)
    } else {
      this.canTranslateYUserList = false;
      setTimeout(() => {
        this.directMessHeaderisClicked = false;
      }, 50)
    }
  }

  toggleNewMessageInput(event: Event) {
    this.boardServ.stopPropagation(event)
    this.boardServ.newMessageInputOpen = !this.boardServ.newMessageInputOpen;
  }

}
