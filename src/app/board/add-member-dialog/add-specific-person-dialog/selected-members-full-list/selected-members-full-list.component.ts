import { Component, EventEmitter, Output, input,
  ChangeDetectionStrategy,
} from '@angular/core';

interface SelectedMember {
  name: string;
  avatarPath: string;
}
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-selected-members-full-list',
  imports: [],
  templateUrl: './selected-members-full-list.component.html',
  styleUrl: './selected-members-full-list.component.scss',
})
export class SelectedMembersFullListComponent {
  readonly selectedListFromParent = input<SelectedMember[]>();
  @Output() sendIndexToParent: EventEmitter<number> = new EventEmitter<number>();

  removeThisSelectedUser(index: number) {
    this.sendIndexToParent.emit(index);
  }
}
