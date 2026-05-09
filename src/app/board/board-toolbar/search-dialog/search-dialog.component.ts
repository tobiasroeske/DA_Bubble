import {
  Component,
  EventEmitter,
  inject,
  Output,
  OnChanges,
  SimpleChanges,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { BoardService } from '../../../shared/services/board-service/board.service';
import { FirestoreService } from '../../../shared/services/firestore-service/firestore.service';
import { MemberDialogsService } from '../../../shared/services/member-dialogs.service/member-dialogs.service';
import { UserProfile } from '../../../shared/interfaces/user.interface';
import { Channel } from '../../../shared/interfaces/channel.interface';
import { DirectMessage } from '../../../shared/interfaces/direct-message.interface';

type SearchItem = UserProfile | Channel | DirectMessage;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-search-dialog',
  imports: [],
  templateUrl: './search-dialog.component.html',
  styleUrl: './search-dialog.component.scss',
})
export class SearchDialogComponent implements OnChanges {
  readonly searchValue = input.required<string>();
  @Output() sendEmptyString: EventEmitter<string> = new EventEmitter<string>();

  boardServ = inject(BoardService);
  firestore = inject(FirestoreService);
  memberServ = inject(MemberDialogsService);

  mainSearchList: any[] = [];

  showSearchElementClicked(index: number, event: Event) {
    const clickedElement = this.mainSearchList[index];
    if (this.isChannel(clickedElement)) {
      this.showTheClickedElementOfTypeChannel(clickedElement, event);
    } else if (this.isUser(clickedElement)) {
      this.showTheClickedElementOfTypeUser(clickedElement);
    } else if (this.isDirectMessage(clickedElement)) {
      this.showTheClickedElementOfTypeDirectMessage(clickedElement, event);
    }
    this.boardServ.showSearchDialog.set(false);
  }

  showTheClickedElementOfTypeChannel(clickedElement: Channel, event: Event) {
    const idx = this.firestore.allChannels().findIndex(chann => chann.id === clickedElement.id);
    this.boardServ.showChannelInChatField(idx, event);
  }

  showTheClickedElementOfTypeUser(clickedElement: UserProfile) {
    const idx = this.firestore.userList().findIndex(user => user.id === clickedElement.id);
    this.boardServ.openShowUserPopUp(idx);
    this.boardServ.showUserPopUp.set(true);
  }

  async showTheClickedElementOfTypeDirectMessage(clickedElement: DirectMessage, event: Event) {
    const idx = this.firestore.directMessages().findIndex(dm => dm.id === clickedElement.id);
    if (idx !== -1) {
      this.boardServ.startPrivateChat(idx, undefined, event);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    setTimeout(() => {
      this.handleSearchChanges(changes);
    }, 100);
  }

  handleSearchChanges(changes: SimpleChanges): void {
    if (changes['searchValue'] && this.searchValue().length > 0) {
      this.showSearchDialogAndFilterItems();
    } else {
      this.hideSearchDialog();
    }
  }

  showSearchDialogAndFilterItems(): void {
    this.boardServ.showSearchDialog.set(true);
    this.mainSearchList = this.filterSearchItems();
  }

  filterSearchItems(): SearchItem[] {
    const query = this.searchValue().toLowerCase();
    const results: SearchItem[] = [];

    this.firestore.allChannels().forEach(channel => {
      if (channel.title.toLowerCase().includes(query)) {
        results.push(channel);
      }
    });

    this.firestore.userList().forEach(user => {
      if (user.name.toLowerCase().includes(query)) {
        results.push(user);
      }
    });

    this.firestore.directMessages().forEach(dm => {
      const messages = this.firestore.dmMessages();
      const hasMatch = messages.some(msg => msg.text.toLowerCase().includes(query));
      if (hasMatch) {
        results.push(dm);
      }
    });

    return results;
  }

  hideSearchDialog(): void {
    this.boardServ.showSearchDialog.set(false);
  }

  isChannel(item: SearchItem): item is Channel {
    return 'title' in item && 'memberIds' in item;
  }

  isUser(item: SearchItem): item is UserProfile {
    return 'name' in item && 'avatarPath' in item && 'loginState' in item;
  }

  isDirectMessage(item: SearchItem): item is DirectMessage {
    return 'participantIds' in item;
  }

  getPartnerForDm(dm: DirectMessage): UserProfile | undefined {
    const partnerId = dm.participantIds.find(id => id !== this.boardServ.currentUser.id);
    return this.firestore.userList().find(u => u.id === partnerId);
  }
}
