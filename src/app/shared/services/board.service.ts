import { ElementRef, Injectable, inject } from '@angular/core';

import { SignupService } from './signup/signup.service';
import { LocalStorageService } from './local-storage-service/local-storage.service';
import { CurrentUser } from '../interfaces/currentUser.interface';
import { ChatMessage } from '../interfaces/chatMessage.interface';
import { FirestoreService } from './firestore-service/firestore.service';
import { PrivateChat } from '../models/privateChat.class';
import { Channel } from '../models/channel.class';


@Injectable({
  providedIn: 'root'
})
export class BoardService {
  authService = inject(SignupService);
  storageService = inject(LocalStorageService);
  firestore = inject(FirestoreService);

  currentUser: any;
  currentChatMessage!: any;
  currentChatPartner!: CurrentUser;
  privateChat!: ChatMessage[];
  currentChannelTitle: string = '';
  allData: (Channel | PrivateChat | CurrentUser | ChatMessage)[] = [];
  selectedChatRoom!: PrivateChat;
  public privateMessagesElementsToArray: ElementRef[] = [];
  highlightArrayForTheChildElementSearched: boolean[] = [];

  channelMessageElementsToArray: ElementRef[] = [];
  highlightArrayForTheChannelElementSearched: boolean[] = [];

  chatFieldRef!: ElementRef;
  threadRef!: ElementRef;

  threadTranslate: boolean = false;
  sidenavTranslate: boolean = true;
  textHidden: boolean = false;
  dialogIsOpen: boolean = false;
  editDialogIsOpen: boolean = false;

  profileOptionsOpen = false;
  profileOpen = false;
  editMode = false;
  newMessageInputOpen = false;
  showEmojiPicker = false;
  showEmojiPickerInThreads = false;
  showUserPopUp: boolean = false;
  tabletView = false;
  mobileView = false;
  emojiPickerSmall = false;

  status: string = 'öffen';

  idx!: number;
  chatPartnerIdx!: number;
  chatMessageIndex!: number;
  privateAnswerMessage!: ChatMessage | null;
  privateAnswerIndex!: number;

  firstPrivateMessageWasSent: boolean = false;
  hidePopUpChatPartner: boolean = false;
  privateChatIsStarted: boolean = false;
  blueColorsForTheChatPartersFocus: boolean[] = [];
  blueText!: boolean;

  privateChatId?: string

  userObjectPopUp!: CurrentUser;
  userNamePopUp!: string;
  userEmailPopUp!: string;
  userAvatarPopUp!: string;

  showSearchDialog: boolean = false;
  searchText: string = "";

  ngOnInit(){
   this.loadCurrentUser();
  }

  loadCurrentUser(){
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
      this.showDesktopView();
    }
    if (window.innerWidth <= 768) {
      this.showMobileView();
    }
    if (window.innerWidth <= 420) {
      this.emojiPickerSmall = true;
    }
  }

  showDesktopView() {
    this.tabletView = true;
    this.mobileView = false;
    if (this.threadTranslate && this.sidenavTranslate) {
      this.sidenavTranslate = false;
    }
  }

  showMobileView() {
    this.mobileView = true;
    this.tabletView = false;
    this.emojiPickerSmall = false;
  }

  getUserLoginState(participant: CurrentUser): string {
    let allUsers: CurrentUser[] = this.firestore.userList;
    let user: CurrentUser = allUsers.find(user => user.id == participant.id)!;
    return user.loginState
  }

  scrollToBottom(elementRef: ElementRef) {
    if (elementRef === this.chatFieldRef || elementRef === this.threadRef) {
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
    this.status = this.sidenavTranslate ? 'schließen' : 'öffnen';
    setTimeout(() => {
      this.textHidden = !this.sidenavTranslate;
    }, this.sidenavTranslate ? 100 : 50);
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

  startPrivateChat(index: number, participant: string, event?: Event) {
    const role = participant === 'creator' ? 'creator' : 'guest';
    this.startChat(index, role);
    if (event) {
      event.stopPropagation();
    }
    this.markCurrentChat(index);
  }

  startChat(index: number, role: 'creator' | 'guest') {
    this.chatPartnerIdx = index;
    this.privateChatId = this.firestore.directMessages[index].id || this.firestore.chatRoomId;
    this.currentChatPartner = role === 'creator' ? this.firestore.directMessages[index].guest : this.firestore.directMessages[index].creator;
    this.privateChat = this.firestore.directMessages[index].chat;
    this.checkIfPrivateChatIsEmpty();
    this.privateChatIsStarted = true;
  }

  markCurrentChat(index: number) {
    this.blueColorsForTheChatPartersFocus = this.firestore.directMessages.map(() => false);
    this.newMessageInputOpen = false;
    this.setBlueColorToChatPartner(index);
    this.hideSideNav();
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

  checkIfPrivateChatIsEmpty() {
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
    this.firestore.allChannels.forEach((channel: Channel) => { this.allData.push(channel) })
    this.firestore.userList.forEach((user: CurrentUser) => { this.allData.push(user) })
    this.firestore.directMessages.forEach((dm: PrivateChat) => { this.allData.push(dm) })
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

  leaveTheHighlightFromSearchedMessage(index: number) {
    setTimeout(() => {
      this.highlightArrayForTheChildElementSearched[index] = false;
    }, 1500)
  }

  scrollToChannelMessageAfterClickOnNotific(index: number) {
    setTimeout(() => {
      let element = this.channelMessageElementsToArray[index];
      if (element) {
        element.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        this.highlightArrayForTheChannelElementSearched[index] = true;
      }
      this.leaveTheHighlightFromSearchedChannelMessage(index);
    }, 100);
  }

  leaveTheHighlightFromSearchedChannelMessage(index: number) {
    setTimeout(() => {
      this.highlightArrayForTheChannelElementSearched[index] = false;
    }, 1500)
  }
}

