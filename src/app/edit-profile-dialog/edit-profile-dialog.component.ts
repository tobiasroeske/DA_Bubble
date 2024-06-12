import { Component, EventEmitter, Output, inject } from '@angular/core';
import { BoardService } from '../board/board.service';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SignupService } from '../shared/services/signup/signup.service';
import { LocalStorageService } from '../shared/services/local-storage-service/local-storage.service';
import { FirestoreService } from '../shared/services/firestore-service/firestore.service';
import { FirebaseStorageService } from '../shared/services/firebase-storage-service/firebase-storage.service';

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

  constructor() {
    this.fullname = this.boardServ.currentUser.name;
    this.mail = this.boardServ.currentUser.email;
    this.avatarPath = this.boardServ.currentUser.avatarPath;
  }


  async onsubmit(ngForm: NgForm) {
    if (ngForm.submitted && ngForm.form.valid) {
      await this.authService.updateUserProfile({ displayName: this.fullname, photoURL: this.avatarPath })
        .then(() => {
          let emailChanged = this.mail != this.authService.auth.currentUser?.email
          if (emailChanged) {
            this.authService.updateEmail(this.mail)
          }
        })
        .then(() => {
          this.updateUsers().then(() => this.changesSuccessful = true)
        })
    }
  }

  onFileChange(event: any) {
    let file = event.target.files[0];
    if (file) {
      let path = `avatarImages/${file.name}`;
      this.firebaseStorageService.uploadFile(path, file)
      .then(() => {
        this.firebaseStorageService.getDownLoadUrl(path)
        .then(url => {
          this.avatarPath = url;
          this.changeAvatar = false;
        })
        .catch(err => console.error(err))
      })
    }
  }

  async updateUsers() {
    this.boardServ.currentUser = this.storageService.loadCurrentUser();
    await this.firestoreService.updateUser(this.boardServ.currentUser.id, this.boardServ.currentUser);
  }

  pickAvatar(i: number) {
    this.avatarPath = this.avatars[i];
    this.changeAvatar = false;
  }

  closeDialog() {
    this.editorOpen.emit(false);
  }

}
