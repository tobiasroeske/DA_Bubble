import {
  Component,
  ElementRef,
  HostListener,
  input,
  viewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ChatMessage } from '../../../shared/interfaces/chatMessage.interface';
import { FormsModule } from '@angular/forms';
import { Channel } from '../../../shared/models/channel.class';
import { CreateMessageAreaComponent } from '../../create-message-area/create-message-area.component';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { CurrentUser } from '../../../shared/interfaces/currentUser.interface';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-create-message-area-thread',
  imports: [FormsModule, PickerComponent],
  templateUrl: './create-message-area-thread.component.html',
  styleUrl: './create-message-area-thread.component.scss',
})
export class CreateMessageAreaThreadComponent extends CreateMessageAreaComponent {
  readonly currentChatMessage = input<ChatMessage>();
  readonly currentChannel = input<Channel>();
  override readonly fileInput = viewChild.required<ElementRef<any>>('fileInput');

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

  override async sendMessage() {
    if (this.canSendMessage()) {
      const date = new Date().getTime();
      const newAnswer = this.setMessageObject(date);
      this.currentChatMessage()?.answers.push(newAnswer);
      if (this.currentChannel()) {
        try {
          await this.updateChat();
          this.postUpdateActions();
        } catch (error) {
          console.error('Error updating chat', error);
        }
      }
    }
  }

  canSendMessage(): boolean {
    return this.textMessage.length > 0 || this.uploadedFile.length > 0;
  }

  updateChat(): Promise<void> {
    this.currentChannel()!.chat!.splice(
      this.boardService.chatMessageIndex,
      1,
      this.currentChatMessage()
    );
    return this.firestoreService.updateAllChats(
      this.currentChannel()!.id!,
      this.currentChannel()!.chat!
    );
  }

  postUpdateActions(): void {
    this.resetTextArea();
    this.boardService.scrollToBottom(this.boardService.threadRef);
  }
}
