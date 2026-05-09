import { CommonModule } from '@angular/common';
import { Component, inject, input, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BoardService } from '../../shared/services/board-service/board.service';
import { AddSpecificPersonDialogComponent } from './add-specific-person-dialog/add-specific-person-dialog.component';
import { MemberDialogsService } from '../../shared/services/member-dialogs.service/member-dialogs.service';
import { FirestoreService } from '../../shared/services/firestore-service/firestore.service';
import { Channel } from '../../shared/interfaces/channel.interface';
import { UserProfile } from '../../shared/interfaces/user.interface';
import { AddSpecificPersonDialogMobileComponent } from './add-specific-person-dialog-mobile/add-specific-person-dialog-mobile.component';
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-add-member-dialog',
  imports: [
    CommonModule,
    FormsModule,
    AddSpecificPersonDialogComponent,
    AddSpecificPersonDialogMobileComponent,
  ],
  templateUrl: './add-member-dialog.component.html',
  styleUrl: './add-member-dialog.component.scss',
})
export class AddMemberDialogComponent {
  readonly currentChannel = input.required<Channel>();
  readonly currentChannelId = input.required<string>();

  memberServ = inject(MemberDialogsService);
  boardServ = inject(BoardService);
  firestore = inject(FirestoreService);

  specificMember: boolean = false;
  allMembers: boolean = false;

  onCheck(condition: string) {
    if (condition == 'allMembers') {
      this.allMembers = !this.allMembers;
      this.specificMember = false;
    } else {
      this.specificMember = !this.specificMember;
      this.allMembers = false;
    }
  }

  async setAllUsersOnSelectedTrue(event: Event) {
    const allUsers: UserProfile[] = this.firestore.userList();
    const memberIds = allUsers.map(u => u.id!).filter(id => id != null);
    await this.firestore.updateChannel(this.currentChannelId(), { memberIds });
    this.closeAddMemberDialog(event);
  }

  closeAddMemberDialog(event: Event) {
    this.memberServ.addMemberDialogIsOpen = false;
    this.memberServ.addSpecificPerson = false;
    event.stopPropagation();
  }
}
