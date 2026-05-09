import { Component, ChangeDetectionStrategy, inject } from '@angular/core';

import { BoardService } from '../../shared/services/board-service/board.service';
import { FirestoreService } from '../../shared/services/firestore-service/firestore.service';
import { Channel } from '../../shared/interfaces/channel.interface';
import { FormsModule, NgForm } from '@angular/forms';
import { SignupService } from '../../shared/services/signup/signup.service';
import { MemberDialogsService } from '../../shared/services/member-dialogs.service/member-dialogs.service';
import { LocalStorageService } from '../../shared/services/local-storage-service/local-storage.service';

@Component({
  selector: 'app-add-channel-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  templateUrl: './add-channel-dialog.component.html',
  styleUrl: './add-channel-dialog.component.scss',
})
export class AddChannelDialogComponent {
  boardServ = inject(BoardService);
  firestore = inject(FirestoreService);
  signUpServ = inject(SignupService);
  memberServ = inject(MemberDialogsService);
  localStorageService = inject(LocalStorageService);

  channelAlreadyExist: boolean = false;
  existingChannelIndex?: number;
  channelTitle: string = '';
  channelDescription: string = '';

  async onSubmit(ngForm: NgForm, event: Event) {
    if (ngForm.valid && ngForm.submitted) {
      this.checkIfChannelTitleAleadyExist();
      if (this.existingChannelIndex == -1) {
        await this.sendFormDataToDatabase(ngForm);
        this.closeDialogsAndSetTheChannelVariableToFalse(event);
      } else {
        this.channelAlreadyExist = true;
      }
    }
  }

  async sendFormDataToDatabase(ngForm: NgForm) {
    try {
      const currentUser = this.localStorageService.loadCurrentUser();
      const channelData: Omit<Channel, 'id'> = {
        title: this.channelTitle,
        description: this.channelDescription,
        creatorId: currentUser.id!,
        memberIds: [currentUser.id!],
        createdAt: new Date().getTime(),
      };
      await this.firestore.addChannel(channelData);
      this.boardServ.idx = this.getNewChannelIndex();
      this.localStorageService.saveCurrentChannelIndex(this.getNewChannelIndex());
      ngForm.resetForm();
    } catch (error) {
      console.error('Error adding channel', error);
    }
  }

  closeDialogsAndSetTheChannelVariableToFalse(event: Event) {
    this.memberServ.openAddMembersDialog(event);
    this.boardServ.closeDialogAddChannel();
    if (this.channelAlreadyExist) {
      this.channelAlreadyExist = false;
    }
  }

  checkIfChannelTitleAleadyExist() {
    const idx = this.firestore
      .allExistingChannels()
      .findIndex(chan => chan.title === this.channelTitle);
    this.existingChannelIndex = idx;
  }

  getNewChannelIndex() {
    const allChannels = this.firestore.allChannels();
    const index = allChannels.findIndex(channel => channel.id === this.firestore.newChannelId);
    return index;
  }
}
