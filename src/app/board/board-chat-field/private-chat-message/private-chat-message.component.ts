import { CommonModule } from '@angular/common';
import { Component, Input, ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';
import { ChatMessageComponent } from '../chat-message/chat-message.component';
import { ChatMessage } from '../../../shared/interfaces/chatMessage.interface';
import { Reaction } from '../../../shared/interfaces/reaction.interface';
import { PrivateMessageEditorComponent } from './private-message-editor/private-message-editor.component';

@Component({
  selector: 'app-private-chat-message',
  standalone: true,
  imports: [CommonModule, PrivateMessageEditorComponent],
  templateUrl: './private-chat-message.component.html',
  styleUrl: './private-chat-message.component.scss'
})
export class PrivateChatMessageComponent extends ChatMessageComponent implements AfterViewInit {
  @ViewChildren('messageElements') messageElements!: QueryList<ElementRef>;
  @Input() privateChatId?: string;
  @Input() privateMessage!: ChatMessage;
  @Input() privateChatIndex!: number;
  @Input() lasIndex!: boolean;
  @Input() message!: string;
  currentPrivatChat!: ChatMessage[];


  constructor() {
    super();
  }


  scrollToSearchedMessage(index: number) {
    setTimeout(() => {
      let elementArray = this.messageElements.toArray();
      let element = elementArray[index];
      if (element) {
        element.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        console.warn('Element not found:', 'message-' + index);
      }
    }, 100);
  }

  override ngOnInit(): void {
    this.currentPrivatChat = this.firestore.directMessages[this.boardServ.chatPartnerIdx].chat;
  }

  ngAfterViewInit() {
    this.boardServ.privateMessagesElementsToArray = this.messageElements.toArray();
    console.log(this.boardServ.privateMessagesElementsToArray);
  }

  override updateCompleteChannel(emojiIdx: number, emojiArray: string[]): void {
    if (this.privateChatId) {
      let newPrivateMessage = this.checkIfReactionExists(emojiIdx, emojiArray);
      this.currentPrivatChat.splice(this.privateChatIndex, 1, newPrivateMessage);
      this.firestore.updateCompletlyPrivateChat(this.privateChatId, this.currentPrivatChat);
    }
  }

  override checkIfReactionExists(emojiIdx: number, emojiArray: string[]): ChatMessage {
    let privateChatMessage = this.firestore.directMessages[this.boardServ.chatPartnerIdx].chat[this.privateChatIndex]
    let emojiPath = emojiArray[emojiIdx];
    let existingReaction = privateChatMessage.reactions.find(reaction => reaction.emojiPath == emojiPath);
    if (existingReaction) {
      existingReaction.count++;
    } else {
      privateChatMessage.reactions.push(this.setReactionObject(emojiIdx))
    }

    return privateChatMessage
  }



  override setReactionObject(i: number): Reaction {
    return {
      emojiPath: this.reactionEmojis[i],
      creator: [this.boardServ.currentUser.name],
      count: 1,
    }
  }




}
