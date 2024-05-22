import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardService } from '../board.service';
import { FirestoreService } from '../../shared/services/firestore-service/firestore.service';
import { FormsModule } from '@angular/forms';
import { SignupService } from '../../shared/services/signup/signup.service';
import { Channel } from '../../shared/models/channel.class';


@Component({
  selector: 'app-edit-channel-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-channel-dialog.component.html',
  styleUrl: './edit-channel-dialog.component.scss'
})
export class EditChannelDialogComponent {

  boardServ = inject(BoardService);
  firestore = inject(FirestoreService);
  signUpServ = inject(SignupService);

  editName: string = "Bearbeiten";
  editDesc: string = "Bearbeiten"
  inputDisabled:boolean = true;
  textareaDisabled:boolean = true;
  editNameBtnClicked: boolean = false;
  editDescriptionBtnClicked: boolean = false;
  currentChannel: any;
  title: string;
  description: string;
  creatorName: string;

  constructor() {
    this.currentChannel = this.firestore.allChannels[this.boardServ.idx];
    this.title = this.firestore.allChannels[this.boardServ.idx].title;
    this.description = this.firestore.allChannels[this.boardServ.idx].description;
    this.creatorName = this.firestore.allChannels[this.boardServ.idx].creatorName;
  }

  async onEditButtonClick() {
    if (!this.editNameBtnClicked) {
      this.editNameBtnClicked = true;
      this.editName = "Speichern"
      this.inputDisabled = false;
    } else {
      await this.onChannelUpdate();
      this.editNameBtnClicked = false;
      this.editName = "Bearbeiten";
      this.inputDisabled = true;
    }
  }

  async onDescriptionButtonClick() {
    if (!this.editDescriptionBtnClicked) {
      this.editDescriptionBtnClicked = true;
      this.editDesc = "Speichern";
      this.textareaDisabled = false;
    } else {
      await this.onChannelUpdate();
      this.editDescriptionBtnClicked = false;
      this.editDesc = "Bearbeiten";
      this.textareaDisabled = true;
    }
  }

  async onChannelUpdate() {
    this.currentChannel.title = this.title;
    this.currentChannel.description = this.description;
    let channel: Channel = new Channel(this.currentChannel);
    await this.firestore.updateChannel(channel.toJSON(), this.currentChannel.id);
  }
}

