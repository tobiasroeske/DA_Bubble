import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SuggestedUser {
  name: string;
  avatarPath: string;
}

@Component({
  selector: 'app-suggested-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './suggested-list.component.html',
  styleUrl: './suggested-list.component.scss'
})
export class SuggestedListComponent {

  @Input() filteredUsersListFromParent?: SuggestedUser[];
  @Output() sendIndexToParent: EventEmitter<number> = new EventEmitter<number>();

  addThisMember(index: number) {
    this.sendIndexToParent.emit(index)
  }
}
