import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { CreateMessageAreaThreadComponent } from './create-message-area-thread/create-message-area-thread.component';
import { BoardService } from '../board.service';
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
export class ThreadComponent {
  @Input() currentChannel?: Channel
  @Input() currentChatMessage?: ChatMessage;
  boardServ = inject(BoardService)
  specialBlue: string = "rgba(83, 90, 241, 1)"
}
