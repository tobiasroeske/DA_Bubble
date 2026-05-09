import { Component, ElementRef, input, viewChild, ChangeDetectionStrategy } from '@angular/core';
import { Message } from '../../../shared/interfaces/message.interface';
import { FormsModule } from '@angular/forms';
import { Channel } from '../../../shared/interfaces/channel.interface';
import { UserProfile } from '../../../shared/interfaces/user.interface';
import { CreateMessageAreaComponent } from '../../create-message-area/create-message-area.component';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-create-message-area-thread',
  imports: [FormsModule, PickerComponent],
  templateUrl: './create-message-area-thread.component.html',
  styleUrl: './create-message-area-thread.component.scss',
})
export class CreateMessageAreaThreadComponent extends CreateMessageAreaComponent {
  readonly currentChatMessage = input<Message>();
  readonly currentChannel = input<Channel>();
  override readonly fileInput = viewChild.required<ElementRef<any>>('fileInput');

  override memberToTag: string = '';
  override channelToTag: string = '';
  override filteredChannels: Channel[] = [];
  override filteredMembers: UserProfile[] = [];
  override uploadedFile: string = '';
  override filePath: string = '';
  override fileSizeToGreat: boolean = false;

  constructor() {
    super();
  }

  override async sendMessage() {
    if (!this.canSendMessage()) return;
    const channel = this.currentChannel();
    const parentMsg = this.currentChatMessage();
    if (!channel?.id || !parentMsg?.id) return;
    const reply: Omit<Message, 'id' | 'replyCount'> = {
      text: this.textMessage,
      author: {
        id: this.boardService.currentUser.id!,
        name: this.boardService.currentUser.name,
        avatarPath: this.boardService.currentUser.avatarPath,
      },
      timestamp: Date.now(),
      reactions: [],
      fileUpload: this.uploadedFile || '',
    };
    try {
      await this.firestoreService.addReply(channel.id, parentMsg.id, reply);
      this.postUpdateActions();
    } catch (error) {
      console.error('Error adding reply', error);
    }
  }

  canSendMessage(): boolean {
    return this.textMessage.length > 0 || this.uploadedFile.length > 0;
  }

  postUpdateActions(): void {
    this.resetTextArea();
    this.boardService.scrollToBottom(this.boardService.threadRef);
  }
}
