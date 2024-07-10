import { Component, Input } from '@angular/core';
import { MessageEditorComponent } from '../../message-editor/message-editor.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PrivateChat } from '../../../../shared/models/privateChat.class';

@Component({
  selector: 'app-private-message-editor',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './private-message-editor.component.html',
  styleUrl: './private-message-editor.component.scss'
})
export class PrivateMessageEditorComponent extends MessageEditorComponent {
  @Input() privateChat!: PrivateChat;

  constructor() {
    super();
  }

  override async editMessage(index: number) {
    this.chat.message = this.editedMessage!;
    this.privateChat.chat.splice(index, 1, this.chat)
    await this.firestore.updateCompletePrivateMessage(this.privateChat.id!, this.privateChat)
  }
}
