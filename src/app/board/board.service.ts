import { ElementRef, Injectable, inject } from '@angular/core';

import { SignupService } from '../shared/services/signup/signup.service';
import { LocalStorageService } from '../shared/services/local-storage-service/local-storage.service';
import { User, onAuthStateChanged } from '@angular/fire/auth/firebase';
import { CurrentUser } from '../shared/interfaces/currentUser.interface';
import { ChatMessage } from '../shared/interfaces/chatMessage.interface';
import { FirestoreService } from '../shared/services/firestore-service/firestore.service';

@Injectable({
  providedIn: 'root'
})
export class BoardService {
  authService = inject(SignupService);
  storageService = inject(LocalStorageService);
  firestore = inject(FirestoreService);
  threadTranslate: boolean = false;
  sidenavTranslate: boolean = false;
  textHidden: boolean = true;
  dialogIsOpen: boolean = false;
  editDialogIsOpen: boolean = false;
  status: string = 'öffen';
  profileOptionsOpen = false;
  profileOpen = false;
  editMode = false;
  currentUser: any;
  idx!: number;
  chatPartnerIdx!: number;
  firstPrivateMessageWasSent: boolean = false;
  currentChatMessage!: any;
  chatMessageIndex!: number;
  privateChatIsStarted: boolean = false;
  chatFieldRef!: ElementRef;
  threadRef!: ElementRef;
  currentChatPartner!: CurrentUser;
  privateChat!: ChatMessage[];
  privateChatId?: string

  constructor() {
    this.currentUser = this.storageService.loadCurrentUser();
    console.log('user from local storage is: ', this.currentUser);
  }

  scrollToBottom(elementRef: ElementRef) {
    if (elementRef == this.chatFieldRef) {
      elementRef.nativeElement.scrollTo(0, elementRef.nativeElement.scrollHeight)
    }
    if (elementRef == this.threadRef) {
      elementRef.nativeElement.scrollTo(0, elementRef.nativeElement.scrollHeight);
    }
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
    this.editMode = false;
    this.authService.errorCode = '';
    this.profileOpen = false;

  }

  toggleProfileView() {
    this.profileOpen = !this.profileOpen;
  }

  toggleProfileEditor() {
    this.editMode = !this.editMode;
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }

  showChannelInChatField(i: number, event: Event) {
    this.idx = i;
    this.privateChatIsStarted = false;
    event.preventDefault();
  }

  startPrivateChat(index: number, event: Event) {
    this.chatPartnerIdx = index;
    this.privateChatId = this.firestore.directMessages[this.chatPartnerIdx].id;
    this.currentChatPartner = this.firestore.directMessages[this.chatPartnerIdx].guest;
    this.privateChat = this.firestore.directMessages[this.chatPartnerIdx].chat;
    if (this.firestore.directMessages[this.chatPartnerIdx].chat && this.firestore.directMessages[this.chatPartnerIdx].chat.length > 0) {
      this.firstPrivateMessageWasSent = true
    } else {
      this.firstPrivateMessageWasSent = false
    }
    this.privateChatIsStarted = true;
    event.stopPropagation();
  }

}
