import { AfterViewInit, Component, Input, OnInit, inject } from '@angular/core';
import { ChatMessage } from '../../../shared/interfaces/chatMessage.interface';
import { Channel } from '../../../shared/models/channel.class';
import { BoardService } from '../../board.service';
import { CommonModule } from '@angular/common';
import { User } from '../../../shared/models/user.class';
import { Reaction } from '../../../shared/interfaces/reaction.interface';
import { FirestoreService } from '../../../shared/services/firestore-service/firestore.service';
import { AnswerEditorComponent } from '../answer-editor/answer-editor.component';


@Component({
  selector: 'app-answer-message',
  standalone: true,
  imports: [CommonModule, AnswerEditorComponent],
  templateUrl: './answer-message.component.html',
  styleUrl: './answer-message.component.scss'
})
export class AnswerMessageComponent implements OnInit, AfterViewInit {
  firestoreService = inject(FirestoreService)
  boardServ = inject(BoardService)

  @Input() currentChannel!: Channel
  @Input() currentChatMessage?: ChatMessage;
  @Input() answer!: ChatMessage;
  @Input() lastIndex!: boolean;
  @Input() chatMessagaeIndex?: number;
  @Input() answerIndex?: number

  currentUserName!: User;
  showReactionPopup = false;
  showEmojiBar = false;
  reactionDialogIndicatorbarOpen = false;
  editorOpen = false;
  showFile = false;
  reactionEmojis: string[] = ['angry', 'cool', 'flushed', 'hearts', 'high_five', 'laughing', 'thumbs_up'];

  ngOnInit(): void {
    this.currentUserName = this.boardServ.currentUser.name;
    this.boardServ.scrollToBottom(this.boardServ.threadRef);
  }

  toggleFilePreview() {
    this.showFile = !this.showFile;
  }

  ngAfterViewInit(): void {
    this.boardServ.scrollToBottom(this.boardServ.threadRef);
  }

  updateAllChannels(emojiIdx: number) {
    let newAnswer = this.checkIfReactionExists(emojiIdx);
    this.currentChannel?.chat?.splice(this.chatMessagaeIndex!, 1, this.currentChatMessage)
    this.firestoreService.updateAllChats(this.currentChannel.id!, this.currentChannel.chat!)
  }

  toggleMessageEditor() {
    this.editorOpen = !this.editorOpen
  }

  checkIfReactionExists(emojiIdx: number) {
    let emojiPath = this.reactionEmojis[emojiIdx];
    let existingReaction = this.findExistingReaction(emojiPath);
    if (existingReaction) {
      this.updateExistingReaction(existingReaction);
    } else {
      this.addNewReaction(emojiIdx);
    }
    return this.answer;
  }

  findExistingReaction(emojiPath: string) {
    return this.answer.reactions.find(reaction => reaction.emojiPath === emojiPath);
  }

  updateExistingReaction(reaction: any) {
    reaction.count++;
    if (!reaction.creator.includes(this.currentUserName)) {
      reaction.creator.push(this.currentUserName);
    }
  }

  addNewReaction(emojiIdx: number) {
    this.answer.reactions.push(this.setReactionObject(emojiIdx));
  }

  setReactionObject(i: number): Reaction {
    return {
      emojiPath: this.reactionEmojis[i],
      creator: [this.boardServ.currentUser.name],
      count: 1,
    }
  }

  toggleReactionPopup(event: Event) {
    if (event.type == 'mouseover') {
      this.showReactionPopup = true;
    }
    if (event.type == 'mouseleave') {
      this.showReactionPopup = false;
      this.showEmojiBar = false;
    }
  }

  showEmmojibar(boolean: boolean) {
    if (boolean == true) {
      this.reactionDialogIndicatorbarOpen = !this.reactionDialogIndicatorbarOpen;
    }
    if (boolean == false) {
      this.showEmojiBar = !this.showEmojiBar
    }
  }
}
