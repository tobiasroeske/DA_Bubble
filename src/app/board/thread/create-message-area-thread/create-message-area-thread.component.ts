import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ChatMessage } from '../../../shared/interfaces/chatMessage.interface';
import { FormsModule } from '@angular/forms';
import { Channel } from '../../../shared/models/channel.class';
import { CreateMessageAreaComponent } from '../../create-message-area/create-message-area.component';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';

@Component({
  selector: 'app-create-message-area-thread',
  standalone: true,
  imports: [CommonModule, FormsModule, PickerComponent],
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
    if (this.textMessage.length > 0) {
      let date = new Date().getTime();
      let newAnswer = this.setMessageObject(date);
      this.currentChatMessage?.answers.push(newAnswer)
      if (this.currentChannel) {
        this.currentChannel.chat!.splice(this.boardService.chatMessageIndex, 1, this.currentChatMessage)
        console.log(this.currentChannel);
        this.firestoreService.updateAllChats(this.currentChannel.id!, this.currentChannel.chat!)
        .then(() => {
          this.textMessage = '';
          this.showEmojiPicker = false;
          this.boardService.scrollToBottom(this.boardService.threadRef);
        })
      }
    }
  }

}
