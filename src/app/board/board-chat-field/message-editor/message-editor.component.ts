import { Component, EventEmitter, OnInit, Output, inject, input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatMessage } from '../../../shared/interfaces/chatMessage.interface';
import { FirestoreService } from '../../../shared/services/firestore-service/firestore.service';
import { BoardService } from '../../../shared/services/board-service/board.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { emojis } from '@ctrl/ngx-emoji-mart/ngx-emoji';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-message-editor',
  imports: [FormsModule, PickerComponent],
  templateUrl: './message-editor.component.html',
  styleUrl: './message-editor.component.scss',
})
export class MessageEditorComponent implements OnInit {
  readonly chatMessageIndex = input<number>(0);
  readonly chat = input<ChatMessage | undefined>(undefined);
  @Output() editorOpen = new EventEmitter<boolean>();
  @Output() emojiPickerOpen = new EventEmitter<boolean>();

  firestore = inject(FirestoreService);
  boardServ = inject(BoardService);

  editedMessage?: string;
  currentChannel!: any;
  showEmojiPicker = false;

  ngOnInit(): void {
    this.editedMessage = this.chat()?.message;
  }

  async editMessage(index: number) {
    const chatMsg = this.chat();
    if (!chatMsg) return;
    this.currentChannel = this.firestore.allChannels()[this.boardServ.idx];
    chatMsg.message = this.editedMessage!;
    this.currentChannel.chat.splice(index, 1, chatMsg);
    await this.firestore.updateChannel(this.currentChannel, this.currentChannel.id);
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
