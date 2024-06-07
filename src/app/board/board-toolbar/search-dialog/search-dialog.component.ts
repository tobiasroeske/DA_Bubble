import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BoardService } from '../../board.service';
import { FirestoreService } from '../../../shared/services/firestore-service/firestore.service';
import { MemberDialogsService } from '../../../shared/services/member-dialogs.service/member-dialogs.service';
import { PrivateChat } from '../../../shared/models/privateChat.class';
import { Channel } from '../../../shared/models/channel.class';
import { User } from '../../../shared/models/user.class';
import { CurrentUser } from '../../../shared/interfaces/currentUser.interface';
import { ChatMessage } from '../../../shared/interfaces/chatMessage.interface';

type SearchItem = CurrentUser | PrivateChat | Channel | ChatMessage;

@Component({
  selector: 'app-search-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './search-dialog.component.html',
  styleUrl: './search-dialog.component.scss'
})
export class SearchDialogComponent implements OnChanges {
  boardServ = inject(BoardService);
  firestore = inject(FirestoreService);
  memberServ = inject(MemberDialogsService);
  mainSearchList: any[] = [];


  @Input() searchValue: string = "";

  constructor() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['searchValue']) {
      this.mainSearchList = this.boardServ.allData.filter((ad: SearchItem) => {
        if (this.isCurrentUser(ad)) {
          console.log('Current User', ad.name);
          return ad.name.toLowerCase().includes(this.searchValue);
        } else if (this.isChannel(ad)) {
          console.log('Current Channel', ad.title);
          return ad.title.toLowerCase().includes(this.searchValue);
        // } else if (this.isPrivateChat(ad)) {
        //   ad.chat.forEach(message => {
        //       return message.message.toLowerCase().includes(this.searchValue);
        //   })
        } else {
          return false;
        }
      })
    }
  }

  isCurrentUser(item: SearchItem): item is CurrentUser {
    return item.type == 'CurrentUser';
  }

  isChannel(item: SearchItem): item is Channel {
    return item.type == 'Channel';
  }

  isPrivateChat(item: SearchItem): item is PrivateChat {
    return item.type == 'PrivateChat';
  }

  isChatMessage(item: SearchItem): item is ChatMessage {
    return item.type == 'ChatMessage'
  }
}

