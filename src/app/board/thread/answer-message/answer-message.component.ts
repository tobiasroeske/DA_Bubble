import { Component, Input, inject } from '@angular/core';
import { ChatMessage } from '../../../shared/interfaces/chatMessage.interface';
import { Channel } from '../../../shared/models/channel.class';
import { BoardService } from '../../board.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-answer-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './answer-message.component.html',
  styleUrl: './answer-message.component.scss'
})
export class AnswerMessageComponent {
  @Input() currentChannel?: Channel
  @Input() currentChatMessage?: ChatMessage;
  @Input() answer!: ChatMessage;
  @Input() lastIndex!:boolean;
  boardServ = inject(BoardService)

  
}
