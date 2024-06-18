import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardService } from '../board.service';
import { SignupService } from '../../shared/services/signup/signup.service';
import { ShowProfileDialogComponent } from "../../show-profile-dialog/show-profile-dialog.component";
import { EditProfileDialogComponent } from "../../edit-profile-dialog/edit-profile-dialog.component";
import { SearchDialogComponent } from './search-dialog/search-dialog.component';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '../../shared/services/firestore-service/firestore.service';
import { CurrentUser } from '../../shared/interfaces/currentUser.interface';
import { NotificationsComponent } from './notifications/notifications.component';
import { NotificationObj } from '../../shared/models/notificationObj.class';
import { LocalStorageService } from '../../shared/services/local-storage-service/local-storage.service';

@Component({
  selector: 'app-board-toolbar',
  standalone: true,
  templateUrl: './board-toolbar.component.html',
  styleUrl: './board-toolbar.component.scss',
  imports: [CommonModule, ShowProfileDialogComponent, EditProfileDialogComponent, SearchDialogComponent, FormsModule, NotificationsComponent]
})
export class BoardToolbarComponent {
  authService = inject(SignupService);
  boardServ = inject(BoardService);
  firestoreService = inject(FirestoreService)
  localStorageService = inject(LocalStorageService)

  userList: CurrentUser[] = [];
  searchText: string = "";
  showProfileOptions = false;
  showProfile = false;
  showOverlay = false;
  editorOpen = false;
  notificationsOpen = false;
  unredNotifications: NotificationObj[] = [];

  showValue(text: string) {
    this.searchText = text;
  }

  toggleProfileMobile(event: Event) {
    this.showProfile = !this.showProfile;
    this.boardServ.toggleProfileOptions();
    event.stopPropagation()
  }

  close(event: boolean) {
    this.showProfile = event;
  }

  allNotificationsRed() {
    this.unredNotifications = [];
    let notifications = this.boardServ.currentUser.notification;
    notifications.forEach((n:NotificationObj) => {
      if (n.notificationRed = false) {
        this.unredNotifications.push(n);
      }
    })
    if (this.unredNotifications.length >= 0) {
      return true
    } else {
      return false
    }
  }

  toggleProfileOptions(event: Event) {
    this.showOverlay = !this.showOverlay;
    this.showProfileOptions = !this.showProfileOptions;
  }

  showProfileDialog(event: Event) {
    event.stopPropagation();
    this.showProfile = true;
    this.showProfileOptions = false;
  }

  showNotificationDialog(event: Event) {
    event.stopPropagation();
    this.notificationsOpen = true;
    this.showProfileOptions = false;
  }

  closeProfileDialog(event: boolean) {
    this.showProfile = false;
    this.showProfileOptions = false;
    this.showOverlay = false;
    this.editorOpen = false;
    this.notificationsOpen = false;
  }

  closeNotificationsDialog(event: boolean) {
    this.notificationsOpen = event;
    this.showProfileOptions = false;
    this.showOverlay = false
    this.showProfile = false;
  }

  openEditor(event: boolean) {
    this.editorOpen = event;
    this.showProfile = false;
  }

  async logout() {
    this.boardServ.currentUser = this.localStorageService.loadCurrentUser();
    this.boardServ.currentUser.loginState = 'loggedOut';
    this.localStorageService.saveCurrentUser(this.boardServ.currentUser);
    await this.firestoreService.updateUser(this.boardServ.currentUser.id, this.boardServ.currentUser);
    await this.authService.logout()
    

  }


}
