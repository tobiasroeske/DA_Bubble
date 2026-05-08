
import { Component, EventEmitter, inject, Input, Output,
  ChangeDetectionStrategy,
} from '@angular/core';
import { BoardService } from '../../../shared/services/board-service/board.service';
import { FirestoreService } from '../../../shared/services/firestore-service/firestore.service';
import { MemberDialogsService } from '../../../shared/services/member-dialogs.service/member-dialogs.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-show-member-pop-up',
    imports: [],
    templateUrl: './show-member-pop-up.component.html',
    styleUrl: './show-member-pop-up.component.scss'
})
export class ShowMemberPopUpComponent {
  boardServ = inject(BoardService);
  firestore = inject(FirestoreService);
  memberServ = inject(MemberDialogsService);
}
