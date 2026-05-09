import { Component, inject, input, ChangeDetectionStrategy } from '@angular/core';
import { MessageEditorComponent } from '../../message-editor/message-editor.component';
import { FormsModule } from '@angular/forms';
import { BoardService } from '../../../../shared/services/board-service/board.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-private-message-editor',
  imports: [FormsModule],
  templateUrl: './private-message-editor.component.html',
  styleUrl: './private-message-editor.component.scss',
})
export class PrivateMessageEditorComponent extends MessageEditorComponent {
  readonly dmId = input<string>('');
  private boardServ2 = inject(BoardService);

  constructor() {
    super();
  }

  override async editMessage(_index: number) {
    const chatMsg = this.chat();
    if (!chatMsg?.id) return;
    const dmId = this.dmId() || this.boardServ2.privateChatId;
    if (!dmId) return;
    await this.firestore.updateDmMessage(dmId, chatMsg.id, { text: this.editedMessage! });
    this.closeEditor();
  }
}
