import { Component, OnInit, inject, input, ChangeDetectionStrategy } from '@angular/core';
import { FirestoreService } from '../../shared/services/firestore-service/firestore.service';
import { BoardService } from '../../shared/services/board-service/board.service';
import { MemberDialogsService } from '../../shared/services/member-dialogs.service/member-dialogs.service';
import { ShowMemberPopUpComponent } from './show-member-pop-up/show-member-pop-up.component';
import { Channel } from '../../shared/interfaces/channel.interface';
import { UserProfile } from '../../shared/interfaces/user.interface';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-members-dialog',
  imports: [ShowMemberPopUpComponent],
  templateUrl: './members-dialog.component.html',
  styleUrl: './members-dialog.component.scss',
})
export class MembersDialogComponent implements OnInit {
  readonly dialog = input<boolean>(false);

  firestore = inject(FirestoreService);
  boardServ = inject(BoardService);
  memberServ = inject(MemberDialogsService);

  currentChannel!: Channel;
  memberUsers: UserProfile[] = [];

  async ngOnInit(): Promise<void> {
    this.currentChannel = this.firestore.allChannels()[this.boardServ.idx];
    this.memberUsers = this.getMemberUsers();
  }

  getMemberUsers(): UserProfile[] {
    return this.currentChannel.memberIds
      .map(id => this.firestore.userList().find(u => u.id === id))
      .filter((u): u is UserProfile => u != null);
  }
}
