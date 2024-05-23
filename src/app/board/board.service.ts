import { Injectable, inject } from '@angular/core';

import { SignupService } from '../shared/services/signup/signup.service';
import { LocalStorageService } from '../shared/services/local-storage-service/local-storage.service';
import { User, onAuthStateChanged } from '@angular/fire/auth/firebase';
import { CurrentUser } from '../shared/interfaces/currentUser.interface';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  authService = inject(SignupService);
  storageService = inject(LocalStorageService);
  threadTranslate: boolean = false;
  sidenavTranslate: boolean = false;
  textHidden: boolean = true;
  dialogIsOpen: boolean = false;
  editDialogIsOpen: boolean = false;
  membersDialogIsOpen: boolean = false;
  addMemberDialogIsOpen:boolean = false;
  addSpecificPerson:boolean = false;
  status: string = 'öffen';
  profileOptionsOpen = false;
  profileOpen = false;
  editMode = false;
  currentUser: any;
  idx:number = 0

  constructor() {
    this.currentUser = this.storageService.loadCurrentUser();
    console.log('user from local storage is: ', this.currentUser);
  }

  getCurrentUser() {
    return this.authService.currentUser;
  }

  open(element: string) {
    if (element == 'thread') {
      this.threadTranslate = true;
    } else {
      this.sidenavTranslate = !this.sidenavTranslate;
      this.hideText();
    }
  }

  close(element: string) {
    if (element == 'thread') {
      this.threadTranslate = false;
    }
  }

  hideText() {
    if (!this.sidenavTranslate) {
      this.status = 'öffnen';
      setTimeout(() => {
        this.textHidden = true;
      }, 50)
    } else {
      this.status = 'schließen'
      setTimeout(() => {
        this.textHidden = false;
      }, 100);
    }
  }

  openDialogAddChannel() {
    this.dialogIsOpen = true;
  }

  closeDialogAddChannel() {
    this.dialogIsOpen = false;
  }

  toggleDialogEditChannel(i: number) {
    this.idx = i;
    this.editDialogIsOpen = !this.editDialogIsOpen;
  }

  toggleProfileOptions() {
    this.profileOptionsOpen = !this.profileOptionsOpen;
    this.editMode =false;
    this.authService.errorCode = '';
    this.profileOpen = false;

  }

  toggleProfileView() {
    this.profileOpen = !this.profileOpen;
  }

  toggleProfileEditor() {
    this.editMode = !this.editMode;
  }

  toggleMembersDialog(event: Event) {
    this.membersDialogIsOpen = !this.membersDialogIsOpen;
    event?.stopPropagation();
  }

  openAddMembersDialog(){
    this.addMemberDialogIsOpen = true
  }

  goToAddSpecificPerson(event:Event){
    this.addSpecificPerson = true;
    event.stopPropagation();
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }

  showChannelInChatField(i: number, event: Event) {
    this.idx = i;
    event.preventDefault();
  }

}
