import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardService } from '../board.service';
import { FirestoreService } from '../../shared/services/firestore-service/firestore.service';
import { FormsModule } from '@angular/forms';
import { SignupService } from '../../shared/services/signup/signup.service';
import { Channel } from '../../shared/models/channel.class';
import { CurrentUser } from '../../shared/interfaces/currentUser.interface';
import { MembersDialogComponent } from '../members-dialog/members-dialog.component';
import { MemberDialogsService } from '../../shared/services/member-dialogs.service/member-dialogs.service';
import { AddSpecificPersonDialogComponent } from '../add-member-dialog/add-specific-person-dialog/add-specific-person-dialog.component';
import { AddSpecificPersonDialogMobileComponent } from '../add-member-dialog/add-specific-person-dialog-mobile/add-specific-person-dialog-mobile.component';
@Component({
  selector: 'app-edit-channel-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MembersDialogComponent, AddSpecificPersonDialogComponent, AddSpecificPersonDialogMobileComponent],
  templateUrl: './edit-channel-dialog.component.html',
  styleUrl: './edit-channel-dialog.component.scss'
})
export class EditChannelDialogComponent {
  boardServ = inject(BoardService);
  firestore = inject(FirestoreService);
  memberServ = inject(MemberDialogsService);
  signUpServ = inject(SignupService);

  editName: string = "Bearbeiten";
  editDesc: string = "Bearbeiten"
  inputDisabled: boolean = true;
  textareaDisabled: boolean = true;
  editNameBtnClicked: boolean = false;
  editDescriptionBtnClicked: boolean = false;
  currentChannel: any;
  title: string;
  description: string;
  creatorName: string;
  channelAlreadyExist?: boolean;
  leaveFromChannel: boolean = false;
  allChannelLength!: number;
  randomIndex!: number;

  constructor() {
    this.currentChannel = this.firestore.allChannels[this.boardServ.idx];
    this.title = this.firestore.allChannels[this.boardServ.idx].title;
    this.description = this.firestore.allChannels[this.boardServ.idx].description;
    this.creatorName = this.firestore.allChannels[this.boardServ.idx].creatorName;
  }

  async onEditButtonClick(event: Event) {
    if (!this.editNameBtnClicked) {
      this.editNameBtnClicked = true;
      this.editName = "Speichern"
      this.inputDisabled = false;
    } else {
      await this.onChannelUpdate(event);
      this.editNameBtnClicked = false;
      this.editName = "Bearbeiten";
      this.inputDisabled = true;
    }
  }

  async onDescriptionButtonClick(event: Event) {
    if (!this.editDescriptionBtnClicked) {
      this.editDescriptionBtnClicked = true;
      this.editDesc = "Speichern";
      this.textareaDisabled = false;
    } else {
      await this.onChannelUpdate(event);
      this.editDescriptionBtnClicked = false;
      this.editDesc = "Bearbeiten";
      this.textareaDisabled = true;
    }
  }

  async onChannelUpdate(event: Event) {
    if (this.leaveFromChannel) {
      await this.updateChannelOnLeave(event);
    } else {
      await this.updateChannelWithNewData();
    }
  }

  async updateChannelOnLeave(event: Event) {
    let channel: Channel = new Channel(this.currentChannel);
    await this.firestore.updateChannel(channel.toJSON(), this.currentChannel.id);
    this.leaveFromChannel = false;
    this.randomIndex = Math.floor(Math.random() * this.firestore.allChannels.length);
    this.boardServ.showChannelInChatField(this.randomIndex, event);
    this.boardServ.toggleDialogEditChannel(this.boardServ.idx);
  }

  async updateChannelWithNewData() {
    if (this.checkIfThisChannelAlreadyExist() === -1) {
      await this.updateChannelWithNewTitleAndDescription();
    } else {
      this.channelAlreadyExist = true;
    }
  }

  async updateChannelWithNewTitleAndDescription() {
    this.currentChannel.title = this.title;
    this.currentChannel.description = this.description;
    let channel: Channel = new Channel(this.currentChannel);
    await this.firestore.updateChannel(channel.toJSON(), this.currentChannel.id);
    if (this.channelAlreadyExist) {
      this.channelAlreadyExist = false;
    }
  }

  async leaveThisChannel(event: Event) {
    this.currentChannel = this.firestore.allChannels[this.boardServ.idx];
    let idxOfCurrentPartecipant = this.currentChannel.partecipantsIds.indexOf(this.boardServ.currentUser.id);
    this.currentChannel.partecipantsIds.splice(idxOfCurrentPartecipant, 1);
    let indexOfCurrentMember = this.currentChannel.members.findIndex((m: CurrentUser) => m.id == this.boardServ.currentUser.id);
    this.currentChannel.members.splice(indexOfCurrentMember, 1);
    let indexInAllUsers = this.currentChannel.allUsers.findIndex((u: CurrentUser) => u.id == this.boardServ.currentUser.id);
    this.currentChannel.allUsers[indexInAllUsers].selected = false;
    this.leaveFromChannel = true;
    await this.onChannelUpdate(event);
  }

  checkIfThisChannelAlreadyExist(): number {
    let idx = this.firestore.allChannels.findIndex((chan: Channel) => chan.title === this.title);
    return idx;
  }
}

