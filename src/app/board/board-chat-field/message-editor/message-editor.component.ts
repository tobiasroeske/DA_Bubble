import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatMessage } from '../../../shared/interfaces/chatMessage.interface';
import { FirestoreService } from '../../../shared/services/firestore-service/firestore.service';
import { BoardService } from '../../board.service';

@Component({
  selector: 'app-message-editor',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './message-editor.component.html',
  styleUrl: './message-editor.component.scss'
})
export class MessageEditorComponent implements OnInit{
 @Input() chatMessageIndex!: number;
 @Input() chat!: ChatMessage;
 firestore = inject(FirestoreService);
 boardServ = inject(BoardService);
 editedMessage?: string;
 @Output() editorOpen = new EventEmitter<boolean>();
 currentChannel!: any;

 ngOnInit(): void {
   this.editedMessage = this.chat.message;
 }


 editMessage(index:number) {
  this.currentChannel = this.firestore.allChannels[this.boardServ.idx];
  this.chat.message = this.editedMessage!;
  this.currentChannel.chat.splice(index, 1, this.chat);
  this.firestore.updateChannel(this.currentChannel, this.currentChannel.id)
  .then(() => this.closeEditor());
}

closeEditor() {
  this.editorOpen.emit(false);
}
}
