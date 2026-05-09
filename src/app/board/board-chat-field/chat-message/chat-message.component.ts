import {
  Component,
  ElementRef,
  Input,
  OnInit,
  ViewChild,
  inject,
  ChangeDetectorRef,
  AfterViewChecked,
  input,
  viewChildren,
  ChangeDetectionStrategy,
} from '@angular/core';
import { BoardService } from '../../../shared/services/board-service/board.service';
import { FirestoreService } from '../../../shared/services/firestore-service/firestore.service';
import { CommonModule } from '@angular/common';
import { Message } from '../../../shared/interfaces/message.interface';
import { Reaction } from '../../../shared/interfaces/reaction.interface';
import { Channel } from '../../../shared/interfaces/channel.interface';
import { FormsModule } from '@angular/forms';
import { MessageEditorComponent } from '../message-editor/message-editor.component';
import { FirebaseStorageService } from '../../../shared/services/firebase-storage-service/firebase-storage.service';
import { ChatMessageAttachmentComponent } from './chat-message-attachment/chat-message-attachment.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-chat-message',
  imports: [CommonModule, FormsModule, MessageEditorComponent, ChatMessageAttachmentComponent],
  templateUrl: './chat-message.component.html',
  styleUrls: [
    './chat-message.component.scss',
    './chat-message-media-queries.component.scss',
    'chat-message-textarea-elements.component.scss',
  ],
})
export class ChatMessageComponent implements OnInit, AfterViewChecked {
  readonly channelMessages = viewChildren<ElementRef>('channelMessages');
  @Input() chat!: Message;
  readonly lastIndex = input.required<boolean>();
  readonly channelId = input<string>('');
  readonly chatMessageIndex = input<number>(0);
  @Input() currentChannel!: Channel;

  boardServ = inject(BoardService);
  firestore = inject(FirestoreService);
  fbStorageService = inject(FirebaseStorageService);

  editedMessage?: string;
  showFile = false;
  mouseIsOverMessage: boolean = false;
  popUpReaction: boolean = false;
  memberDialogIsOpen: boolean = false;
  reactionDialogOpen = false;
  reactionDialogIndicatorbarOpen = false;
  currentUserName!: string;
  lastReactions: string[] = ['thumbs_up', 'laughing'];
  currentChatMessage!: Message;
  editorOpen = false;
  reactionEmojis: string[] = [
    'angry',
    'cool',
    'flushed',
    'hearts',
    'high_five',
    'laughing',
    'thumbs_up',
  ];
  elementsInitialized: boolean = false;

  cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.currentChannel = this.firestore.allChannels()[this.boardServ.idx];
    this.currentUserName = this.boardServ.currentUser.name;
    this.currentChatMessage = this.chat;
    this.editedMessage = this.chat.text;
  }

  ngAfterViewChecked() {
    const channelMessages = this.channelMessages();
    if (channelMessages && channelMessages.length > 0 && !this.elementsInitialized) {
      channelMessages.forEach(chanMe => {
        this.boardServ.channelMessageElementsToArray.push(chanMe);
        this.boardServ.highlightArrayForTheChannelElementSearched.push(false);
      });
      this.elementsInitialized = true;
      this.cdr.detectChanges();
    }
  }

  onArrayChange() {
    this.cdr.detectChanges();
  }

  checkIfDateIsToday(timestamp: number) {
    const todayAsString = new Date().toDateString();
    const dateToCheckAsString = new Date(timestamp).toDateString();
    return todayAsString === dateToCheckAsString;
  }

  toggleReactionDialog(htmlElement: string) {
    if (htmlElement == 'reactionIdicator') {
      this.reactionDialogIndicatorbarOpen = !this.reactionDialogIndicatorbarOpen;
    } else {
      this.reactionDialogOpen = !this.reactionDialogOpen;
    }
  }

  toggleMessageEditor() {
    this.editorOpen = !this.editorOpen;
    this.mouseIsOverMessage = false;
  }

  toggleFilePreview() {
    this.showFile = !this.showFile;
  }

  async editMessage(_index: number) {
    if (!this.chat.id) return;
    await this.firestore.updateChannelMessage(this.channelId(), this.chat.id, {
      text: this.editedMessage!,
    });
    this.editorOpen = false;
  }

  setCurrentMessage() {
    this.boardServ.currentChatMessage = this.chat;
    this.boardServ.chatMessageIndex = this.chatMessageIndex();
    this.boardServ.currentChannelTitle = this.currentChannel.title;
  }

  async updateCompleteChannel(emojiIdx: number, emojiArray: string[]): Promise<void> {
    if (!this.chat.id) return;
    const emojiPath = emojiArray[emojiIdx];
    const reactions = this.chat.reactions.map(r => ({ ...r, userIds: [...r.userIds] }));
    const existingIdx = reactions.findIndex(r => r.emojiPath === emojiPath);
    if (existingIdx >= 0) {
      if (!reactions[existingIdx].userIds.includes(this.boardServ.currentUser.id!)) {
        reactions[existingIdx].userIds.push(this.boardServ.currentUser.id!);
      }
    } else {
      reactions.push({ emojiPath, userIds: [this.boardServ.currentUser.id!] });
    }
    await this.firestore.updateChannelMessage(this.channelId(), this.chat.id, { reactions });
    this.getLastTwoReactions(emojiIdx, emojiArray);
  }

  getLastTwoReactions(index: number, emojiArray: string[]) {
    const newReaction = emojiArray[index];
    if (this.lastReactions[this.lastReactions.length - 1] !== newReaction) {
      if (this.lastReactions.length >= 2) {
        this.lastReactions.splice(0, 1);
      }
      this.lastReactions.push(newReaction);
    }
  }

  setReactionObject(i: number, emojiArray: string[]): Reaction {
    return {
      emojiPath: emojiArray[i],
      userIds: [this.boardServ.currentUser.id!],
    };
  }

  onHover(htmlElement: string) {
    if (htmlElement == 'message-box') {
      this.mouseIsOverMessage = true;
    }
  }

  stopHover(_event: boolean) {
    this.mouseIsOverMessage = false;
  }

  onLeave(htmlElement: string) {
    if (htmlElement == 'message-box') {
      this.mouseIsOverMessage = false;
      this.reactionDialogOpen = false;
    }
  }

  showMembersDialogToggle() {
    this.memberDialogIsOpen = true;
  }
}
