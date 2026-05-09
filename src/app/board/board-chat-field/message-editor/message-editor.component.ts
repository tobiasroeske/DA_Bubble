import {
  Component,
  EventEmitter,
  OnInit,
  Output,
  inject,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Message } from '../../../shared/interfaces/message.interface';
import { FirestoreService } from '../../../shared/services/firestore-service/firestore.service';
import { BoardService } from '../../../shared/services/board-service/board.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-message-editor',
  imports: [FormsModule, PickerComponent],
  templateUrl: './message-editor.component.html',
  styleUrl: './message-editor.component.scss',
})
export class MessageEditorComponent implements OnInit {
  readonly chatMessageIndex = input<number>(0);
  readonly chat = input<Message | undefined>(undefined);
  @Output() editorOpen = new EventEmitter<boolean>();
  @Output() emojiPickerOpen = new EventEmitter<boolean>();

  firestore = inject(FirestoreService);
  boardServ = inject(BoardService);

  editedMessage?: string;
  showEmojiPicker = false;

  ngOnInit(): void {
    this.editedMessage = this.chat()?.text;
  }

  async editMessage(_index: number) {
    const chatMsg = this.chat();
    if (!chatMsg?.id) return;
    const channelId = this.firestore.allChannels()[this.boardServ.idx]?.id;
    if (!channelId) return;
    await this.firestore.updateChannelMessage(channelId, chatMsg.id, { text: this.editedMessage! });
    this.closeEditor();
  }

  closeEmojiDialog() {
    this.showEmojiPicker = false;
  }

  addEmoji(event: any) {
    this.editedMessage = this.editedMessage + event.emoji.native;
  }

  toggleEmojiPicker(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.emojiPickerOpen.emit(true);
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  closeEditor() {
    this.editorOpen.emit(false);
  }
}
