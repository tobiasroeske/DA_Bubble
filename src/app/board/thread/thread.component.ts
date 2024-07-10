import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, Input, ViewChild, inject } from '@angular/core';
import { CreateMessageAreaThreadComponent } from './create-message-area-thread/create-message-area-thread.component';
import { BoardService } from '../../shared/services/board-service/board.service';
import { Channel } from '../../shared/models/channel.class';
import { ChatMessage } from '../../shared/interfaces/chatMessage.interface';
import { AnswerMessageComponent } from './answer-message/answer-message.component';
@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [CommonModule, CreateMessageAreaThreadComponent, AnswerMessageComponent],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent implements AfterViewInit{
  @Input() currentChannel?: Channel
  @Input() currentChatMessage?: ChatMessage;
  @Input() chatMessageIndex?:number;
  @ViewChild('threadChat') threadChatField!: ElementRef;
  boardServ = inject(BoardService)

  specialBlue: string = "rgba(83, 90, 241, 1)"
  reactionEmojis: string[] = ['angry', 'cool', 'flushed', 'hearts', 'high_five', 'laughing', 'thumbs_up'];
  showReactionPopup = false;
  showEmojiBar = false
  reactionDialogIndicatorbarOpen = false;
  showFile = false;

  

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
    this.boardServ.threadRef = this.threadChatField;
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
