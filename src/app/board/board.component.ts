import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardToolbarComponent } from './board-toolbar/board-toolbar.component';
import { SidenavComponent } from './sidenav/sidenav.component';
import { BoardChatFieldComponent } from './board-chat-field/board-chat-field.component';
import { CreateMessageAreaComponent } from './create-message-area/create-message-area.component';
import { ThreadComponent } from './thread/thread.component';
import { SignupService } from '../shared/services/signup/signup.service';
import { BoardService } from './board.service';
import { Auth, User } from '@angular/fire/auth';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, BoardToolbarComponent, SidenavComponent, BoardChatFieldComponent, CreateMessageAreaComponent, ThreadComponent],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent {
  authService = inject(SignupService);
  boardServ = inject(BoardService);

  constructor() {
    this.authService.getLoggedInUser()
  }

  logout() {
    this.authService.logout();
  }
}
