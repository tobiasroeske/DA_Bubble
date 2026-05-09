import { Component, EventEmitter, Output, input, ChangeDetectionStrategy } from '@angular/core';

import { UserProfile } from '../../../../shared/interfaces/user.interface';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-first-two-selected-members',
  imports: [],
  templateUrl: './first-two-selected-members.component.html',
  styleUrl: './first-two-selected-members.component.scss',
})
export class FirstTwoSelectedMembersComponent {
  readonly selectedList = input<UserProfile[]>();
  @Output() sendIndexToParent: EventEmitter<number> = new EventEmitter<number>();

  removeThisMember(index: number) {
    this.sendIndexToParent.emit(index);
  }
}
