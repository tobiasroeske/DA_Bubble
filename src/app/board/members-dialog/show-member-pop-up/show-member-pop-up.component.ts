import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { BoardService } from '../../board.service';
import { FirestoreService } from '../../../shared/services/firestore-service/firestore.service';

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

  @Input() selectedMember?: string;
  @Input() memberImage?: string;

  @Output() sendEventToParent: EventEmitter<Event> = new EventEmitter<Event>();
  @Output() sendTheStartChatOk: EventEmitter<Event> = new EventEmitter<Event>();

  closeShowMemberPopUp(event: Event) {
    this.sendEventToParent.emit(event);
  }

  setChatRoom(event: Event) {
    this.sendTheStartChatOk.emit(event)
  }
}
