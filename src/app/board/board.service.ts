import { AfterViewInit, ElementRef, HostListener, Injectable, inject } from '@angular/core';

import { SignupService } from '../shared/services/signup/signup.service';
import { LocalStorageService } from '../shared/services/local-storage-service/local-storage.service';
import { CurrentUser } from '../shared/interfaces/currentUser.interface';
import { ChatMessage } from '../shared/interfaces/chatMessage.interface';
import { FirestoreService } from '../shared/services/firestore-service/firestore.service';
import { PrivateChat } from '../shared/models/privateChat.class';
import { Channel } from '../shared/models/channel.class';


@Injectable({
  providedIn: 'root'
})
export class BoardService {
  authService = inject(SignupService);
  storageService = inject(LocalStorageService);
  firestore = inject(FirestoreService);
  threadTranslate: boolean = false;
  sidenavTranslate: boolean = true;
  textHidden: boolean = false;
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
  hidePopUpChatPartner: boolean = false;
  currentChatMessage!: any;
  chatMessageIndex!: number;
  privateChatIsStarted: boolean = false;
  chatFieldRef!: ElementRef;
  threadRef!: ElementRef;
  currentChatPartner!: CurrentUser;
  privateChat!: ChatMessage[];
  privateChatId?: string
  showEmojiPicker = false;
  showEmojiPickerInThreads = false;
  blueColorsForTheChatPartersFocus: boolean[] = [];
  blueText!: boolean;
  currentChannelTitle: string = '';
  newMessageInputOpen = false;
  allData: (Channel | PrivateChat | CurrentUser | ChatMessage)[] = [];
  showUserPopUp: boolean = false;
  userObjectPopUp!: CurrentUser;
  userNamePopUp!: string;
  userEmailPopUp!: string;
  userAvatarPopUp!: string;
  tabletView = false;
  mobileView = false;
  emojiPickerSmall = false;
  selectedChatRoom!: PrivateChat;
  public privateMessagesElementsToArray: ElementRef[] = [];
  highlightArrayForTheChildElementSearched: boolean[] = [];
  showSearchDialog: boolean = false;
  searchText: string = "";



  constructor() {
    this.checkScreenSize();
    this.currentUser = this.storageService.loadCurrentUser()!;
    if (this.currentUser.id != '') {
      this.currentUser.loginState = 'loggedIn';
      this.firestore.updateUser(this.currentUser.id!, this.currentUser);
    } else {
      window.open('login', '_self');
    }
  }

  checkScreenSize() {
    if (window.innerWidth <= 1500) {
      this.tabletView = true;
      this.mobileView = false;
      if (this.threadTranslate && this.sidenavTranslate) {
        this.sidenavTranslate = false;
      }
    }
    if (window.innerWidth <= 768) {
      this.mobileView = true;
      this.tabletView = false;
      this.emojiPickerSmall = false;
    }
    if (window.innerWidth <= 420) {
      this.emojiPickerSmall = true;
    }
  }

