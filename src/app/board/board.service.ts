import { Injectable, inject } from '@angular/core';
import { User } from '../shared/models/user.class';
import { SignupService } from '../shared/services/signup/signup.service';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  authService = inject(SignupService);
  threadTranslate: boolean = false;
  sidenavTranslate: boolean = false;
  textHidden: boolean = true;
  dialogIsOpen: boolean = false;
  editDialogIsOpen: boolean = false;
  status: string = 'öffen';
  currentUser!: any;

  constructor() { }

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

  toggleDialogEditChannel() {
    this.editDialogIsOpen = !this.editDialogIsOpen;
  }


}
