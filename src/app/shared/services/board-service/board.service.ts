import { ElementRef, Injectable, computed, inject, signal } from '@angular/core';

import { SignupService } from '../signup/signup.service';
import { LocalStorageService } from '../local-storage-service/local-storage.service';
import { UserProfile } from '../../interfaces/user.interface';
import { Message } from '../../interfaces/message.interface';
import { Channel } from '../../interfaces/channel.interface';
import { DirectMessage } from '../../interfaces/direct-message.interface';
import { FirestoreService } from '../firestore-service/firestore.service';
import { BREAKPOINTS } from '../../constants/breakpoints';
import { TIMINGS } from '../../constants/timings';

@Injectable({
  providedIn: 'root',
})
export class BoardService {
  authService = inject(SignupService);
  storageService = inject(LocalStorageService);
  firestore = inject(FirestoreService);

  currentUser!: UserProfile;
  currentChatMessage: Message | undefined = undefined;
  currentChatPartner!: UserProfile;
  currentChannelTitle: string = '';
  allData: (Channel | DirectMessage | UserProfile)[] = [];
  selectedChatRoom!: DirectMessage;
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

  readonly hideChatField = computed(
    () =>
      (this.sidenavTranslate() && this.mobileView()) ||
      (this.threadTranslate() && this.mobileView())
  );

  status: string = 'öffen';

  idx!: number;
  chatPartnerIdx!: number;
  chatMessageIndex!: number;
  privateAnswerMessage: Message | undefined = undefined;
  privateAnswerIndex!: number;

  blueColorsForTheChatPartersFocus: boolean[] = [];

  privateChatId?: string;

  userObjectPopUp!: UserProfile;
  userNamePopUp!: string;
  userEmailPopUp!: string;
  userAvatarPopUp!: string;

  searchText: string = '';

  loadCurrentUser() {
    this.checkScreenSize();
    this.currentUser = this.storageService.loadCurrentUser()!;
    if (this.currentUser.id) {
      this.firestore.updatePresence(this.currentUser.id, 'loggedIn');
    } else {
      window.open('login', '_self');
    }
  }

  checkScreenSize() {
    if (window.innerWidth <= BREAKPOINTS.DESKTOP) {
      this.showDesktopView();
    }
    if (window.innerWidth <= BREAKPOINTS.TABLET) {
      this.showMobileView();
    }
    if (window.innerWidth <= BREAKPOINTS.MOBILE) {
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

  getUserLoginState(userId: string): string {
    return this.firestore.userList().find(u => u.id === userId)?.loginState ?? 'loggedOut';
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
    if (window.innerWidth <= BREAKPOINTS.DESKTOP) {
      this.sidenavTranslate.set(false);
    }
  }

  toggleSidenav() {
    this.sidenavTranslate.update(v => !v);
    this.hideText();
    if (window.innerWidth <= BREAKPOINTS.DESKTOP) {
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
    setTimeout(
      () => {
        this.textHidden.set(!this.sidenavTranslate());
      },
      this.sidenavTranslate() ? TIMINGS.SIDENAV_OPEN_DELAY : TIMINGS.SIDENAV_CLOSE_DELAY
    );
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
    event.stopPropagation();
  }

  toggleEmojiPickerThreads(event: Event) {
    this.showEmojiPickerInThreads.update(v => !v);
    event.stopPropagation();
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

  startPrivateChat(index: number, _participant?: string, event?: Event) {
    this.startChat(index);
    if (event) {
      event.stopPropagation();
    }
    this.markCurrentChat(index);
  }

  startChat(index: number) {
    const dm = this.firestore.directMessages()[index];
    this.chatPartnerIdx = index;
    this.privateChatId = dm.id || this.firestore.chatRoomId;
    const otherUserId =
      dm.participantIds.find(id => id !== this.currentUser.id) ?? dm.participantIds[0];
    this.currentChatPartner =
      this.firestore.userList().find(u => u.id === otherUserId) ?? this.currentUser;
    this.selectedChatRoom = dm;
    if (dm.id) {
      this.firestore.subscribeToDirectMessages(dm.id);
    }
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
    this.blueColorsForTheChatPartersFocus[index] = true;
  }

  checkIfPrivateChatIsEmpty() {
    if (this.firestore.dmMessages().length === 0) {
      this.hidePopUpChatPartner.set(false);
      setTimeout(() => {
        this.firstPrivateMessageWasSent.set(false);
      }, TIMINGS.SIDENAV_OPEN_DELAY);
    } else {
      this.hidePopUpChatPartner.set(true);
      this.firstPrivateMessageWasSent.set(true);
    }
  }

  loadAllData() {
    this.allData = [];
    this.firestore.allChannels().forEach((channel: Channel) => {
      this.allData.push(channel);
    });
    this.firestore.userList().forEach((user: UserProfile) => {
      this.allData.push(user);
    });
    this.firestore.directMessages().forEach((dm: DirectMessage) => {
      this.allData.push(dm);
    });
  }

  openShowUserPopUp(index: number) {
    this.userObjectPopUp = this.firestore.userList()[index];
    this.userNamePopUp = this.firestore.userList()[index].name;
    this.userEmailPopUp = this.firestore.userList()[index].email;
    this.userAvatarPopUp = this.firestore.userList()[index].avatarPath;
  }

  scrollToSearchedMessage(index: number) {
    setTimeout(() => {
      const element = this.privateMessagesElementsToArray[index];
      if (element) {
        element.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        this.highlightArrayForTheChildElementSearched[index] = true;
      } else {
        console.warn('Element not found:', 'message-' + index);
      }
    }, TIMINGS.SIDENAV_OPEN_DELAY);
    this.leaveTheHighlightFromSearchedMessage(index);
  }

  leaveTheHighlightFromSearchedMessage(index: number) {
    setTimeout(() => {
      this.highlightArrayForTheChildElementSearched[index] = false;
    }, TIMINGS.HIGHLIGHT_DURATION);
  }

  scrollToChannelMessageAfterClickOnNotific(index: number) {
    setTimeout(() => {
      const element = this.channelMessageElementsToArray[index];
      if (element) {
        element.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        this.highlightArrayForTheChannelElementSearched[index] = true;
      }
      this.leaveTheHighlightFromSearchedChannelMessage(index);
    }, TIMINGS.SIDENAV_OPEN_DELAY);
  }

  leaveTheHighlightFromSearchedChannelMessage(index: number) {
    setTimeout(() => {
      this.highlightArrayForTheChannelElementSearched[index] = false;
    }, TIMINGS.HIGHLIGHT_DURATION);
  }
}
