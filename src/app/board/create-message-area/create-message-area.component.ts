import { CommonModule } from '@angular/common';
import { Component, HostListener, Input, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatMessage } from '../../shared/interfaces/chatMessage.interface';
import { BoardService } from '../board.service';
import { FirestoreService } from '../../shared/services/firestore-service/firestore.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';


@Component({
  selector: 'app-create-message-area',
  standalone: true,
  imports: [CommonModule, FormsModule, PickerComponent],
  templateUrl: './create-message-area.component.html',
  styleUrl: './create-message-area.component.scss'
})
export class CreateMessageAreaComponent {
  boardService = inject(BoardService);
  firestoreService = inject(FirestoreService);
  textMessage: string = '';
  message!: ChatMessage;
  currentUser: any;
  shiftPressed = false;
  enterPressed = false;
  @Input() index!: number;
  @Input() channelId!: string;
  @Input() channelTitle!: string;
  preview = 'false';

  constructor() {
    this.currentUser = this.boardService.currentUser;
  }

  addEmoji(event:any) {
    console.log(event);
    
  }

  sendMessage() {
    if (this.textMessage.length > 0) {
      let date = new Date().getTime();
      this.firestoreService.updateChats(this.channelId, this.setMessageObject(date))
      .then(() => this.textMessage = '')
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Shift') {
      this.shiftPressed = true;
    }
    if (event.key === 'Enter') {
      this.enterPressed = true;
    }
    this.checkShiftEnter();
  }

  @HostListener('window:keyup', ['$event'])
  handleKeyUp(event: KeyboardEvent): void {
    if (event.key === 'Shift') {
      this.shiftPressed = false;
    }
    if (event.key === 'Enter') {
      this.enterPressed = false;
    }
  }

  checkShiftEnter() {
    if (this.shiftPressed && this.enterPressed) {
      console.log('beide Tasten gedrückt');
      return;
    } else if (this.enterPressed) {
      this.sendMessage();
    }
  }

  setMessageObject(date: number): ChatMessage {
    return {
    date: date,
    user: this.currentUser,
    message: this.textMessage,
    answers: [],
    reactions: [],
    }
  }
}
