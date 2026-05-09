import {
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  viewChild,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Message } from '../../shared/interfaces/message.interface';
import { AppNotification, UserProfile } from '../../shared/interfaces/user.interface';
import { Channel } from '../../shared/interfaces/channel.interface';
import { BoardService } from '../../shared/services/board-service/board.service';
import { FirestoreService } from '../../shared/services/firestore-service/firestore.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { FirebaseStorageService } from '../../shared/services/firebase-storage-service/firebase-storage.service';
import { SignupService } from '../../shared/services/signup/signup.service';
import { LocalStorageService } from '../../shared/services/local-storage-service/local-storage.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-create-message-area',
  imports: [FormsModule, PickerComponent],
  templateUrl: './create-message-area.component.html',
  styleUrl: './create-message-area.component.scss',
})
export class CreateMessageAreaComponent {
  readonly fileInput = viewChild.required<ElementRef>('fileInput');
  readonly index = input<number>(0);
  readonly channelId = input<string>('');
  readonly channelTitle = input<string>('');
  readonly channels = input<Channel[]>([]);
  readonly showEmojiPicker = input(false);

  boardService = inject(BoardService);
  signUpServ = inject(SignupService);
  firestoreService = inject(FirestoreService);
  fbStorageService = inject(FirebaseStorageService);
  localStorageServ = inject(LocalStorageService);

  textMessage: string = '';
  memberToTag: string = '';
  channelToTag: string = '';
  shiftPressed = false;
  enterPressed = false;
  tagMembers = false;
  tagChannels = false;
  fileSizeToGreat = false;
  filteredMembers: UserProfile[] = [];
  filteredChannels: Channel[] = [];
  uploadedFile: string = '';
  filePath: string = '';
  preview = false;
  member: UserProfile | null = null;

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
    this.filteredChannels = this.channels();
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

  async onFileChange(event: any): Promise<void> {
    this.fileSizeToGreat = false;
    const file = event.target.files[0];
    if (file && file.size <= 500000) {
      this.filePath = `fileUploads/${file.name}`;
      try {
        await this.uploadFile(this.filePath, file);
        this.fileInput().nativeElement.value = '';
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    } else {
      this.fileSizeToGreat = true;
    }
  }

  async uploadFile(path: string, file: File) {
    try {
      await this.fbStorageService.uploadFile(path, file);
      const url = await this.fbStorageService.getDownloadUrl(path);
      this.uploadedFile = url;
    } catch (err) {
      console.error('Error uploading and fetching download URL:', err);
    }
  }

  async deleteFile(): Promise<void> {
    try {
      await this.fbStorageService.deleteFile(this.filePath);
      this.uploadedFile = '';
      this.filePath = '';
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  }

  addEmoji(event: any) {
    this.textMessage = this.textMessage + event.emoji.native;
  }

  toggleTagMemberDialog() {
    const channel = this.firestoreService.allChannels()[this.boardService.idx];
    const allUsers = this.firestoreService.userList();
    this.filteredMembers = (channel?.memberIds ?? [])
      .map(id => allUsers.find(u => u.id === id))
      .filter((u): u is UserProfile => !!u);
    this.tagMembers = !this.tagMembers;
  }

  tagMember(i: number) {
    if (this.memberToTag.length > 0) {
      this.removeStringToTagFromTextMessage(this.memberToTag);
    }
    this.member = this.filteredMembers[i];
    this.textMessage += ` @${this.member.name} `;
    this.tagMembers = false;
    this.memberToTag = '';
  }

  tagChannel(i: number, event: Event) {
    if (this.channelToTag.length > 0) {
      this.removeStringToTagFromTextMessage(this.channelToTag);
    }
    const channel = this.filteredChannels[i];
    const channelIndex = this.findIndexOfChannel(channel);
    this.boardService.showChannelInChatField(channelIndex, event);
    this.tagChannels = false;
    this.channelToTag = '';
  }

  findIndexOfChannel(channel: Channel) {
    const allChannels = this.firestoreService.allChannels();
    return allChannels.findIndex(c => c.id === channel.id);
  }

  removeStringToTagFromTextMessage(string: string) {
    const regex = new RegExp(`${string}`, 'gi');
    this.textMessage = this.textMessage.replace(regex, '').trim();
  }

  async sendMessage() {
    if (this.textMessage.length > 0 || this.uploadedFile.length > 0) {
      try {
        const channelId = this.channelId();
        await this.firestoreService.addChannelMessage(channelId, this.buildMessage());
        if (this.member?.id) {
          const notification = this.buildNotification(this.member);
          await this.firestoreService.addNotification(this.member.id, notification);
        }
        this.resetTextArea();
        this.boardService.scrollToBottom(this.boardService.chatFieldRef);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  }

  buildMessage(): Omit<Message, 'id'> {
    const currentUser = this.boardService.currentUser;
    return {
      text: this.textMessage,
      author: {
        id: currentUser.id!,
        name: currentUser.name,
        avatarPath: currentUser.avatarPath,
      },
      timestamp: Date.now(),
      reactions: [],
      replyCount: 0,
      fileUpload: this.uploadedFile || '',
    };
  }

  buildNotification(member: UserProfile): AppNotification {
    const currentUser = this.boardService.currentUser;
    return {
      id: crypto.randomUUID(),
      date: Date.now(),
      channelId: this.channelId(),
      channelName: this.channelTitle(),
      senderId: currentUser.id ?? '',
      senderName: currentUser.name,
      senderAvatarPath: currentUser.avatarPath,
      message: this.textMessage,
      isRead: false,
    };
  }

  resetTextArea() {
    this.textMessage = '';
    this.uploadedFile = '';
    this.filePath = '';
    this.boardService.showEmojiPicker.set(false);
    this.member = null;
  }

  filterMember() {
    const channel = this.firestoreService.allChannels()[this.boardService.idx];
    const allUsers = this.firestoreService.userList();
    const members = (channel?.memberIds ?? [])
      .map(id => allUsers.find(u => u.id === id))
      .filter((u): u is UserProfile => !!u);
    const lowerCaseTag = this.memberToTag.slice(1).toLowerCase();
    this.filteredMembers = members.filter(m => m.name.toLowerCase().includes(lowerCaseTag));
  }

  filterChannels() {
    const channels: Channel[] = this.firestoreService.allChannels();
    const lowerCaseTag = this.channelToTag.slice(1).toLowerCase();
    this.filteredChannels = channels.filter(channel =>
      channel.title.toLowerCase().includes(lowerCaseTag)
    );
  }

  checkShiftEnter() {
    if (this.shiftPressed && this.enterPressed) {
      return;
    } else if (this.enterPressed) {
      this.sendMessage();
    }
  }

  setMessageObject(date: number): Omit<Message, 'id'> {
    const currentUser = this.boardService.currentUser;
    return {
      text: this.textMessage,
      author: {
        id: currentUser.id!,
        name: currentUser.name,
        avatarPath: currentUser.avatarPath,
      },
      timestamp: date,
      reactions: [],
      replyCount: 0,
      fileUpload: this.uploadedFile,
    };
  }
}
