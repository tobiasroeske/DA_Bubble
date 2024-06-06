import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Host, HostListener, Input, Output, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatMessage } from '../../shared/interfaces/chatMessage.interface';
import { BoardService } from '../board.service';
import { FirestoreService } from '../../shared/services/firestore-service/firestore.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { Channel } from '../../shared/models/channel.class';
import { CurrentUser } from '../../shared/interfaces/currentUser.interface';
import { FirebaseStorageService } from '../../shared/services/firebase-storage-service/firebase-storage.service';



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
  fbStorageService = inject(FirebaseStorageService)
  textMessage: string = '';
  memberToTag: string = '';
  channelToTag: string = '';
  message!: ChatMessage;
  currentUser: any;
  shiftPressed = false;
  enterPressed = false;
  tagMembers = false;
  tagChannels = false;
  fileSizeToGreat = false;
  filteredMembers: CurrentUser[] = []
  filteredChannels: Channel[] = [];
  uploadedFile: string = '';
  filePath: string = '';

  @ViewChild('fileInput') fileInput!: ElementRef;
  @Input() index!: number;
  @Input() channelId!: string;
  @Input() channelTitle!: string;
  @Input() channels!: Channel[];


  preview = 'false';
  @Input() showEmojiPicker = false;

  constructor() {
    this.currentUser = this.boardService.currentUser;
    this.filteredChannels = this.channels;
  }

  async onFileChange(event: any) {
    this.fileSizeToGreat = false;
    let file = event.target.files[0];
    if (file && file.size <= 500000) {
      this.filePath = `fileUploads/${file.name}`;
      await this.uploadFile(this.filePath, file)
        .then(() => {
          this.fileInput.nativeElement.value = ''; // so the next event change can get detected
        })
    } else {
      this.fileSizeToGreat = true;
    }
  }

  async uploadFile(path: string, file: File) {
    await this.fbStorageService.uploadFile(path, file)
      .then(() => {
        this.fbStorageService.getDownLoadUrl(path)
          .then(url => {
            this.uploadedFile = url;
<<<<<<< HEAD
=======
            console.log(this.uploadedFile);
>>>>>>> bebcfcc5d2708e12eb8bbba91ffd95e94bc6b63f
          })
      })
  }

  async deleteFile() {
<<<<<<< HEAD
    await this.fbStorageService.deleteFile(this.uploadedFile)
      .then(() => this.uploadedFile = '');
=======
    await this.fbStorageService.deleteFile(this.filePath)
      .then(() => {
        this.uploadedFile = '';
        this.filePath = '';
        console.log(this.uploadedFile);
      });
>>>>>>> bebcfcc5d2708e12eb8bbba91ffd95e94bc6b63f

  }

  addEmoji(event: any) {
    this.textMessage = this.textMessage + event.emoji.native;
  }

  toggleTagMemberDialog() {
    this.filteredMembers = this.firestoreService.allChannels[this.boardService.idx].members;
    this.tagMembers = !this.tagMembers
  }

  tagMember(i: number) {
    if (this.memberToTag.length > 0) {
      this.removeStringToTagFromTextMessage(this.memberToTag);
    }
    let member = this.filteredMembers[i];
    this.textMessage += ` @${member.name} `;
    this.tagMembers = false;
    this.memberToTag = '';
  }

  tagChannel(i: number) {
    if (this.channelToTag.length > 0) {
      this.removeStringToTagFromTextMessage(this.channelToTag);
    }
    let channel = this.filteredChannels[i];
    this.textMessage += ` #${channel.title}`;
    this.tagChannels = false;
    this.channelToTag = '';
  }

  removeStringToTagFromTextMessage(string: string) {
    let regex = new RegExp(`${string}`, 'gi');
    this.textMessage = this.textMessage.replace(regex, '').trim();
    string = '';
  }

  sendMessage() {
    if (this.textMessage.length > 0 || this.uploadedFile.length > 0) {
      let date = new Date().getTime();
      this.firestoreService.updateChats(this.channelId, this.setMessageObject(date))
        .then(() => {
          this.resetTextArea();
          this.boardService.scrollToBottom(this.boardService.chatFieldRef);
        })
    }
  }

  resetTextArea() {
    this.textMessage = '';
    this.uploadedFile = '';
    this.filePath = '';
    this.boardService.showEmojiPicker = false;
  }

  @HostListener('keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    let { key } = event;
    if (key === 'Shift') {
      this.shiftPressed = true;
    } else if (key === 'Enter') {
      this.enterPressed = true;
    } else if (key === 'Backspace') {
      if (this.tagMembers) {
        this.memberToTag = this.memberToTag.slice(0, -1);
        this.filterMember();
        this.tagMembers = this.memberToTag.length !== 0;
      }
      if (this.tagChannels) {
        this.channelToTag = this.channelToTag.slice(0, -1);
        this.filterChannels();
        this.tagChannels = this.channelToTag.length !== 0;
      }
    }
    this.checkShiftEnter();
  }

  @HostListener('keypress', ['$event'])
  handleKeyPress(event: KeyboardEvent): void {
    let { key } = event;
    if (key === '@') {
      this.tagMembers = !this.tagMembers;
      if (this.tagMembers) {
        this.memberToTag = '';
      }
    } else if (key === '#') {
      this.tagChannels = true;
    }
    if (this.tagMembers) {
      this.memberToTag += key;
      this.filterMember();
    }
    if (this.tagChannels) {
      this.channelToTag += key;
      this.filterChannels();
    }
  }

  filterMember() {
    let members: CurrentUser[] = this.firestoreService.allChannels[this.boardService.idx].members
    let lowerCaseTag = this.memberToTag.slice(1).toLowerCase();
    this.filteredMembers = members.filter(member => member.name.toLowerCase().includes(lowerCaseTag))
  }

  filterChannels() {
    let channels: Channel[] = this.firestoreService.allChannels;
    let lowerCaseTag = this.channelToTag.slice(1).toLowerCase();
    this.filteredChannels = channels.filter(channel => channel.title.toLowerCase().includes(lowerCaseTag));
  }

  @HostListener('keyup', ['$event'])
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
      fileUpload: this.uploadedFile
    }
  }
}
