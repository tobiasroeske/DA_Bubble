import { Component, OnInit, input, ChangeDetectionStrategy } from '@angular/core';
import { MessageEditorComponent } from '../../board-chat-field/message-editor/message-editor.component';

import { FormsModule } from '@angular/forms';
import { ChatMessage } from '../../../shared/interfaces/chatMessage.interface';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-answer-editor',
  imports: [FormsModule],
  templateUrl: './answer-editor.component.html',
  styleUrl: './answer-editor.component.scss',
})
export class AnswerEditorComponent extends MessageEditorComponent implements OnInit {
  readonly answer = input.required<ChatMessage>();
  readonly answerIndex = input.required<number>();

  editedAnswer?: string;

  constructor() {
    super();
  }

  override ngOnInit(): void {
    this.editedAnswer = this.answer().message;
  }

  override async editMessage(index: number): Promise<void> {
    this.currentChannel = this.firestore.allChannels()[this.boardServ.idx];
    this.answer().message = this.editedAnswer!;
    try {
      await this.firestore.updateChannel(this.currentChannel, this.currentChannel.id);
      this.closeEditor();
    } catch (error) {
      console.error('Error updating channel', error);
    }
  }
}
