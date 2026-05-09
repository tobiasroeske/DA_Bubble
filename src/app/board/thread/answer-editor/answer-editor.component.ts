import { Component, OnInit, input, ChangeDetectionStrategy } from '@angular/core';
import { MessageEditorComponent } from '../../board-chat-field/message-editor/message-editor.component';
import { FormsModule } from '@angular/forms';
import { Message } from '../../../shared/interfaces/message.interface';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-answer-editor',
  imports: [FormsModule],
  templateUrl: './answer-editor.component.html',
  styleUrl: './answer-editor.component.scss',
})
export class AnswerEditorComponent extends MessageEditorComponent implements OnInit {
  readonly answer = input.required<Message>();
  readonly answerIndex = input.required<number>();

  editedAnswer?: string;

  constructor() {
    super();
  }

  override ngOnInit(): void {
    this.editedAnswer = this.answer().text;
  }

  override async editMessage(_index: number): Promise<void> {
    const reply = this.answer();
    if (!reply.id) return;
    const channel = this.firestore.allChannels()[this.boardServ.idx];
    const channelId = channel?.id;
    const parentMsgId = this.boardServ.currentChatMessage?.id;
    if (!channelId || !parentMsgId) return;
    try {
      await this.firestore.updateReply(channelId, parentMsgId, reply.id, {
        text: this.editedAnswer!,
      });
      this.closeEditor();
    } catch (error) {
      console.error('Error updating reply', error);
    }
  }
}
