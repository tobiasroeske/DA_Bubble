import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { BoardService } from '../../board.service';
import { CurrentUser } from '../../../shared/interfaces/currentUser.interface';
import { FirestoreService } from '../../../shared/services/firestore-service/firestore.service';
import { NotificationObj } from '../../../shared/models/notificationObj.class';
import { LocalStorageService } from '../../../shared/services/local-storage-service/local-storage.service';


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

  constructor(){
    this.firestoreService.userList.forEach(user => {
    console.log(user.notification);
    })
  }
  findCurrentUser() {
    let allUsers = this.firestoreService.userList;
    let currentUser = allUsers.find(u => u.id == this.boardServ.currentUser.id);
    console.log(currentUser);
  }
  localStorageServ = inject(LocalStorageService)

  closeDialog() {
    this.notificationsOpen.emit(false);
  }

  async markAsRed(index: number) {
    this.boardServ.currentUser.notification.splice(index, 1);
    this.localStorageServ.saveCurrentUser(this.boardServ.currentUser);
    await this.firestoreService.updateUser(this.boardServ.currentUser.id, this.boardServ.currentUser);



    // let currentUser = this.boardServ.currentUser;
    // let notifications: NotificationObj[] = [];
    // currentUser.notification.forEach((n: NotificationObj) => {
    //   if (n.receiverId == currentUser.id) {
    //     notifications.push(n);
    //   }
    // })



    // let currentNotification = notifications[index];
    // let notificationIndex = this.findNotificationIndex(currentNotification, currentUser);
    // currentUser.notification[notificationIndex].notificationRed = true;
    // this.localStorageServ.saveCurrentUser(currentUser);
    // await this.firestoreService.updateUser(currentUser.id, currentUser);
  }

  findNotificationIndex(notification: NotificationObj, currentUser: CurrentUser) {
    let idx = currentUser.notification.findIndex(n => n.date === notification.date)
    return idx;
  }
}
