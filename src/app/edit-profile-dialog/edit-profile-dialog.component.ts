import { Component, EventEmitter, Output, inject } from '@angular/core';
import { BoardService } from '../board/board.service';
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


  async onsubmit(ngForm: NgForm) {
    if (ngForm.submitted && ngForm.form.valid) {
      await this.authService.updateUserProfile({ displayName: this.fullname, photoURL: this.avatarPath })
        .then(() => {
          let emailChanged = this.mail != this.authService.auth.currentUser?.email
          if (emailChanged) {
            this.authService.updateEmail(this.mail).then(() => {
              this.firestoreService.updateUser(this.boardServ.currentUser.id, this.boardServ.currentUser);
            })
          }
        })
        .then(() => {
          this.updateUsers().then(() => this.changesSuccessful = true)
        }).then(() => {
          this.updateMember();
        }).then(() => {
          this.updateChatMessage();
        }).then(() => {
          this.updateDirectMessages();
        })
    }
  }

  async onFileChange(event: any) {
    const file = event.target.files[0];
    if (file) {
      const path = `avatarImages/${file.name}`;
      try {
        await this.firebaseStorageService.uploadFile(path, file);
        const url = await this.firebaseStorageService.getDownloadUrl(path);
        this.avatarPath = url;
        this.changeAvatar = false;
      } catch (err) {
        console.error('Error handling file change:', err);
      }
    }
  }

  async updateUsers() {
    this.boardServ.currentUser = this.storageService.loadCurrentUser();
    this.boardServ.loadCurrentUser();
    // await this.firestoreService.updateUser(this.boardServ.currentUser.id, this.boardServ.currentUser);
  }

  async updateMember() {
    this.allChannels = this.firestoreService.allExistingChannels;
    this.allChannels.forEach((chan) => {
      chan.members.forEach(member => {
        if (member.id == this.boardServ.currentUser.id) {
          member.name = this.boardServ.currentUser.name;
          member.avatarPath = this.boardServ.currentUser.avatarPath;
        }
      })
      if (chan.id) {
        this.firestoreService.updateChannel(chan.toJSON(), chan.id)
      }
    })
  }

  async updateChatMessage() {
    this.allChannels.forEach((chan => {
      if (chan.chat) {
        chan.chat.forEach((chat) => {
          if (chat.user.id == this.boardServ.currentUser.id) {
            chat.user.name = this.boardServ.currentUser.name;
            chat.user.avatarPath = this.boardServ.currentUser.avatarPath;
          }
        })
        if (chan.id) {
          this.firestoreService.updateChannel(chan.toJSON(), chan.id);
        }
      }
    }))
  }

  async updateDirectMessages() {
    this.allDirectMessages = this.firestoreService.allDirectMessages;
    this.allDirectMessages.forEach((dm) => {
      if (dm.guest.id == this.boardServ.currentUser.id) {
        dm.guest.name = this.boardServ.currentUser.name
        dm.guest.avatarPath = this.boardServ.currentUser.avatarPath;
      } else if (dm.creator.id == this.boardServ.currentUser.id) {
        dm.creator.name = this.boardServ.currentUser.name;
        dm.creator.avatarPath = this.boardServ.currentUser.avatarPath;
      }
      dm.chat.forEach((chat)=> {
        if(chat.user.id == this.boardServ.currentUser.id){
         chat.user.name = this.boardServ.currentUser.name;
         chat.user.avatarPath = this.boardServ.currentUser.avatarPath;
        }
      })
      if (dm.id) {
        this.firestoreService.updateCompletePrivateMessage(dm.id, dm);
      }
    })
  }



  pickAvatar(i: number) {
    this.avatarPath = this.avatars[i];
    this.changeAvatar = false;
  }

  closeDialog() {
    this.editorOpen.emit(false);
  }

}
