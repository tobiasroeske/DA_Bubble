import { Component, inject } from '@angular/core';
import { BoardService } from '../board/board.service';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SignupService } from '../shared/services/signup/signup.service';
import { LocalStorageService } from '../shared/services/local-storage-service/local-storage.service';

@Component({
  selector: 'app-edit-profile-dialog',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './edit-profile-dialog.component.html',
  styleUrl: './edit-profile-dialog.component.scss'
})
export class EditProfileDialogComponent {
  boardServ = inject(BoardService);
  authService = inject(SignupService)
  storageService = inject(LocalStorageService)
  fullname: string;
  mail: string;

  constructor() {
    this.fullname = this.boardServ.currentUser.name;
    this.mail = this.boardServ.currentUser.email;
  }


  async onsubmit(ngForm: NgForm) {
    if (ngForm.submitted && ngForm.form.valid) {
      await this.authService.updateUserProfile({ displayName: this.fullname })
      .then(() => this.authService.updateEmail(this.mail))
      .then(() => this.boardServ.currentUser = this.storageService.loadCurrentUser())
    }
  }

  closeDialog() {
    this.boardServ.profileOptionsOpen = false;
    this.boardServ.profileOpen = false;
    this.boardServ.editMode = false;
  }

}
