import { Component, EventEmitter, Output, input, ChangeDetectionStrategy } from '@angular/core';

import { CurrentUser } from '../../../../shared/interfaces/currentUser.interface';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-first-two-selected-members',
  imports: [],
  templateUrl: './first-two-selected-members.component.html',
  styleUrl: './first-two-selected-members.component.scss',
})
export class FirstTwoSelectedMembersComponent {
  readonly selectedList = input<CurrentUser[]>();
  @Output() sendIndexToParent: EventEmitter<number> = new EventEmitter<number>();

  removeThisMember(index: number) {
    this.sendIndexToParent.emit(index);
  }
}
