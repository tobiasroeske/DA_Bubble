import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { BoardService } from '../../board.service';
import { CurrentUser } from '../../../shared/interfaces/currentUser.interface';
import { FirestoreService } from '../../../shared/services/firestore-service/firestore.service';

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

  closeDialog() {
    this.notificationsOpen.emit(false);
    
  }
}
