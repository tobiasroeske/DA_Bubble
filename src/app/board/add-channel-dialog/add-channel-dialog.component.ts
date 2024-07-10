import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardService } from '../../shared/services/board.service';
import { FirestoreService } from '../../shared/services/firestore-service/firestore.service';
import { Channel } from '../../shared/models/channel.class';
import { FormsModule, NgForm } from '@angular/forms';
import { SignupService } from '../../shared/services/signup/signup.service';
import { MemberDialogsService } from '../../shared/services/member-dialogs.service/member-dialogs.service';
import { LocalStorageService } from '../../shared/services/local-storage-service/local-storage.service';

@Component({
  selector: 'app-add-channel-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-channel-dialog.component.html',
  styleUrl: './add-channel-dialog.component.scss'
})
export class AddChannelDialogComponent {
  boardServ = inject(BoardService);
  firestore = inject(FirestoreService);
  signUpServ = inject(SignupService);
  memberServ = inject(MemberDialogsService);
  localStorageService = inject(LocalStorageService);

  channelAlreadyExist: boolean = false;
  existingChannelIndex?: number;
  channel: Channel = new Channel();

  async onSubmit(ngForm: NgForm, event: Event) {
    await this.shapeChannel();
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
      await this.firestore.addChannel(this.channel.toJSON())
      this.boardServ.idx = this.getNewChannelIndex()
      this.localStorageService.saveCurrentChannelIndex(this.getNewChannelIndex());
      ngForm.resetForm();
    } catch (error) {
      console.error('Error adding channel', error)
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
    let idx = this.firestore.allExistingChannels.findIndex((chan) => chan.title === this.channel.title);
    this.existingChannelIndex = idx;
  }

  getNewChannelIndex() {
    let allChannels = this.firestore.allChannels;
    let isChannel = (channel: Channel) => channel.id == this.firestore.newChannelId
    let index = allChannels.findIndex(isChannel);
    return index
  }

  async shapeChannel() {
    this.setCreatorInfo();
    this.initializeChannel();
    await this.populateAllUsers();
  }

  setCreatorInfo(): void {
    let currentUser = this.localStorageService.loadCurrentUser();
    this.channel.creatorId = currentUser.id
    this.channel.creatorName = currentUser.name;
  }

  initializeChannel(): void {
    this.channel.allUsers = [];
    this.channel.partecipantsIds = [this.channel.creatorId];
    this.channel.members = [];
  }

  async populateAllUsers(): Promise<void> {
    for (const user of this.firestore.userList) {
      if (user.id === this.channel.creatorId) {
        user.selected = true;
        this.channel.members.push(user);
      }
      this.channel.allUsers.push(user);
    }
  }
}