  getUserLoginState(participant: CurrentUser) {
    let allUsers: CurrentUser[] = this.firestore.userList;
    let user: CurrentUser = allUsers.find(user => user.id == participant.id)!;
    return user.loginState
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
      this.openThread();
    } else {
      this.toggleSidenav();
    }
  }

  openThread() {
    this.threadTranslate = true;
    if (window.innerWidth <= 1500) {
      this.sidenavTranslate = false;
    } 
  }

  toggleSidenav() {
    this.sidenavTranslate = !this.sidenavTranslate;
      this.hideText();
      if (window.innerWidth <= 1500) {
        this.threadTranslate = false;
      }
      if (this.mobileView) {
        this.newMessageInputOpen = false;
      }
  }

  close(element: string) {
    if (element == 'thread') {
      this.threadTranslate = false;
    }
  }

  hideChatField() {
    return (this.sidenavTranslate && this.mobileView) || 
    (this.threadTranslate && this.mobileView);
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

  toggleEmojiPicker(event: Event) {
    this.showEmojiPicker = !this.showEmojiPicker;
    event.stopPropagation()
  }

  toggleEmojiPickerThreads(event: Event) {
    this.showEmojiPickerInThreads = !this.showEmojiPickerInThreads;
    event.stopPropagation()
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

  stopAllOtherActions(event: Event) {
    event.stopPropagation();
    event.preventDefault();
  }

  showChannelInChatField(i: number, event: Event) {
    this.idx = i;
    this.storageService.saveCurrentChannelIndex(this.idx);
    this.privateChatIsStarted = false;
    this.newMessageInputOpen = false;
    this.hideSideNav();
    event.preventDefault();
  }

  startPrivateChat(index: number, partecipant: string, event?: Event) {
    if (partecipant == "creator") {
      this.startChatAsCreator(index);
    } else {
      this.startChatAsGuest(index);
    }
    if (event) {
      event.stopPropagation();
    }
    this.markCurrentChat(index);
  }

  markCurrentChat(index:number) {
    this.blueColorsForTheChatPartersFocus = [];
    this.firestore.directMessages.forEach(privateChat => {
      this.blueColorsForTheChatPartersFocus.push(false);
    })
    this.newMessageInputOpen = false;
    console.log(this.blueColorsForTheChatPartersFocus);
    this.setBlueColorToChatPartner(index)
    this.hideSideNav();
  }

  startChatAsGuest(index:number) {
    this.chatPartnerIdx = index;
    this.privateChatId = this.firestore.directMessages[this.chatPartnerIdx].id;
    if (this.privateChatId == '') {
      this.privateChatId = this.firestore.chatRoomId;
    }
    this.currentChatPartner = this.firestore.directMessages[this.chatPartnerIdx].creator;
    this.privateChat = this.firestore.directMessages[this.chatPartnerIdx].chat;
    this.checkIfPrivatChatIsEmpty();
    this.privateChatIsStarted = true;
  }

  startChatAsCreator(index: number) {
    this.chatPartnerIdx = index;
    this.privateChatId = this.firestore.directMessages[this.chatPartnerIdx].id;
    if (this.privateChatId == '') {
      this.privateChatId = this.firestore.chatRoomId;
    }
    this.currentChatPartner = this.firestore.directMessages[this.chatPartnerIdx].guest;
    this.privateChat = this.firestore.directMessages[this.chatPartnerIdx].chat;
    this.checkIfPrivatChatIsEmpty();
    this.privateChatIsStarted = true;
  }

  hideSideNav() {
    if (this.mobileView) {
      this.sidenavTranslate = false;
      this.hideText();
    }
  }

  setBlueColorToChatPartner(index: number) {
    this.blueColorsForTheChatPartersFocus[index] = true
  }

  checkIfPrivatChatIsEmpty() {
    if (this.privateChat.length == 0) {
      this.hidePopUpChatPartner = false;
      setTimeout(() => {
        this.firstPrivateMessageWasSent = false;
      }, 100);
    } else {
      this.hidePopUpChatPartner = true;
      this.firstPrivateMessageWasSent = true;
    }
  }

  loadAllData() {
    this.allData = [];
    this.firestore.allChannels.forEach((channel: Channel) => {
      this.allData.push(channel)
    })
    this.firestore.userList.forEach((user: CurrentUser) => {
      this.allData.push(user)
    })
    this.firestore.directMessages.forEach((dm: PrivateChat) => {
      this.allData.push(dm)
    })
    console.log(this.allData);
  }

  openShowUserPopUp(index: number) {
    this.userObjectPopUp = this.firestore.userList[index];
    this.userNamePopUp = this.firestore.userList[index].name;
    this.userEmailPopUp = this.firestore.userList[index].email;
    this.userAvatarPopUp = this.firestore.userList[index].avatarPath;
  }

  scrollToSearchedMessage(index: number) {
    setTimeout(() => {
      let element = this.privateMessagesElementsToArray[index];
      if (element) {
        element.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        this.highlightArrayForTheChildElementSearched[index] = true;
      } else {
        console.warn('Element not found:', 'message-' + index);
      }
    }, 100);
    this.leaveTheHighlightFromSearchedMessage(index);
  }

  leaveTheHighlightFromSearchedMessage(index:number) {
    setTimeout(() => {
      this.highlightArrayForTheChildElementSearched[index] = false;
    }, 1500)
  }
}

