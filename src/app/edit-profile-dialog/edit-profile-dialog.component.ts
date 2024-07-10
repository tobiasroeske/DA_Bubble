import { Component, EventEmitter, Output, inject } from '@angular/core';
import { BoardService } from '../shared/services/board.service';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SignupService } from '../shared/services/signup/signup.service';
import { LocalStorageService } from '../shared/services/local-storage-service/local-storage.service';
import { FirestoreService } from '../shared/services/firestore-service/firestore.service';
import { FirebaseStorageService } from '../shared/services/firebase-storage-service/firebase-storage.service';
import { CurrentUser } from '../shared/interfaces/currentUser.interface';
import { Channel } from '../shared/models/channel.class';
import { PrivateChat } from '../shared/models/privateChat.class';

@Component({
  selector: 'app-edit-profile-dialog',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './edit-profile-dialog.component.html',
  styleUrl: './edit-profile-dialog.component.scss'
})
export class EditProfileDialogComponent {
  @Output() editorOpen = new EventEmitter<boolean>();
  boardServ = inject(BoardService);
  authService = inject(SignupService);
  storageService = inject(LocalStorageService);
  firestoreService = inject(FirestoreService);
  firebaseStorageService = inject(FirebaseStorageService);
  fullname: string;
  mail: string;
  avatarPath: string;
  avatars: string[] = ['assets/img/avatar0.png', 'assets/img/avatar1.png', 'assets/img/avatar2.png', 'assets/img/avatar3.png', 'assets/img/avatar4.png', 'assets/img/avatar5.png'];
  changeAvatar = false;
  changesSuccessful = false;
  allChannels: Channel[] = [];
  allDirectMessages: PrivateChat[] = [];

  allMembers: CurrentUser[] = [];



  constructor() {
    this.fullname = this.boardServ.currentUser.name;
    this.mail = this.boardServ.currentUser.email;
    this.avatarPath = this.boardServ.currentUser.avatarPath;
  }


  async onSubmit(ngForm: NgForm): Promise<void> {
    if (ngForm.submitted && ngForm.form.valid) {
      try {
        await this.updateUserProfile();
        await this.updateEmailAndUser();
        await this.updateEntities();
        this.changesSuccessful = true;
      } catch (error) {
        console.error('Error updating profile:', error);
      }
    }
  }

  async onFileChange(event: any): Promise<void> {
    const file = event.target.files[0];
    if (file) {
      const path = `avatarImages/${file.name}`;
      try {
        await this.uploadAvatar(path, file);
      } catch (error) {
        console.error('Error handling file change:', error);
      }
    }
  }

  async updateDirectMessages(): Promise<void> {
    try {
      this.allDirectMessages = this.firestoreService.allDirectMessages;
      for (const dm of this.allDirectMessages) {
        await this.updateDirectMessage(dm);
      }
    } catch (error) {
      console.error('Error updating direct messages:', error);
    }
  }

  private async updateDirectMessage(dm: PrivateChat): Promise<void> {
    if (dm.guest.id === this.boardServ.currentUser.id) {
      dm.guest.name = this.boardServ.currentUser.name;
      dm.guest.avatarPath = this.boardServ.currentUser.avatarPath;
    } else if (dm.creator.id === this.boardServ.currentUser.id) {
      dm.creator.name = this.boardServ.currentUser.name;
      dm.creator.avatarPath = this.boardServ.currentUser.avatarPath;
    }
    for (const chat of dm.chat) {
      this.updateChatUser(chat);
    }
    if (dm.id) {
      await this.firestoreService.updateCompletePrivateMessage(dm.id, dm);
    }
  }

  private updateChatUser(chat: any): void {
    if (chat.user.id === this.boardServ.currentUser.id) {
      chat.user.name = this.boardServ.currentUser.name;
      chat.user.avatarPath = this.boardServ.currentUser.avatarPath;
    }
  }

  private async updateUserProfile(): Promise<void> {
    await this.authService.updateUserProfile({
      displayName: this.fullname,
      photoURL: this.avatarPath
    });
  }

  private async updateEmailAndUser(): Promise<void> {
    const emailChanged = this.mail !== this.authService.auth.currentUser?.email;
    if (emailChanged) {
      await this.authService.updateEmail(this.mail);
      await this.firestoreService.updateUser(
        this.boardServ.currentUser.id,
        this.boardServ.currentUser
      );
    }
  }

  private async updateEntities(): Promise<void> {
    await Promise.all([
      this.updateUsers(),
      this.updateMember(),
      this.updateChatMessage(),
      this.updateDirectMessages()
    ]);
  }

  private async updateUsers(): Promise<void> {
    this.boardServ.currentUser = this.storageService.loadCurrentUser();
    this.boardServ.loadCurrentUser();
  }

  async updateMember(): Promise<void> {
    this.allChannels = this.firestoreService.allExistingChannels;
    for (const chan of this.allChannels) {
      await this.updateChannelMembers(chan);
    }
  }

  private async updateChannelMembers(chan: Channel): Promise<void> {
    for (const member of chan.members) {
      if (member.id === this.boardServ.currentUser.id) {
        member.name = this.boardServ.currentUser.name;
        member.avatarPath = this.boardServ.currentUser.avatarPath;
      }
    }
    if (chan.id) {
      await this.firestoreService.updateChannel(chan.toJSON(), chan.id);
    }
  }

  async updateChatMessage(): Promise<void> {
    this.allChannels.forEach(chan => {
      if (chan.chat) {
        chan.chat.forEach(chat => {
          this.updateChatUser(chat);
        });
        if (chan.id) {
          this.firestoreService.updateChannel(chan.toJSON(), chan.id);
        }
      }
    });
  }

  pickAvatar(i: number): void {
    this.avatarPath = this.avatars[i];
    this.changeAvatar = false;
  }

  closeDialog(): void {
    this.editorOpen.emit(false);
  }

  private async uploadAvatar(path: string, file: any): Promise<void> {
    await this.firebaseStorageService.uploadFile(path, file);
    this.avatarPath = await this.firebaseStorageService.getDownloadUrl(path);
    this.changeAvatar = false;
  }

}
