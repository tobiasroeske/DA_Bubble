import {
  AfterViewInit,
  Component,
  HostListener,
  OnInit,
  inject,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UserProfile } from '../../../shared/interfaces/user.interface';
import { Channel } from '../../../shared/interfaces/channel.interface';
import { MemberDialogsService } from '../../../shared/services/member-dialogs.service/member-dialogs.service';
import { BoardService } from '../../../shared/services/board-service/board.service';
import { FirestoreService } from '../../../shared/services/firestore-service/firestore.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-new-message',
  imports: [FormsModule],
  templateUrl: './new-message.component.html',
  styleUrl: './new-message.component.scss',
})
export class NewMessageComponent implements AfterViewInit {
  readonly users = input.required<UserProfile[]>();
  readonly channels = input.required<Channel[]>();

  memberServ = inject(MemberDialogsService);
  boardServ = inject(BoardService);
  firestoreServ = inject(FirestoreService);

  tagMember = false;
  tagChannel = false;
  searchInput: string = '';
  filteredUsers: UserProfile[] = [];
  filteredChannels: Channel[] = [];

  @HostListener('keydown', ['$event'])
  handleKeydown(event: KeyboardEvent) {
    if (event.key == '@') {
      this.tagMember = true;
    }
    if (event.key == '#') {
      this.tagChannel = true;
    }
  }

  @HostListener('keyup')
  handleKeyup() {
    if (this.tagMember) {
      this.filterResults(this.users());
    }
    if (this.tagChannel) {
      this.filterResults(this.channels());
    }
    if (this.searchInput.length == 0) {
      this.tagMember = false;
      this.tagChannel = false;
    }
  }

  ngAfterViewInit(): void {
    this.filteredUsers = this.users();
    this.filteredChannels = this.channels();
  }

  filterResults(target: UserProfile[] | Channel[]) {
    const lowerCaseTag = this.searchInput.slice(1).toLowerCase();
    if (target == this.users()) {
      this.filteredUsers = target.filter(res => res.name.toLowerCase().includes(lowerCaseTag));
    }
    if (target == this.channels()) {
      this.filteredChannels = target.filter(res => res.title.toLowerCase().includes(lowerCaseTag));
    }
  }

  async openMessage(index: number, event: Event) {
    const user = this.filteredUsers[index];
    this.memberServ.currentMember = user;
    await this.memberServ.setChatRoom(event);
  }

  openChannel(index: number, event: Event) {
    const channel = this.filteredChannels[index];
    const channelIdx = this.getIndexInChannels(channel);
    this.boardServ.showChannelInChatField(channelIdx, event);
  }

  getIndexInChannels(channel: Channel) {
    const foundChannel = (c: Channel) => c.id == channel.id;
    const idx = this.firestoreServ.allChannels().findIndex(foundChannel);
    return idx;
  }
}
