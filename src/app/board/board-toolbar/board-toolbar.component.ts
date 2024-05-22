import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardService } from '../board.service';
import { SignupService } from '../../shared/services/signup/signup.service';
import { ShowProfileDialogComponent } from "../../show-profile-dialog/show-profile-dialog.component";
import { EditProfileDialogComponent } from "../../edit-profile-dialog/edit-profile-dialog.component";
import { FirestoreService } from '../../shared/services/firestore-service/firestore.service';
import { user } from '@angular/fire/auth';
import { CurrentUser } from '../../shared/interfaces/currentUser.interface';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-board-toolbar',
    standalone: true,
    templateUrl: './board-toolbar.component.html',
    styleUrl: './board-toolbar.component.scss',
    imports: [CommonModule, ShowProfileDialogComponent, EditProfileDialogComponent]
})
export class BoardToolbarComponent {
  authService = inject(SignupService);
  boardServ = inject(BoardService);
  firestoreService = inject(FirestoreService)
  userList: CurrentUser[] = [];
  // userListSubscription!: Subscription;

  
}
