import { Component, inject } from '@angular/core';
import { BoardService } from '../board/board.service';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SignupService } from '../shared/services/signup/signup.service';
import { LocalStorageService } from '../shared/services/local-storage-service/local-storage.service';
import { FirestoreService } from '../shared/services/firestore-service/firestore.service';

@Component({
  selector: 'app-edit-profile-dialog',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './edit-profile-dialog.component.html',
  styleUrl: './edit-profile-dialog.component.scss'
})
export class EditProfileDialogComponent {
  boardServ = inject(BoardService);
  authService = inject(SignupService);
  storageService = inject(LocalStorageService);
  firestoreService = inject(FirestoreService);
  fullname: string;
  mail: string;
  avatarPath: string;
  avatars: string[] = ['avatar0.png', 'avatar1.png', 'avatar2.png', 'avatar3.png', 'avatar4.png', 'avatar5.png'];
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
          this.updateUsers();
          this.changesSuccessful = true;
        })
    }
  }

  updateUsers() {
    this.boardServ.currentUser = this.storageService.loadCurrentUser();
    this.firestoreService.updateUser(this.boardServ.currentUser.id, this.boardServ.currentUser);
  }

  pickAvatar(i: number) {
    this.avatarPath = this.avatars[i];
    this.changeAvatar = false;
  }

  closeDialog() {
    this.boardServ.profileOptionsOpen = false;
    this.boardServ.profileOpen = false;
    this.boardServ.editMode = false;
    this.authService.errorCode = '';
    this.changesSuccessful = false;
  }

}
