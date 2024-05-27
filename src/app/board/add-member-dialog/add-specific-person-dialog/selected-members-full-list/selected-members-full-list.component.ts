import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

interface SelectedMember {
  name: string;
  avatarPath: string;
}
@Component({
  selector: 'app-selected-members-full-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './selected-members-full-list.component.html',
  styleUrl: './selected-members-full-list.component.scss'
})
export class SelectedMembersFullListComponent {

  @Input() selectedListFromParent?: SelectedMember[];
  @Output() sendIndexToParent: EventEmitter<number> = new EventEmitter<number>()

  removeThisSelectedUser(index:number){
    this.sendIndexToParent.emit(index);
  }
}
