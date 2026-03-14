import { ElementRef, Injectable, computed, inject, signal } from '@angular/core';

import { SignupService } from '../signup/signup.service';
import { LocalStorageService } from '../local-storage-service/local-storage.service';
import { CurrentUser } from '../../interfaces/currentUser.interface';
import { ChatMessage } from '../../interfaces/chatMessage.interface';
import { FirestoreService } from '../firestore-service/firestore.service';
import { PrivateChat } from '../../models/privateChat.class';
import { Channel } from '../../models/channel.class';


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

  readonly threadTranslate = signal<boolean>(false);
  readonly sidenavTranslate = signal<boolean>(true);
  readonly textHidden = signal<boolean>(false);
  readonly dialogIsOpen = signal<boolean>(false);
  readonly editDialogIsOpen = signal<boolean>(false);
  readonly profileOptionsOpen = signal<boolean>(false);
  readonly profileOpen = signal<boolean>(false);
  readonly editMode = signal<boolean>(false);
  readonly newMessageInputOpen = signal<boolean>(false);
  readonly showEmojiPicker = signal<boolean>(false);
  readonly showEmojiPickerInThreads = signal<boolean>(false);
  readonly showUserPopUp = signal<boolean>(false);
  readonly tabletView = signal<boolean>(false);
  readonly mobileView = signal<boolean>(false);
  readonly emojiPickerSmall = signal<boolean>(false);
  readonly privateChatIsStarted = signal<boolean>(false);
  readonly showSearchDialog = signal<boolean>(false);
  readonly firstPrivateMessageWasSent = signal<boolean>(false);
  readonly hidePopUpChatPartner = signal<boolean>(false);
  readonly blueText = signal<boolean>(false);

  readonly hideChatField = computed(() =>
    (this.sidenavTranslate() && this.mobileView()) ||
    (this.threadTranslate() && this.mobileView())
  );

  status: string = 'öffen';

  idx!: number;
  chatPartnerIdx!: number;
  chatMessageIndex!: number;
  privateAnswerMessage!: ChatMessage | null;
  privateAnswerIndex!: number;

  blueColorsForTheChatPartersFocus: boolean[] = [];

  privateChatId?: string

  userObjectPopUp!: CurrentUser;
  userNamePopUp!: string;
  userEmailPopUp!: string;
  userAvatarPopUp!: string;

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
      this.emojiPickerSmall.set(true);
    }
  }

  showDesktopView() {
    this.tabletView.set(true);
    this.mobileView.set(false);
    if (this.threadTranslate() && this.sidenavTranslate()) {
      this.sidenavTranslate.set(false);
    }
  }

  showMobileView() {
    this.mobileView.set(true);
    this.tabletView.set(false);
    this.emojiPickerSmall.set(false);
  }

  getUserLoginState(participant: CurrentUser): string {
    let allUsers: CurrentUser[] = this.firestore.userList();
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
    this.threadTranslate.set(true);
    if (window.innerWidth <= 1500) {
      this.sidenavTranslate.set(false);
    }
  }

  toggleSidenav() {
    this.sidenavTranslate.update(v => !v);
    this.hideText();
    if (window.innerWidth <= 1500) {
      this.threadTranslate.set(false);
    }
    if (this.mobileView()) {
      this.newMessageInputOpen.set(false);
    }
  }

  close(element: string) {
    if (element == 'thread') {
      this.threadTranslate.set(false);
    }
  }

  hideText() {
    this.status = this.sidenavTranslate() ? 'schließen' : 'öffnen';
    setTimeout(() => {
      this.textHidden.set(!this.sidenavTranslate());
    }, this.sidenavTranslate() ? 100 : 50);
  }

  openDialogAddChannel() {
    this.dialogIsOpen.set(true);
  }

  closeDialogAddChannel() {
    this.dialogIsOpen.set(false);
  }

  toggleDialogEditChannel(i: number) {
    this.idx = i;
    this.editDialogIsOpen.update(v => !v);
  }

  toggleProfileOptions() {
    this.profileOptionsOpen.update(v => !v);
    this.editMode.set(false);
    this.authService.errorCode.set('');
    this.profileOpen.set(false);
  }

  toggleEmojiPicker(event: Event) {
    this.showEmojiPicker.update(v => !v);
    event.stopPropagation()
  }

  toggleEmojiPickerThreads(event: Event) {
    this.showEmojiPickerInThreads.update(v => !v);
    event.stopPropagation()
  }

  toggleProfileView() {
    this.profileOpen.update(v => !v);
  }

  toggleProfileEditor() {
    this.editMode.update(v => !v);
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
    this.privateChatIsStarted.set(false);
    this.newMessageInputOpen.set(false);
    this.scrollToBottom(this.chatFieldRef);
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
    this.privateChatId = this.firestore.directMessages()[index].id || this.firestore.chatRoomId;
    this.currentChatPartner = role === 'creator' ? this.firestore.directMessages()[index].guest : this.firestore.directMessages()[index].creator;
    this.privateChat = this.firestore.directMessages()[index].chat;
    this.checkIfPrivateChatIsEmpty();
    this.privateChatIsStarted.set(true);
  }

  markCurrentChat(index: number) {
    this.blueColorsForTheChatPartersFocus = this.firestore.directMessages().map(() => false);
    this.newMessageInputOpen.set(false);
    this.setBlueColorToChatPartner(index);
    this.hideSideNav();
  }

  hideSideNav() {
    if (this.mobileView()) {
      this.sidenavTranslate.set(false);
      this.hideText();
    }
  }

  setBlueColorToChatPartner(index: number) {
    this.blueColorsForTheChatPartersFocus[index] = true
  }

  checkIfPrivateChatIsEmpty() {
    if (this.privateChat.length == 0) {
      this.hidePopUpChatPartner.set(false);
      setTimeout(() => {
        this.firstPrivateMessageWasSent.set(false);
      }, 100);
    } else {
      this.hidePopUpChatPartner.set(true);
      this.firstPrivateMessageWasSent.set(true);
    }
  }

  loadAllData() {
    this.allData = [];
    this.firestore.allChannels().forEach((channel: Channel) => { this.allData.push(channel) })
    this.firestore.userList().forEach((user: CurrentUser) => { this.allData.push(user) })
    this.firestore.directMessages().forEach((dm: PrivateChat) => { this.allData.push(dm) })
  }

  openShowUserPopUp(index: number) {
    this.userObjectPopUp = this.firestore.userList()[index];
    this.userNamePopUp = this.firestore.userList()[index].name;
    this.userEmailPopUp = this.firestore.userList()[index].email;
    this.userAvatarPopUp = this.firestore.userList()[index].avatarPath;
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
