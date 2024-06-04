import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardService } from '../board.service';
import { FirestoreService } from '../../shared/services/firestore-service/firestore.service';
import { Channel } from '../../shared/models/channel.class';
import { FormsModule, NgForm } from '@angular/forms';
import { SignupService } from '../../shared/services/signup/signup.service';
import { MemberDialogsService } from '../../shared/services/member-dialogs.service/member-dialogs.service';

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

  channel: Channel = new Channel();

  constructor() {
    console.log(this.firestore.allChannels);
  }

  async onSubmit(ngForm: NgForm, event: Event) {
    this.shapeChannel();
    if (ngForm.valid && ngForm.submitted) {
      await this.firestore.addChannel(this.channel.toJSON())
        .then((res) => {
          this.boardServ.idx = this.getNewChannelIndex()
        });
      ngForm.resetForm();
      this.memberServ.openAddMembersDialog(event);
      this.boardServ.closeDialogAddChannel();
    }
  }

  getNewChannelIndex() {
    let allChannels = this.firestore.allChannels;
    let isChannel = (channel: Channel) => channel.id == this.firestore.newChannelId
    let index = allChannels.findIndex(isChannel);
    return index
  }

  shapeChannel() {
    this.channel.creatorId = this.signUpServ.currentUser.uid; // take the id of the logged-in user that a new channel creates
    this.channel.creatorName = this.signUpServ.currentUser.displayName;
    this.channel.allUsers = [];
    this.channel.partecipantsIds = [];
    this.channel.partecipantsIds.push(this.signUpServ.currentUser.uid);
    this.firestore.userList.forEach((user) => {
      this.channel.allUsers.push(user)
    })
  }
}

