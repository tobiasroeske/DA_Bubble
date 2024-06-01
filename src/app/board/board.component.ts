import { Component, HostListener, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardToolbarComponent } from './board-toolbar/board-toolbar.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { BoardChatFieldComponent } from './board-chat-field/board-chat-field.component';
import { CreateMessageAreaComponent } from './create-message-area/create-message-area.component';
import { ThreadComponent } from './thread/thread.component';
import { AddChannelDialogComponent } from './add-channel-dialog/add-channel-dialog.component';
import { EditChannelDialogComponent } from './edit-channel-dialog/edit-channel-dialog.component';
import { MembersDialogComponent } from './members-dialog/members-dialog.component';
import { SignupService } from '../shared/services/signup/signup.service';
import { FirestoreService } from '../shared/services/firestore-service/firestore.service';
import { BoardService } from './board.service';
import { Auth, User } from '@angular/fire/auth';
import { IdleService } from '../shared/services/idle-service/idle.service';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, BoardToolbarComponent, SidenavComponent, BoardChatFieldComponent, CreateMessageAreaComponent, ThreadComponent, AddChannelDialogComponent, EditChannelDialogComponent, MembersDialogComponent],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent implements OnInit{
  firestore = inject(FirestoreService);
  authService = inject(SignupService);
  boardServ = inject(BoardService);
  idleUserService = inject(IdleService);
  isUserIdle = false;
  profileOptionContainerOpen = false;

  constructor() {
    this.authService.getLoggedInUser()
  }

  ngOnInit() {
    // this.idleUserService.userInactive.subscribe(isIdle => {
    //   if (isIdle) {
    //     console.log('you will be logged out');
    //     this.authService.logout()
    //   }
    // })
  }

  
  @HostListener('window:unload', [ '$event' ])
  async unloadHandler(event: Event) {
    event.preventDefault();
    console.log(event);
    
    let currentUser = this.boardServ.currentUser;
    currentUser.loggedIn = false;
    await this.firestore.updateUser(currentUser.id, currentUser);
  }

  openProfileOptions($event: boolean) {
    this.profileOptionContainerOpen = $event;
  }

  logout() {
    this.authService.logout();
  }
}
