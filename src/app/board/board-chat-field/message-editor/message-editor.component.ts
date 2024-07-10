import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatMessage } from '../../../shared/interfaces/chatMessage.interface';
import { FirestoreService } from '../../../shared/services/firestore-service/firestore.service';
import { BoardService } from '../../../shared/services/board-service/board.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { emojis } from '@ctrl/ngx-emoji-mart/ngx-emoji';

@Component({
  selector: 'app-message-editor',
  standalone: true,
  imports: [FormsModule, PickerComponent],
  templateUrl: './message-editor.component.html',
  styleUrl: './message-editor.component.scss'
})
export class MessageEditorComponent implements OnInit {
  @Input() chatMessageIndex!: number;
  @Input() chat!: ChatMessage;
  @Output() editorOpen = new EventEmitter<boolean>();
  @Output() emojiPickerOpen = new EventEmitter<boolean>();

  firestore = inject(FirestoreService);
  boardServ = inject(BoardService);

  editedMessage?: string;
  currentChannel!: any;
  showEmojiPicker = false;

  ngOnInit(): void {
    this.editedMessage = this.chat.message;
  }

  async editMessage(index: number) {
    this.currentChannel = this.firestore.allChannels[this.boardServ.idx];
    this.chat.message = this.editedMessage!;
    this.currentChannel.chat.splice(index, 1, this.chat);
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
