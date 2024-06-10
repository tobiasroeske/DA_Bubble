import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output, OnChanges, SimpleChanges } from '@angular/core';
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
  chatArray: ChatMessage[] = [];
  idxToFindPositionOfGuestInDirectMessArray!: number;
  idxToFindPositionOfClickedMessageInTheChoisedPrivChat!: number;
  @Input() searchValue!:string;
  @Output() sendEmptyString: EventEmitter<string> = new EventEmitter<string>();

  constructor() {
  }

  async showSearchElementClicked(index: number, event: Event) {
    let clickedElement = this.mainSearchList[index];
    if (clickedElement.type == 'Channel') {
      this.showTheClickedElementOfTypeChannel(clickedElement, event);
    } else if (clickedElement.type == 'CurrentUser') {
      this.showTheClickedElementOfTypeCurrentUser(clickedElement);
    } else if (clickedElement.type == 'PrivateChat') {
      await this.showTheClickedElementOfTypePrivatChat(clickedElement, event)
    }
    this.boardServ.showSearchDialog = false;
  }

  showTheClickedElementOfTypeChannel(clickedElement: Channel, event: Event) {
    let idx = this.firestore.allChannels.findIndex(chann => chann.id == clickedElement.id);
    this.boardServ.showChannelInChatField(idx, event);
  }

  showTheClickedElementOfTypeCurrentUser(clickedElement: CurrentUser) {
    let idx = this.firestore.userList.findIndex((user) => user.id == clickedElement.id);
    this.boardServ.openShowUserPopUp(idx);
    this.boardServ.showUserPopUp = true;
  }

  async showTheClickedElementOfTypePrivatChat(clickedElement: PrivateChat, event: Event) {
    this.idxToFindPositionOfGuestInDirectMessArray = this.firestore.directMessages.findIndex(privChat => privChat.guest.id == clickedElement.guest.id)
    this.boardServ.selectedChatRoom = this.firestore.directMessages[this.idxToFindPositionOfGuestInDirectMessArray];
    this.memberServ.currentMember = this.boardServ.selectedChatRoom.guest;
    await this.memberServ.setChatRoom(event);
    this.idxToFindPositionOfClickedMessageInTheChoisedPrivChat = this.boardServ.selectedChatRoom.chat.findIndex(chat => chat.message && chat.message.includes(this.searchValue));
    if (this.idxToFindPositionOfClickedMessageInTheChoisedPrivChat !== -1) {
      this.boardServ.scrollToSearchedMessage(this.idxToFindPositionOfClickedMessageInTheChoisedPrivChat);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['searchValue'] && this.searchValue.length > 0) {
      this.boardServ.showSearchDialog = true;
      this.mainSearchList = this.boardServ.allData.filter((ad: SearchItem) => {
        if (this.isCurrentUser(ad)) {
          return ad.name.toLowerCase().includes(this.searchValue.toLowerCase());
        } else if (this.isChannel(ad)) {
          return ad.title.toLowerCase().includes(this.searchValue.toLowerCase());
        } else if (this.isPrivateChat(ad)) {
          console.log('Current Chat', ad.chat);
          return ad.chat.some((chat) => chat.message.toLowerCase().includes(this.searchValue.toLowerCase()))
        } else {
          return false;
        }
      })
    } else {
      this.boardServ.showSearchDialog = false;
    }
    console.log(this.boardServ.allData);
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

