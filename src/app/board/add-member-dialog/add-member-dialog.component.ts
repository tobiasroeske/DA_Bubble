import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BoardService } from '../board.service';
import { AddSpecificPersonDialogComponent } from './add-specific-person-dialog/add-specific-person-dialog.component';

@Component({
  selector: 'app-add-member-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, AddSpecificPersonDialogComponent],
  templateUrl: './add-member-dialog.component.html',
  styleUrl: './add-member-dialog.component.scss'
})
export class AddMemberDialogComponent {
  specificMember: boolean = false;
  allMembers: boolean = false;

  boardServ = inject(BoardService);

  onCheck(condition: string) {
    if (condition == "allMembers") {
      this.allMembers = !this.allMembers;
      this.specificMember = false;
    } else {
      this.specificMember = !this.specificMember;
      this.allMembers = false;
    }
  }

  closeAddMemberDialog(event: Event) {
    this.boardServ.addMemberDialogIsOpen = false;
    this.boardServ.addSpecificPerson = false;
    event.stopPropagation();
  }
}
