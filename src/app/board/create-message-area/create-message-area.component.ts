import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Host, HostListener, Input, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatMessage } from '../../shared/interfaces/chatMessage.interface';
import { BoardService } from '../board.service';
import { FirestoreService } from '../../shared/services/firestore-service/firestore.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { Channel } from '../../shared/models/channel.class';
import { CurrentUser } from '../../shared/interfaces/currentUser.interface';



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
  memberToTag: string = '';
  message!: ChatMessage;
  currentUser: any;
  shiftPressed = false;
  enterPressed = false;
  tagMembers = false;
  filteredMembers: CurrentUser[] = []
  @Input() index!: number;
  @Input() channelId!: string;
  @Input() channelTitle!: string;
  

  preview = 'false';
  @Input() showEmojiPicker = false;

  constructor() {
    this.currentUser = this.boardService.currentUser;
    
  }

  addEmoji(event: any) {
    this.textMessage = this.textMessage + event.emoji.native;
    console.log(event);
  }

  toggleTagMemberDialog() {
    this.filteredMembers = this.firestoreService.allChannels[this.boardService.idx].members;
    this.tagMembers = !this.tagMembers
  }

  tagMember(i:number) {
    if (this.memberToTag.length > 0) {
      this.removeMemberToTagFromTextMessage();
    }
    let member = this.filteredMembers[i];
    this.textMessage += `@${member.name} `;
    this.tagMembers = false;
  }

  removeMemberToTagFromTextMessage() {
    let regex = new RegExp(`${this.memberToTag}`, 'gi');
    console.log(regex);
    
    this.textMessage = this.textMessage.replace(regex, '').trim();
    this.memberToTag = '';
  }

  sendMessage() {
    if (this.textMessage.length > 0) {
      let date = new Date().getTime();
      this.firestoreService.updateChats(this.channelId, this.setMessageObject(date))
      .then(() => {
        this.textMessage = ''
        this.boardService.showEmojiPicker = false;
        this.boardService.scrollToBottom(this.boardService.chatFieldRef)
        
      })
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
    if (this.tagMembers && event.key === 'Backspace') {
      this.memberToTag = this.memberToTag.slice(0, -1);
      this.filterMember();
      if (this.memberToTag.length == 0) {
        this.tagMembers = false;
        console.log('es ist vorbei');
        
      }
    }
    this.checkShiftEnter();
  }

  @HostListener('window:keypress', ['$event']) 
  handleKeyPress(event: KeyboardEvent) {
    if (event.key === '@') {
      this.tagMembers = true;
    }
    if (this.tagMembers) {
      this.memberToTag += event.key;
      this.filterMember()
    }
  }

  filterMember() {
    let members: CurrentUser[] = this.firestoreService.allChannels[this.boardService.idx].members
    let lowerCaseTag = this.memberToTag.slice(1).toLowerCase();
    this.filteredMembers = members.filter(member => member.name.toLowerCase().includes(lowerCaseTag))
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
