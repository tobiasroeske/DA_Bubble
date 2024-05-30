import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ChatMessageComponent } from '../chat-message/chat-message.component';
import { ChatMessage } from '../../../shared/interfaces/chatMessage.interface';
import { Reaction } from '../../../shared/interfaces/reaction.interface';

@Component({
  selector: 'app-private-chat-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './private-chat-message.component.html',
  styleUrl: './private-chat-message.component.scss'
})
export class PrivateChatMessageComponent extends ChatMessageComponent {

  @Input() privateChatId?: string;
  @Input() privateChat!: ChatMessage;
  @Input() privateChatIndex!: number;


  constructor() {
    super();
  }

  override ngOnInit(): void {
    // console.log(this.privateChatId);
    // console.log(this.privateChat.reactions);
    // console.log(this.privateChatIndex);
  }

  override updateCompleteChannel(emojiIdx: number, emojiArray: string[]): void {
    let selectedEmoji = this.setReactionObject(emojiIdx);
    console.log(selectedEmoji);
    this.privateChat.reactions.push(selectedEmoji);
  }


  override setReactionObject(i: number): Reaction {
    return {
      emojiPath: this.reactionEmojis[i],
      creator: [this.boardServ.currentUser.name],
      count: 1,
    }
  }




}
