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
  @ViewChild('fileInput') fileInput!: ElementRef;
  @Input() index!: number;
  @Input() channelId!: string;
  @Input() channelTitle!: string;
  @Input() channels!: Channel[];
  @Input() showEmojiPicker = false;

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
  preview = 'false';
  member: CurrentUser | null = null;

  @HostListener('keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    const { key } = event;
    if (key === 'Shift') {
      this.handleShiftKey(true);
    } else if (key === 'Enter') {
      this.handleEnterKey(true);
    } else if (key === 'Backspace') {
      this.handleBackspaceKey();
    }
    this.checkShiftEnter();
  }

  @HostListener('keypress', ['$event'])
  handleKeyPress(event: KeyboardEvent): void {
    const { key } = event;
    if (key === '@') {
      this.toggleTagMembers();
    } else if (key === '#') {
      this.tagChannels = true;
    }
    if (this.tagMembers) {
      this.handleTaggingMembers(key);
    }
    if (this.tagChannels) {
      this.handleTaggingChannels(key);
    }
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

  constructor() {
    this.currentUser = this.boardService.currentUser;
    this.filteredChannels = this.channels;
  }

  toggleTagMembers(): void {
    this.tagMembers = !this.tagMembers;
    if (this.tagMembers) {
      this.memberToTag = '';
    }
  }

  handleTaggingMembers(key: string): void {
    this.memberToTag += key;
    this.filterMember();
  }

  handleTaggingChannels(key: string): void {
    this.channelToTag += key;
    this.filterChannels();
  }

  handleShiftKey(pressed: boolean): void {
    this.shiftPressed = pressed;
  }

  handleEnterKey(pressed: boolean): void {
    this.enterPressed = pressed;
  }

  handleBackspaceKey(): void {
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

  async onFileChange(event: any) {
    this.fileSizeToGreat = false;
    let file = event.target.files[0];
    if (file && file.size <= 500000) {
      this.filePath = `fileUploads/${file.name}`;
      await this.uploadFile(this.filePath, file)
        .then(() => {
          this.fileInput.nativeElement.value = '';
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
            console.log(this.uploadedFile);
          })
      })
  }

  async deleteFile() {
    await this.fbStorageService.deleteFile(this.filePath)
      .then(() => {
        this.uploadedFile = '';
        this.filePath = '';
        console.log(this.uploadedFile);
      });
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
    this.member = this.filteredMembers[i];
    this.textMessage += ` @${this.member.name} `;
    this.tagMembers = false;
    this.memberToTag = '';
    console.log(this.member);
    console.log(this.channels[this.boardService.idx]);
    console.log(this.boardService.currentUser);
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
          if (this.member != null) {
            console.log('member beim senden', this.member);
          }
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
    this.member = null;
    console.log('member nach dem senden', this.member);
    
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
      fileUpload: this.uploadedFile,
      type: 'ChatMessage'
    }
  }
}
