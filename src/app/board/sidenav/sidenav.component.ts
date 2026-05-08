import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardService } from '../../shared/services/board-service/board.service';
import { FirestoreService } from '../../shared/services/firestore-service/firestore.service';
import { SearchDialogComponent } from "../board-toolbar/search-dialog/search-dialog.component";
import { FormsModule } from '@angular/forms';
import { TIMINGS } from '../../shared/constants/timings';

@Component({
    selector: 'app-sidenav',
    templateUrl: './sidenav.component.html',
    styleUrl: './sidenav.component.scss',
    imports: [CommonModule, SearchDialogComponent, FormsModule]
})

export class SidenavComponent {
  boardServ = inject(BoardService);
  firestore = inject(FirestoreService);

  channelHeaderIsClicked: boolean = true;
  directMessHeaderisClicked: boolean = true;
  canTranslateYChannel: boolean = true;
  canTranslateYUserList: boolean = true;
  searchText: string = "";

  onHeaderClick() {
    if (!this.channelHeaderIsClicked) {
      this.channelHeaderIsClicked = true;
      setTimeout(() => {
        this.canTranslateYChannel = true;
      }, TIMINGS.SECTION_EXPAND_DELAY);
    } else if (this.channelHeaderIsClicked) {
      this.canTranslateYChannel = false;
      setTimeout(() => {
        this.channelHeaderIsClicked = false;
      }, TIMINGS.SECTION_COLLAPSE_DELAY);
    }
  }

  onDirectMessageClick() {
    if (!this.directMessHeaderisClicked) {
      this.directMessHeaderisClicked = true;
      setTimeout(() => {
        this.canTranslateYUserList = true;
      }, TIMINGS.SECTION_EXPAND_DELAY);
    } else {
      this.canTranslateYUserList = false;
      setTimeout(() => {
        this.directMessHeaderisClicked = false;
      }, TIMINGS.SECTION_COLLAPSE_DELAY);
    }
  }

  toggleNewMessageInput(event: Event) {
    this.boardServ.stopPropagation(event)
    this.boardServ.newMessageInputOpen.update(v => !v);
    if (this.boardServ.mobileView()) {
      this.boardServ.sidenavTranslate.set(false);
      this.boardServ.hideText();
    }
  }

}
