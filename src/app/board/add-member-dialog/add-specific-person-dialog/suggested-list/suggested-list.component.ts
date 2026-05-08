import { Component, EventEmitter, Output, input, ChangeDetectionStrategy } from '@angular/core';

interface SuggestedUser {
  name: string;
  avatarPath: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-suggested-list',
  imports: [],
  templateUrl: './suggested-list.component.html',
  styleUrl: './suggested-list.component.scss',
})
export class SuggestedListComponent {
  readonly filteredUsersListFromParent = input<SuggestedUser[]>();
  @Output() sendIndexToParent: EventEmitter<number> = new EventEmitter<number>();

  addThisMember(index: number) {
    this.sendIndexToParent.emit(index);
  }
}
