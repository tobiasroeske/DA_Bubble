import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrentUser } from '../../../../shared/interfaces/currentUser.interface';

@Component({
  selector: 'app-first-two-selected-members',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './first-two-selected-members.component.html',
  styleUrl: './first-two-selected-members.component.scss'
})
export class FirstTwoSelectedMembersComponent {
  @Input() selectedList?: CurrentUser[];
  @Output() sendIndexToParent: EventEmitter<number> = new EventEmitter<number>();

  removeThisMember(index: number) {
    this.sendIndexToParent.emit(index);
  }
}
