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
import { FirestoreService } from '../../../shared/services/firestore-service/firestore.service';
import { LocalStorageService } from '../../../shared/services/local-storage-service/local-storage.service';
import { AppNotification, UserProfile } from '../../../shared/interfaces/user.interface';
import { Channel } from '../../../shared/interfaces/channel.interface';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-notifications',
  imports: [NgClass],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss',
})
export class NotificationsComponent {
  @Output() notificationsOpen = new EventEmitter<boolean>();
  readonly allUsers = input<UserProfile[]>([]);
  firestoreService = inject(FirestoreService);
  boardServ = inject(BoardService);

  localStorageServ = inject(LocalStorageService);

  closeDialog() {
    this.notificationsOpen.emit(false);
  }

  checkPositionOfThisNotific(index: number, event: Event) {
    const notificChannel = this.boardServ.currentUser.notifications[index].channelName;
    const indexOfCurrentChannel = this.firestoreService
      .allChannels()
      .findIndex((chan: Channel) => chan.title === notificChannel);
    this.boardServ.showChannelInChatField(indexOfCurrentChannel, event);
  }

  async markAsRed(index: number) {
    const updatedNotifications = [...this.boardServ.currentUser.notifications];
    updatedNotifications.splice(index, 1);
    this.boardServ.currentUser.notifications = updatedNotifications;
    this.localStorageServ.saveCurrentUser(this.boardServ.currentUser);
    await this.firestoreService.updateNotifications(
      this.boardServ.currentUser.id!,
      updatedNotifications
    );
  }

  findNotificationIndex(notification: AppNotification, currentUser: UserProfile) {
    const idx = currentUser.notifications.findIndex(n => n.date === notification.date);
    return idx;
  }
}
