import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  ElementRef,
  HostListener,
  OnDestroy,
  inject,
  AfterViewChecked,
  input,
  viewChildren,
  ChangeDetectionStrategy,
} from '@angular/core';
import { ChatMessageComponent } from '../chat-message/chat-message.component';
import { Message } from '../../../shared/interfaces/message.interface';
import { PrivateMessageEditorComponent } from './private-message-editor/private-message-editor.component';
import { LocalStorageService } from '../../../shared/services/local-storage-service/local-storage.service';
import { ChatMessageAttachmentComponent } from '../chat-message/chat-message-attachment/chat-message-attachment.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-private-chat-message',
  imports: [CommonModule, PrivateMessageEditorComponent, ChatMessageAttachmentComponent],
  templateUrl: './private-chat-message.component.html',
  styleUrls: [
    './private-chat-message.component.scss',
    './private-chat-media-queries.component.scss',
  ],
})
export class PrivateChatMessageComponent
  extends ChatMessageComponent
  implements AfterViewChecked, OnDestroy
{
  readonly messageElements = viewChildren<ElementRef>('messageElements');
  readonly privateChatId = input<string>();
  @Input() privateMessage!: Message;
  readonly privateChatIndex = input<number>(0);
  readonly lasIndex = input<boolean>(false);
  readonly message = input<string>('');
  override mouseIsOverMessage: boolean = false;

  localStorageServ = inject(LocalStorageService);

  override elementsInitialized: boolean = false;
  lastReactionEmojis: string[] = ['thumbs_up', 'laughing'];
  openTheIndicatorBarTools: boolean = false;
  currentWindowWidth!: number;

  constructor() {
    super();
  }

  override ngOnInit(): void {
    this.currentWindowWidth = window.innerWidth;
  }

  override ngAfterViewChecked() {
    if (this.shouldInitializeElements()) {
      this.initializeElements();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.currentWindowWidth = (event.target as Window).innerWidth;
  }

  openTheTools() {
    this.openTheIndicatorBarTools = true;
  }

  closeTheTools() {
    this.openTheIndicatorBarTools = false;
  }

  setCurrentPrivateChatMessage() {
    this.boardServ.privateAnswerMessage = this.privateMessage;
    this.boardServ.privateAnswerIndex = this.privateChatIndex();
  }

  shouldInitializeElements(): boolean {
    const messageElements = this.messageElements();
    return messageElements && messageElements.length > 0 && !this.elementsInitialized;
  }

  initializeElements(): void {
    this.messageElements().forEach((me: ElementRef) => {
      this.boardServ.privateMessagesElementsToArray.push(me);
      this.boardServ.highlightArrayForTheChildElementSearched.push(false);
    });
    this.elementsInitialized = true;
  }

  ngOnDestroy() {
    this.boardServ.privateMessagesElementsToArray = [];
  }

  override async updateCompleteChannel(emojiIdx: number, emojiArray: string[]): Promise<void> {
    const dmId = this.privateChatId();
    const msgId = this.privateMessage?.id;
    if (!dmId || !msgId) return;
    const emojiPath = emojiArray[emojiIdx];
    const reactions = this.privateMessage.reactions.map(r => ({ ...r, userIds: [...r.userIds] }));
    const existingIdx = reactions.findIndex(r => r.emojiPath === emojiPath);
    if (existingIdx >= 0) {
      if (!reactions[existingIdx].userIds.includes(this.boardServ.currentUser.id!)) {
        reactions[existingIdx].userIds.push(this.boardServ.currentUser.id!);
      }
    } else {
      reactions.push({ emojiPath, userIds: [this.boardServ.currentUser.id!] });
    }
    await this.firestore.updateDmMessage(dmId, msgId, { reactions });
    this.getLastTwoReactions(emojiIdx, emojiArray);
  }

  override getLastTwoReactions(index: number, emojiArray: string[]) {
    const newReaction = emojiArray[index];
    if (this.lastReactionEmojis[this.lastReactionEmojis.length - 1] !== newReaction) {
      if (this.lastReactionEmojis.length >= 2) {
        this.lastReactionEmojis.splice(0, 1);
      }
      this.lastReactionEmojis.push(newReaction);
      this.localStorageServ.saveLastReactions(this.lastReactionEmojis);
    }
  }
}
