import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardService } from '../board.service';


@Component({
  selector: 'app-edit-channel-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './edit-channel-dialog.component.html',
  styleUrl: './edit-channel-dialog.component.scss'
})
export class EditChannelDialogComponent {

  boardServ = inject(BoardService);
  
  editName: string = "Bearbeiten";
  editDesc: string = "Bearbeiten"
  editNameBtnClicked: boolean = false;
  editDescriptionBtnClicked: boolean = false;

  onEditButtonClick() {
    if (!this.editNameBtnClicked) {
      this.editNameBtnClicked = true;
      this.editName = "Speichern"
    } else {
      this.editNameBtnClicked = false;
      this.editName = "Bearbeiten"
    }
  }

  onDescriptionButtonClick() {
    if (!this.editDescriptionBtnClicked) {
      this.editDescriptionBtnClicked = true;
      this.editDesc = "Speichern";
    } else {
      this.editDescriptionBtnClicked = false;
      this.editDesc = "Bearbeiten";
    }
  }
}

