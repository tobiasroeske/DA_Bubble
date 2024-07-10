import { CommonModule } from '@angular/common';
import { Component, Input, ViewChildren, QueryList, ElementRef, HostListener, AfterViewInit, OnDestroy, inject, AfterViewChecked } from '@angular/core';
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
  styleUrls: ['./private-chat-message.component.scss', './private-chat-media-queries.component.scss']
})
export class PrivateChatMessageComponent extends ChatMessageComponent implements AfterViewChecked, OnDestroy {
  @ViewChildren('messageElements') messageElements!: QueryList<ElementRef>;
  @Input() privateChatId?: string;
  @Input() privateMessage!: ChatMessage;
  @Input() privateChatIndex!: number;
  @Input() lasIndex!: boolean;
  @Input() message!: string;
  override mouseIsOverMessage: boolean = false;

  localStorageServ = inject(LocalStorageService);

  currentPrivatChat!: ChatMessage[];
  override elementsInitialized: boolean = false;
  lastReactionEmojis: string[] = ['thumbs_up', 'laughing'];
  openTheIndicatorBarTools: boolean = false;
  currentWindowWidth!: number;

  constructor() {
    super();
  }


  override ngOnInit(): void {
    this.currentPrivatChat = this.firestore.directMessages[this.boardServ.chatPartnerIdx].chat;
    this.currentWindowWidth = window.innerWidth;
  }

  override ngAfterViewChecked() {
    if (this.shouldInitializeElements()) {
      this.initializeElements();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.currentWindowWidth = event.target.innerWidth;
  }

  openTheTools() {
    this.openTheIndicatorBarTools = true;
  }

  closeTheTools() {
    this.openTheIndicatorBarTools = false;
  }
  setCurrentPrivateChatMessage() {
    this.boardServ.privateAnswerMessage = this.privateMessage;
    this.boardServ.privateAnswerIndex = this.privateChatIndex;
  }

  shouldInitializeElements(): boolean {
    return this.messageElements && this.messageElements.length > 0 && !this.elementsInitialized;
  }

  initializeElements(): void {
    this.messageElements.toArray().forEach((me) => {
      this.boardServ.privateMessagesElementsToArray.push(me);
      this.boardServ.highlightArrayForTheChildElementSearched.push(false);
    });
    this.elementsInitialized = true;
  }

  ngOnDestroy() {
    this.boardServ.privateMessagesElementsToArray = [];
  }

  override async updateCompleteChannel(emojiIdx: number, emojiArray: string[]): Promise<void> {
    if (this.privateChatId) {
      let newPrivateMessage = this.checkIfReactionExists(emojiIdx, emojiArray);
      this.currentPrivatChat.splice(this.privateChatIndex, 1, newPrivateMessage);
      try {
        await this.firestore.updateCompletlyPrivateChat(this.privateChatId, this.currentPrivatChat);
        this.getLastTwoReactions(emojiIdx, emojiArray)
      } catch (error) {
        console.error('Error updating complete private chats', error)
      }
    }
  }

  override checkIfReactionExists(emojiIdx: number, emojiArray: string[]): ChatMessage {
    let privateChatMessage = this.getCurrentPrivateChatMessage();
    let emojiPath = emojiArray[emojiIdx];
    let existingReaction = this.findExistingReaction(privateChatMessage, emojiPath);
    if (existingReaction) {
      this.updateExistingReaction(existingReaction);
    } else {
      this.addNewReaction(privateChatMessage, emojiIdx, emojiArray);
    }
    return privateChatMessage;
  }

  getCurrentPrivateChatMessage(): ChatMessage {
    return this.firestore.directMessages[this.boardServ.chatPartnerIdx].chat[this.privateChatIndex];
  }

  override findExistingReaction(chatMessage: ChatMessage, emojiPath: string): Reaction | undefined {
    return chatMessage.reactions.find(reaction => reaction.emojiPath === emojiPath);
  }

  override updateExistingReaction(reaction: Reaction): void {
    reaction.count++;
    if (!reaction.creator.includes(this.currentUserName)) {
      reaction.creator.push(this.currentUserName);
    }
  }

  override addNewReaction(chatMessage: ChatMessage, emojiIdx: number, emojiArray: string[]): void {
    chatMessage.reactions.push(this.setReactionObject(emojiIdx, emojiArray));
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

  override setReactionObject(i: number, emojiArray: string[]): Reaction {
    return {
      emojiPath: emojiArray[i],
      creator: [this.boardServ.currentUser.name],
      count: 1,
    }
  }

}
