import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, HostListener, Input, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CurrentUser } from '../../../shared/interfaces/currentUser.interface';
import { Channel } from '../../../shared/models/channel.class';
import { MemberDialogsService } from '../../../shared/services/member-dialogs.service/member-dialogs.service';
import { BoardService } from '../../board.service';
import { FirestoreService } from '../../../shared/services/firestore-service/firestore.service';



@Component({
  selector: 'app-new-message',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './new-message.component.html',
  styleUrl: './new-message.component.scss'
})
export class NewMessageComponent implements AfterViewInit{
  @Input() users!: CurrentUser[];
  @Input() channels!: Channel [];

  memberServ = inject(MemberDialogsService);
  boardServ = inject(BoardService);
  firestoreServ = inject(FirestoreService); 

  tagMember = false;
  tagChannel = false;
  searchInput: string = '';
  filteredUsers: CurrentUser[] = [];
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

  @HostListener('keyup', ['$event'])
  handleKeyup() {
    if (this.tagMember) {
      this.filterResults(this.users);
    }
    if (this.tagChannel) {
      this.filterResults(this.channels)
    }
    if (this.searchInput.length == 0) {
      this.tagMember = false;
      this.tagChannel = false;
    }
  }

  ngAfterViewInit(): void {
    this.filteredUsers = this.users;
    this.filteredChannels = this.channels;
  }

  filterResults(target:CurrentUser [] | Channel []) {
    let lowerCaseTag = this.searchInput.slice(1).toLowerCase();
    if (target == this.users) {
      this.filteredUsers = target.filter(res => res.name.toLowerCase().includes(lowerCaseTag));
    } 
    if (target == this.channels) {
      this.filteredChannels = target.filter(res => res.title.toLowerCase().includes(lowerCaseTag))
    }
  }

  openMessage(index: number, event: Event) {
    let user = this.filteredUsers[index];
    this.memberServ.currentMember = user;
    this.memberServ.setChatRoom(event);
  }

  openChannel(index: number, event: Event) {
    let channel = this.filteredChannels[index];
    let channelIdx = this.getIndexInChannels(channel);
    this.boardServ.showChannelInChatField(channelIdx, event)
  }


  getIndexInChannels(channel: Channel) {
    let foundChannel = (c:Channel) => c.id == channel.id
    let idx = this.firestoreServ.allChannels.findIndex(foundChannel);
    return idx
  }

}
