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

  userList: CurrentUser[] = [];
  searchText: string = "";
  showProfileOptions = false;
  showProfile = false;
  showOverlay = false;
  editorOpen = false;
  notificationsOpen = false;

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
    this.showProfile = event;
    this.showProfileOptions = false;
    this.showOverlay = false;
    this.editorOpen = false;
  }

  closeNotificationsDialog(event: boolean) {
    this.notificationsOpen = event;
    this.showProfileOptions = false;
    this.showOverlay = false
    this.showProfile = false;
  }

  openEditor(event: boolean) {
    this.editorOpen = event;
    console.log(this.editorOpen);
    
    this.showProfile = false;
  }

}
