import { CommonModule } from '@angular/common';
import { Component, Input, ViewChildren, QueryList, ElementRef, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { ChatMessageComponent } from '../chat-message/chat-message.component';
import { ChatMessage } from '../../../shared/interfaces/chatMessage.interface';
import { Reaction } from '../../../shared/interfaces/reaction.interface';
import { PrivateMessageEditorComponent } from './private-message-editor/private-message-editor.component';
import { LocalStorageService } from '../../../shared/services/local-storage-service/local-storage.service';

@Component({
  selector: 'app-private-chat-message',
  standalone: true,
  imports: [CommonModule, PrivateMessageEditorComponent],
  templateUrl: './private-chat-message.component.html',
  styleUrl: './private-chat-message.component.scss'
})
export class PrivateChatMessageComponent extends ChatMessageComponent implements AfterViewInit, OnDestroy {
  @ViewChildren('messageElements') messageElements!: QueryList<ElementRef>;
  @Input() privateChatId?: string;
  @Input() privateMessage!: ChatMessage;
  @Input() privateChatIndex!: number;
  @Input() lasIndex!: boolean;
  @Input() message!: string;

  localStorageServ = inject(LocalStorageService)
  currentPrivatChat!: ChatMessage[];
  elementsInitialized: boolean = false;

  lastReactionEmojis: string[] = ['thumbs_up', 'laughing'];


  constructor() {
    super();
  }

  override ngOnInit(): void {
    this.currentPrivatChat = this.firestore.directMessages[this.boardServ.chatPartnerIdx].chat;
  }

  ngAfterViewInit() {
  }

  ngAfterViewChecked() {
    if (this.messageElements && this.messageElements.length > 0 && !this.elementsInitialized) {
      this.messageElements.toArray().forEach((me) => {
        this.boardServ.privateMessagesElementsToArray.push(me);
        this.boardServ.highlightArrayForTheChildElementSearched.push(false);
      })
      this.elementsInitialized = true;
    }
  }

  ngOnDestroy() {
    this.boardServ.privateMessagesElementsToArray = []; // applicare l'ngOnDestroy ha fatto si che l'array this.boardServ.privateMessageToArry si svuotasse al cambio utente, evitando l'aggiunta di messaggi esterni che non appartenevano a quella chat, ma svuotando l'array e lasciando spazio all'inserimento dei messaggi nuovi della nuova chat cliccata
  }

  override async updateCompleteChannel(emojiIdx: number, emojiArray: string[]): Promise<void> {
    if (this.privateChatId) {
      let newPrivateMessage = this.checkIfReactionExists(emojiIdx, emojiArray);
      this.currentPrivatChat.splice(this.privateChatIndex, 1, newPrivateMessage);
      await this.firestore.updateCompletlyPrivateChat(this.privateChatId, this.currentPrivatChat)
      .then(() => this.getLastTwoReactions(emojiIdx, emojiArray))
    }
  }

  override checkIfReactionExists(emojiIdx: number, emojiArray: string[]): ChatMessage {
    let privateChatMessage = this.firestore.directMessages[this.boardServ.chatPartnerIdx].chat[this.privateChatIndex]
    let emojiPath = emojiArray[emojiIdx];
    let existingReaction = privateChatMessage.reactions.find(reaction => reaction.emojiPath == emojiPath);
    if (existingReaction) {
      existingReaction.count++;
      if (existingReaction.creator.includes(this.currentUserName)) {
        existingReaction.creator.push(this.currentUserName);
      }
    } else {
      privateChatMessage.reactions.push(this.setReactionObject(emojiIdx, emojiArray))
    }

    return privateChatMessage
  }

  override getLastTwoReactions(index: number, emojiArray: string[]) {
    let newReaction = emojiArray[index];
    if (this.lastReactionEmojis[this.lastReactionEmojis.length - 1] !== newReaction) {
      if (this.lastReactionEmojis.length >= 2) {
        this.lastReactionEmojis.splice(0, 1);
      }
      this.lastReactionEmojis.push(newReaction);
      this.localStorageServ.saveLastReactions(this.lastReactionEmojis);
    }
  }

  override setReactionObject(i: number, emojiArray: string []): Reaction {
    return {
      emojiPath: emojiArray[i],
      creator: [this.boardServ.currentUser.name],
      count: 1,
    }
  }




}
