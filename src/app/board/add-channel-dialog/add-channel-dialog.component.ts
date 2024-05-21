import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardService } from '../board.service';
import { FirestoreService } from '../../shared/services/firestore-service/firestore.service';
import { Channel } from '../../shared/models/channel.class';
import { FormsModule, NgForm } from '@angular/forms';
import { SignupService } from '../../shared/services/signup/signup.service';

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
  signUpServ = inject(SignupService)

  channel: Channel = new Channel();

  constructor() { }

  onSubmit(ngForm: NgForm) {
    this.channel.creator = this.signUpServ.currentUser.uid; // take the id of the logged-in user that a new channel creates
    if (ngForm.valid && ngForm.submitted) {
      this.firestore.addChannel(this.channel.toJSON());
    }
  }

}
