import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardService } from '../board.service';
import { FirestoreService } from '../../shared/services/firestore-service/firestore.service';
import { Channel } from '../../shared/models/channel.class';
import { FormsModule } from '@angular/forms';

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

  channel: Channel = new Channel();

  constructor(){

  }

  createChannel(){
    console.log("The new channel is", this.channel);
  }
  
}
