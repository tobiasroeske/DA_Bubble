import {
  AfterViewInit,
  Component,
  Input,
  OnInit,
  inject,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Message } from '../../../shared/interfaces/message.interface';
import { Channel } from '../../../shared/interfaces/channel.interface';
import { BoardService } from '../../../shared/services/board-service/board.service';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '../../../shared/services/firestore-service/firestore.service';
import { AnswerEditorComponent } from '../answer-editor/answer-editor.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-answer-message',
  imports: [CommonModule, AnswerEditorComponent],
  templateUrl: './answer-message.component.html',
  styleUrl: './answer-message.component.scss',
})
export class AnswerMessageComponent implements OnInit, AfterViewInit {
  firestoreService = inject(FirestoreService);
  boardServ = inject(BoardService);

  readonly currentChannel = input.required<Channel>();
  readonly currentChatMessage = input<Message>();
  @Input() answer!: Message;
  readonly lastIndex = input.required<boolean>();
  readonly chatMessagaeIndex = input<number>();
  readonly answerIndex = input<number>();

  showReactionPopup = false;
  showEmojiBar = false;
  reactionDialogIndicatorbarOpen = false;
  editorOpen = false;
  showFile = false;
  reactionEmojis: string[] = [
    'angry',
    'cool',
    'flushed',
    'hearts',
    'high_five',
    'laughing',
    'thumbs_up',
  ];

  ngOnInit(): void {
    this.boardServ.scrollToBottom(this.boardServ.threadRef);
  }

  toggleFilePreview() {
    this.showFile = !this.showFile;
  }

  ngAfterViewInit(): void {
    this.boardServ.scrollToBottom(this.boardServ.threadRef);
  }

  async updateAllChannels(emojiIdx: number) {
    const channelId = this.currentChannel().id;
    const parentMsgId = this.currentChatMessage()?.id;
    const replyId = this.answer.id;
    if (!channelId || !parentMsgId || !replyId) return;
    const emojiPath = this.reactionEmojis[emojiIdx];
    const reactions = this.answer.reactions.map(r => ({ ...r, userIds: [...r.userIds] }));
    const existingIdx = reactions.findIndex(r => r.emojiPath === emojiPath);
    if (existingIdx >= 0) {
      if (!reactions[existingIdx].userIds.includes(this.boardServ.currentUser.id!)) {
        reactions[existingIdx].userIds.push(this.boardServ.currentUser.id!);
      }
    } else {
      reactions.push({ emojiPath, userIds: [this.boardServ.currentUser.id!] });
    }
    await this.firestoreService.updateReply(channelId, parentMsgId, replyId, { reactions });
  }

  toggleMessageEditor() {
    this.editorOpen = !this.editorOpen;
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
      this.showEmojiBar = !this.showEmojiBar;
    }
  }
}
