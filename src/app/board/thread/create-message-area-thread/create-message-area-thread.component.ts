import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ChatMessage } from '../../../shared/interfaces/chatMessage.interface';
import { FormsModule } from '@angular/forms';
import { Channel } from '../../../shared/models/channel.class';
import { CreateMessageAreaComponent } from '../../create-message-area/create-message-area.component';

@Component({
  selector: 'app-create-message-area-thread',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-message-area-thread.component.html',
  styleUrl: './create-message-area-thread.component.scss'
})
export class CreateMessageAreaThreadComponent extends CreateMessageAreaComponent {
  @Input() currentChatMessage?: ChatMessage;
  @Input() currentChannel?: Channel

  constructor() {
    super();
  }

  override sendMessage(): void {
    console.log(this.currentChatMessage);
      console.log(this.currentChannel);
      console.log(this.boardService.chatMessageIndex);
      
    if (this.textMessage.length > 0) {
      let date = new Date().getTime();
      let newAnswer = this.setMessageObject(date);
      this.currentChatMessage?.answers.push(newAnswer)
      if (this.currentChannel) {
        this.currentChannel.chat!.splice(this.boardService.chatMessageIndex, 1, this.currentChatMessage)
        console.log(this.currentChannel);
        this.firestoreService.updateReactions(this.currentChannel.id!, this.currentChannel.chat!)
        .then(() => this.textMessage = '')
      }
    }
  }

}
