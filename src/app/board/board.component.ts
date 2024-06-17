import { AfterViewInit, Component, HostListener, OnInit, inject } from '@angular/core';
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
import { LocalStorageService } from '../shared/services/local-storage-service/local-storage.service';
import { interval, throttle } from 'rxjs';
import { ShowChatParterPopUpComponent } from './show-chat-parter-pop-up/show-chat-parter-pop-up.component';
import { SearchedUserPopUpComponent } from './searched-user-pop-up/searched-user-pop-up.component';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, BoardToolbarComponent, SidenavComponent, BoardChatFieldComponent, CreateMessageAreaComponent, ThreadComponent, AddChannelDialogComponent, EditChannelDialogComponent, MembersDialogComponent, ShowChatParterPopUpComponent, SearchedUserPopUpComponent],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent implements OnInit {
  firestore = inject(FirestoreService);
  authService = inject(SignupService);
  boardServ = inject(BoardService);
  idleUserService = inject(IdleService);
  localStorageService = inject(LocalStorageService)
  
  isUserIdle = false;
  profileOptionContainerOpen = false;

  @HostListener('window:resize', ['$event'])
  handleResize(event:Event ) {
    this.boardServ.checkScreenSize();
  }


  @HostListener('window:click', ['$event'])
  async handleClick() {
    if (this.boardServ.currentUser.loginState != 'loggedOut') {
      this.boardServ.currentUser = this.localStorageService.loadCurrentUser();
      this.boardServ.currentUser.loginState = 'loggedIn'
      await this.firestore.updateUser(this.boardServ.currentUser.id, this.boardServ.currentUser);
    }
    
  }

  @HostListener('window:unload', ['$event'])
  async unloadHandler(event: Event) {
    event.preventDefault();
    this.localStorageService.saveIntroPlayed(false);
    let currentUser = this.localStorageService.loadCurrentUser();
    currentUser.loginState = 'loggedOut';
    await this.firestore.updateUser(currentUser.id, currentUser);
  }

  ngOnInit() {
    this.boardServ.currentUser = this.localStorageService.loadCurrentUser();
    this.idleUserService.userInactive.subscribe(isIdle => {
      if (isIdle) {
        
        this.boardServ.currentUser.loginState = 'idle';
        this.firestore.updateUser(this.boardServ.currentUser.id, this.boardServ.currentUser);
      }
    })
  }

  getUserNotifications() {
    let allUsers = this.firestore.userList;
    let currentUser = allUsers.find(u => u.id == this.boardServ.currentUser.id)
    return currentUser;
  }

  openProfileOptions($event: boolean) {
    this.profileOptionContainerOpen = $event;
  }

  logout() {
    this.authService.logout();
  }
}
