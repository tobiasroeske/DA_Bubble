import { Component, ElementRef, Input, OnInit, ViewChild, inject, QueryList, ViewChildren, ChangeDetectorRef } from '@angular/core';
import { BoardService } from '../../board.service';
import { FirestoreService } from '../../../shared/services/firestore-service/firestore.service';
import { CommonModule } from '@angular/common';
import { ChatMessage } from '../../../shared/interfaces/chatMessage.interface';
import { Reaction } from '../../../shared/interfaces/reaction.interface';
import { FormsModule } from '@angular/forms';
import { MessageEditorComponent } from '../message-editor/message-editor.component';
import { FirebaseStorageService } from '../../../shared/services/firebase-storage-service/firebase-storage.service';
import { Channel } from '../../../shared/models/channel.class';


@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule, FormsModule, MessageEditorComponent],
  templateUrl: './chat-message.component.html',
  styleUrls: ['./chat-message.component.scss', './chat-message-media-queries.component.scss', 'chat-message-textarea-elements.component.scss']
})

export class ChatMessageComponent implements OnInit {
  @ViewChildren('channelMessages') channelMessages!: QueryList<ElementRef>;
  @Input() chat!: ChatMessage;
  @Input() lastIndex!: boolean;
  @Input() channelId!: string;
  @Input() chatMessageIndex!: number;
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
  membersList: any[] = [];
  currentUserName!: any
  lastReactions: string[] = ['thumbs_up', 'laughing'];
  currentChatMessage!: ChatMessage
  editorOpen = false;
  reactionEmojis: string[] = ['angry', 'cool', 'flushed', 'hearts', 'high_five', 'laughing', 'thumbs_up'];
  elementsInitialized: boolean = false;

  cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.currentChannel = (this.firestore.allChannels[this.boardServ.idx]);
    this.currentUserName = this.boardServ.currentUser.name;
    this.currentChatMessage = this.chat;
    this.editedMessage = this.chat.message;
  }

  ngAfterViewChecked() {
    if (this.channelMessages && this.channelMessages.length > 0 && !this.elementsInitialized) {
      this.channelMessages.toArray().forEach(chanMe => {
        this.boardServ.channelMessageElementsToArray.push(chanMe);
        this.boardServ.highlightArrayForTheChannelElementSearched.push(false)
      })
      this.elementsInitialized = true;
      this.cdr.detectChanges();
    }
  }

  onArrayChange() {
    this.cdr.detectChanges();
  }

  checkIfDateIsToday(date: number) {
    let todayAsString = new Date().toDateString();
    let dateToCheckAsString = new Date(date).toDateString();
    let sameDate = todayAsString == dateToCheckAsString;
    if (sameDate) {
      return true;
    } else {
      return false;
    }
  }

  toggleReactionDialog(htmlElement: string) {
    if (htmlElement == 'reactionIdicator') {
      this.reactionDialogIndicatorbarOpen = !this.reactionDialogIndicatorbarOpen;
    } else {
      this.reactionDialogOpen = !this.reactionDialogOpen;
    }
  }

  toggleMessageEditor() {
    this.editorOpen = !this.editorOpen
    this.mouseIsOverMessage = false;
  }

  toggleFilePreview() {
    this.showFile = !this.showFile;
  }

  editMessage(index: number) {
    this.chat.message = this.editedMessage!;
    this.currentChannel.chat!.splice(index, 1, this.chat);
    console.log(this.currentChannel);
    this.firestore.updateChannel(this.currentChannel, this.channelId)
      .then(() => this.editorOpen = false);
  }

  setCurrentMessage() {
    this.boardServ.currentChatMessage = this.chat;
    this.boardServ.chatMessageIndex = this.chatMessageIndex;
    this.boardServ.currentChannelTitle = this.currentChannel.title;
  }

  async updateCompleteChannel(emojiIdx: number, emojiArray: string[]): Promise<void> {
    let newChatMessage = this.checkIfReactionExists(emojiIdx, emojiArray);
    this.currentChannel.chat!.splice(this.chatMessageIndex, 1, newChatMessage);
    await this.firestore.updateAllChats(this.channelId, this.currentChannel.chat!)
      .then(() => this.getLastTwoReactions(emojiIdx, emojiArray));
  }

  checkIfReactionExists(emojiIdx: number, emojiArray: string[]): ChatMessage {
    let chatMessage = this.getCurrentChatMessage();
    let emojiPath = emojiArray[emojiIdx];
    let existingReaction = this.findExistingReaction(chatMessage, emojiPath);
    if (existingReaction) {
      this.updateExistingReaction(existingReaction);
    } else {
      this.addNewReaction(chatMessage, emojiIdx, emojiArray);
    }
    return chatMessage;
  }

  getCurrentChatMessage(): ChatMessage {
    return this.currentChannel.chat![this.chatMessageIndex];
  }

  findExistingReaction(chatMessage: ChatMessage, emojiPath: string): Reaction | undefined {
    return chatMessage.reactions.find(reaction => reaction.emojiPath === emojiPath);
  }

  updateExistingReaction(existingReaction: Reaction): void {
    existingReaction.count += 1;
    if (!existingReaction.creator.includes(this.currentUserName)) {
      existingReaction.creator.push(this.currentUserName);
    }
  }

  addNewReaction(chatMessage: ChatMessage, emojiIdx: number, emojiArray: string[]): void {
    chatMessage.reactions.push(this.setReactionObject(emojiIdx, emojiArray));
  }

  getLastTwoReactions(index: number, emojiArray: string[]) {
    let newReaction = emojiArray[index];
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
      creator: [this.boardServ.currentUser.name],
      count: 1,
    }
  }

  onHover(htmlElement: string) {
    if (htmlElement == 'message-box') {
      this.mouseIsOverMessage = true;
    }
  }

  stopHover(event: boolean) {
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
