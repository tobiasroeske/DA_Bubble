import { Component, EventEmitter, Output, inject, ChangeDetectionStrategy } from '@angular/core';
import { BoardService } from '../shared/services/board-service/board.service';
import { FormsModule, NgForm } from '@angular/forms';

import { SignupService } from '../shared/services/signup/signup.service';
import { LocalStorageService } from '../shared/services/local-storage-service/local-storage.service';
import { FirestoreService } from '../shared/services/firestore-service/firestore.service';
import { FirebaseStorageService } from '../shared/services/firebase-storage-service/firebase-storage.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-edit-profile-dialog',
  imports: [FormsModule],
  templateUrl: './edit-profile-dialog.component.html',
  styleUrl: './edit-profile-dialog.component.scss',
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
  avatars: string[] = [
    'assets/img/avatar0.png',
    'assets/img/avatar1.png',
    'assets/img/avatar2.png',
    'assets/img/avatar3.png',
    'assets/img/avatar4.png',
    'assets/img/avatar5.png',
  ];
  changeAvatar = false;
  changesSuccessful = false;

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
        await this.updateUserDocument();
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

  private async updateUserProfile(): Promise<void> {
    await this.authService.updateUserProfile({
      displayName: this.fullname,
      photoURL: this.avatarPath,
    });
  }

  private async updateEmailAndUser(): Promise<void> {
    const emailChanged = this.mail !== this.authService.auth.currentUser?.email;
    if (emailChanged) {
      await this.authService.updateEmail(this.mail);
    }
  }

  private async updateUserDocument(): Promise<void> {
    const userId = this.boardServ.currentUser.id;
    if (userId) {
      await this.firestoreService.updateUser(userId, {
        name: this.fullname,
        email: this.mail,
        avatarPath: this.avatarPath,
      });
    }
    this.boardServ.currentUser.name = this.fullname;
    this.boardServ.currentUser.email = this.mail;
    this.boardServ.currentUser.avatarPath = this.avatarPath;
    this.storageService.saveCurrentUser(this.boardServ.currentUser);
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
