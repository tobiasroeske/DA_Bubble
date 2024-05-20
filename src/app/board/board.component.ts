import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardToolbarComponent } from './board-toolbar/board-toolbar.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { BoardChatFieldComponent } from './board-chat-field/board-chat-field.component';
import { CreateMessageAreaComponent } from './create-message-area/create-message-area.component';
import { ThreadComponent } from './thread/thread.component';
import { AddChannelDialogComponent } from './add-channel-dialog/add-channel-dialog.component';
import { EditChannelDialogComponent } from './edit-channel-dialog/edit-channel-dialog.component';
import { SignupService } from '../shared/services/signup/signup.service';
import { FirestoreService } from '../shared/services/firestore-service/firestore.service';
import { BoardService } from './board.service';
import { Auth, User } from '@angular/fire/auth';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, BoardToolbarComponent, SidenavComponent, BoardChatFieldComponent, CreateMessageAreaComponent, ThreadComponent, AddChannelDialogComponent, EditChannelDialogComponent],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent {
  authService = inject(SignupService);
  boardServ = inject(BoardService);
<<<<<<< HEAD
  firestore = inject(FirestoreService);
  
=======
  profileOptionContainerOpen = false;
>>>>>>> 4ce55c2c1c0760fe925a02fca1e1c8ccb60a675a

  constructor() {
    this.authService.getLoggedInUser()
  }

  openProfileOptions($event: boolean) {
  this.profileOptionContainerOpen = $event;
  }

  logout() {
    this.authService.logout();
  }
}
