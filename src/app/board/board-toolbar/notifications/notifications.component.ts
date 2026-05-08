import {
  Component,
  EventEmitter,
  Output,
  inject,
  input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { NgClass } from '@angular/common';
import { BoardService } from '../../../shared/services/board-service/board.service';
import { CurrentUser } from '../../../shared/interfaces/currentUser.interface';
import { FirestoreService } from '../../../shared/services/firestore-service/firestore.service';
import { NotificationObj } from '../../../shared/models/notificationObj.class';
import { LocalStorageService } from '../../../shared/services/local-storage-service/local-storage.service';
import { Channel } from '../../../shared/models/channel.class';
import { ChatMessage } from '../../../shared/interfaces/chatMessage.interface';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-notifications',
  imports: [NgClass],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
})
export class NotificationsComponent {
  @Output() notificationsOpen = new EventEmitter<boolean>();
  readonly allUsers = input<CurrentUser[]>([]);
  firestoreService = inject(FirestoreService);
  boardServ = inject(BoardService);
  channelChats!: Channel[];

  constructor() {}
  findCurrentUser() {
    const allUsers = this.firestoreService.userList();
    const currentUser = allUsers.find(u => u.id == this.boardServ.currentUser.id);
  }

  localStorageServ = inject(LocalStorageService);

  closeDialog() {
    this.notificationsOpen.emit(false);
  }

  checkPositionOfThisNotific(index: number, event: Event) {
    const notificChannel = this.boardServ.currentUser.notification[index].channelName;
    const notificMessage = this.boardServ.currentUser.notification[index].message;
    const indexOfCurrentChannel = this.firestoreService
      .allChannels()
      .findIndex((chan: Channel) => chan.title === notificChannel);
    const currentChannel = this.firestoreService.allChannels()[indexOfCurrentChannel];
    const idxOfCurrentNotificMessage = currentChannel.chat?.findIndex(
      (chat: ChatMessage) => chat.message.trim() == notificMessage.trim()
    );
    this.boardServ.showChannelInChatField(indexOfCurrentChannel, event);
    this.boardServ.scrollToChannelMessageAfterClickOnNotific(idxOfCurrentNotificMessage ?? -1);
  }

  async markAsRed(index: number) {
    this.boardServ.currentUser.notification.splice(index, 1);
    this.localStorageServ.saveCurrentUser(this.boardServ.currentUser);
    await this.firestoreService.updateUser(
      this.boardServ.currentUser.id!,
      this.boardServ.currentUser
    );
  }

  findNotificationIndex(notification: NotificationObj, currentUser: CurrentUser) {
    const idx = currentUser.notification.findIndex(n => n.date === notification.date);
    return idx;
  }
}
