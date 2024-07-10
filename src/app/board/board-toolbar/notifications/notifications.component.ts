import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { BoardService } from '../../../shared/services/board-service/board.service';
import { CurrentUser } from '../../../shared/interfaces/currentUser.interface';
import { FirestoreService } from '../../../shared/services/firestore-service/firestore.service';
import { NotificationObj } from '../../../shared/models/notificationObj.class';
import { LocalStorageService } from '../../../shared/services/local-storage-service/local-storage.service';
import { Channel } from '../../../shared/models/channel.class';
import { ChatMessage } from '../../../shared/interfaces/chatMessage.interface';


@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent {
  @Output() notificationsOpen = new EventEmitter<boolean>();
  @Input() allUsers!: CurrentUser[];
  firestoreService = inject(FirestoreService);
  boardServ = inject(BoardService);
  channelChats!: Channel[];

  constructor() {

  }
  findCurrentUser() {
    let allUsers = this.firestoreService.userList;
    let currentUser = allUsers.find(u => u.id == this.boardServ.currentUser.id);
  }

  localStorageServ = inject(LocalStorageService)

  closeDialog() {
    this.notificationsOpen.emit(false);
  }

  checkPositionOfThisNotific(index: number, event: Event) {
    let notificChannel = this.boardServ.currentUser.notification[index].channelName;
    let notificMessage = this.boardServ.currentUser.notification[index].message;
    let indexOfCurrentChannel = this.firestoreService.allChannels.findIndex((chan: Channel) => chan.title === notificChannel)
    let currentChannel = this.firestoreService.allChannels[indexOfCurrentChannel];
    let idxOfCurrentNotificMessage = currentChannel.chat.findIndex((chat: ChatMessage) => chat.message.trim() == notificMessage.trim());
    this.boardServ.showChannelInChatField(indexOfCurrentChannel, event);
    this.boardServ.scrollToChannelMessageAfterClickOnNotific(idxOfCurrentNotificMessage);
  }

  async markAsRed(index: number) {
    this.boardServ.currentUser.notification.splice(index, 1);
    this.localStorageServ.saveCurrentUser(this.boardServ.currentUser);
    await this.firestoreService.updateUser(this.boardServ.currentUser.id, this.boardServ.currentUser);
  }

  findNotificationIndex(notification: NotificationObj, currentUser: CurrentUser) {
    let idx = currentUser.notification.findIndex(n => n.date === notification.date)
    return idx;
  }
}
