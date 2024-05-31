import { Component, Input, OnInit } from '@angular/core';
import { MessageEditorComponent } from '../../board-chat-field/message-editor/message-editor.component';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatMessage } from '../../../shared/interfaces/chatMessage.interface';

@Component({
  selector: 'app-answer-editor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './answer-editor.component.html',
  styleUrl: './answer-editor.component.scss'
})
export class AnswerEditorComponent extends MessageEditorComponent implements OnInit{
  @Input() answer!: ChatMessage;
  @Input() answerIndex!: number;
  editedAnswer?: string

  constructor() {
    super();
  }

  override ngOnInit(): void {
    this.editedAnswer = this.answer.message;
  }

  override editMessage(index: number):void {
    this.currentChannel = this.firestore.allChannels[this.boardServ.idx];
    this.answer.message = this.editedAnswer!;
    this.firestore.updateChannel(this.currentChannel, this.currentChannel.id)
    .then(() => this.closeEditor())
  }
  
}
