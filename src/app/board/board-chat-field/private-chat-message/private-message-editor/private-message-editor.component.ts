import { Component, input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { MessageEditorComponent } from '../../message-editor/message-editor.component';
import { FormsModule } from '@angular/forms';

import { PrivateChat } from '../../../../shared/models/privateChat.class';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-private-message-editor',
  imports: [FormsModule],
  templateUrl: './private-message-editor.component.html',
  styleUrl: './private-message-editor.component.scss',
})
export class PrivateMessageEditorComponent extends MessageEditorComponent {
  readonly privateChat = input.required<PrivateChat>();

  constructor() {
    super();
  }

  override async editMessage(index: number) {
    const chatMsg = this.chat();
    if (!chatMsg) return;
    chatMsg.message = this.editedMessage!;
    this.privateChat().chat.splice(index, 1, chatMsg);
    await this.firestore.updateCompletePrivateMessage(this.privateChat().id!, this.privateChat());
  }
}
