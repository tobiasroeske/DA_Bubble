import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ShowMemberPopUpComponent } from '../members-dialog/show-member-pop-up/show-member-pop-up.component';
import { BoardService } from '../../shared/services/board-service/board.service';

@Component({
  selector: 'app-show-chat-parter-pop-up',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './show-chat-parter-pop-up.component.html',
  styleUrl: './show-chat-parter-pop-up.component.scss'
})
export class ShowChatParterPopUpComponent extends ShowMemberPopUpComponent {

  constructor(){
    super();
  }

}
