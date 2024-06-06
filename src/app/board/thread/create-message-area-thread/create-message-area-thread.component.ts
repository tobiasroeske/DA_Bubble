import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { ChatMessage } from '../../../shared/interfaces/chatMessage.interface';
import { FormsModule } from '@angular/forms';
import { Channel } from '../../../shared/models/channel.class';
import { CreateMessageAreaComponent } from '../../create-message-area/create-message-area.component';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { CurrentUser } from '../../../shared/interfaces/currentUser.interface';

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
  @ViewChild('fileInput') override fileInput!: ElementRef<any>;
  override memberToTag: string = '';
  override channelToTag: string = '';
  override filteredChannels: Channel[] = [];
  override filteredMembers: CurrentUser[] = [];
  override uploadedFile: string = '';
  override filePath: string = '';
  override fileSizeToGreat: boolean = false;
  tagMembersThread = false;
  tagChannelsThread = false;

  constructor() {
    super();
  }



  override sendMessage(): void {
    if (this.textMessage.length > 0 || this.uploadedFile.length > 0) {
      let date = new Date().getTime();
      let newAnswer = this.setMessageObject(date);
      this.currentChatMessage?.answers.push(newAnswer)
      if (this.currentChannel) {
        this.currentChannel.chat!.splice(this.boardService.chatMessageIndex, 1, this.currentChatMessage)
        this.firestoreService.updateAllChats(this.currentChannel.id!, this.currentChannel.chat!)
          .then(() => {
            this.resetTextArea();
            this.boardService.scrollToBottom(this.boardService.threadRef);
          })
      }
    }
  }

  // override resetTextArea() {
  //   this.textMessage = '';
  //   this.uploadedFile = '';
  //   this.filePath = '';
  //   this.showEmojiPicker = false;
  // }

}
