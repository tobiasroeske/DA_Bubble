import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardService } from '../board.service';
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
  localStorageService = inject(LocalStorageService)
  channelAlreadyExist: boolean = false;
  existingChannelIndex?: number;

  channel: Channel = new Channel();

  constructor() {
    console.log(this.firestore.allChannels);
  }

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
    await this.firestore.addChannel(this.channel.toJSON())
      .then((res) => {
        this.boardServ.idx = this.getNewChannelIndex()
        this.localStorageService.saveCurrentChannelIndex(this.getNewChannelIndex());
      });
    ngForm.resetForm();
  }

  closeDialogsAndSetTheChannelVariableToFalse(event: Event) {
    this.memberServ.openAddMembersDialog(event);
    this.boardServ.closeDialogAddChannel();
    if (this.channelAlreadyExist) {
      this.channelAlreadyExist = false;
    }
  }

  checkIfChannelTitleAleadyExist() {
    let idx = this.firestore.allChannels.findIndex((chan) => chan.title === this.channel.title);
    this.existingChannelIndex = idx;
  }

  getNewChannelIndex() {
    let allChannels = this.firestore.allChannels;
    let isChannel = (channel: Channel) => channel.id == this.firestore.newChannelId
    let index = allChannels.findIndex(isChannel);
    return index
  }

  async shapeChannel() {
    this.channel.creatorId = this.signUpServ.currentUser.uid; // take the id of the logged-in user that a new channel creates
    this.channel.creatorName = this.signUpServ.currentUser.displayName;
    this.channel.allUsers = [];
    this.channel.partecipantsIds = [];
    this.channel.partecipantsIds.push(this.signUpServ.currentUser.uid);
    this.firestore.userList.forEach((user) => {
      if (user.id == this.channel.creatorId) {
        user.selected = true;
        this.channel.members.push(user)
      }
      this.channel.allUsers.push(user)
    })
  }
}

