import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { BoardService } from '../../board.service';
import { FirestoreService } from '../../../shared/services/firestore-service/firestore.service';
import { MemberDialogsService } from '../../../shared/services/member-dialogs.service/member-dialogs.service';

@Component({
  selector: 'app-show-member-pop-up',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './show-member-pop-up.component.html',
  styleUrl: './show-member-pop-up.component.scss'
})
export class ShowMemberPopUpComponent {
  boardServ = inject(BoardService);
  firestore = inject(FirestoreService);
  memberServ = inject(MemberDialogsService);
}
