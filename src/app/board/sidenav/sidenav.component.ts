import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardService } from '../board.service';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.scss'
})
export class SidenavComponent {
  boardServ = inject(BoardService);
  channels: string[] = ['Entwickerteam', 'Office Team'];

  channelHeaderIsClicked: boolean = false;
  directMessHeaderisClicked: boolean = false;
  canTranslateYChannel: boolean = false;
  canTranslateYUserList: boolean = false;

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

}
