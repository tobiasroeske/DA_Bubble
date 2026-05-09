import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  inject,
  input,
  viewChild,
  ChangeDetectionStrategy,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { CreateMessageAreaThreadComponent } from './create-message-area-thread/create-message-area-thread.component';
import { BoardService } from '../../shared/services/board-service/board.service';
import { FirestoreService } from '../../shared/services/firestore-service/firestore.service';
import { Channel } from '../../shared/interfaces/channel.interface';
import { Message } from '../../shared/interfaces/message.interface';
import { AnswerMessageComponent } from './answer-message/answer-message.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-thread',
  imports: [CommonModule, CreateMessageAreaThreadComponent, AnswerMessageComponent],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss',
})
export class ThreadComponent implements AfterViewInit, OnChanges {
  readonly currentChannel = input<Channel>();
  @Input() currentChatMessage?: Message;
  readonly chatMessageIndex = input<number>();
  readonly threadChatField = viewChild.required<ElementRef>('threadChat');
  boardServ = inject(BoardService);
  firestore = inject(FirestoreService);

  specialBlue: string = 'rgba(83, 90, 241, 1)';
  reactionEmojis: string[] = [
    'angry',
    'cool',
    'flushed',
    'hearts',
    'high_five',
    'laughing',
    'thumbs_up',
  ];
  showReactionPopup = false;
  showEmojiBar = false;
  reactionDialogIndicatorbarOpen = false;
  showFile = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentChatMessage'] && this.currentChatMessage?.id) {
      const channelId = this.currentChannel()?.id;
      if (channelId) {
        this.firestore.subscribeToReplies(channelId, this.currentChatMessage.id);
      }
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

  toggleFilePreview() {
    this.showFile = !this.showFile;
  }

  ngAfterViewInit(): void {
    this.boardServ.threadRef = this.threadChatField();
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
