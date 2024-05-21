import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardService } from '../board.service';
import { FirestoreService } from '../../shared/services/firestore-service/firestore.service';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-edit-channel-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-channel-dialog.component.html',
  styleUrl: './edit-channel-dialog.component.scss'
})
export class EditChannelDialogComponent{

  boardServ = inject(BoardService);
  firestore = inject(FirestoreService);

  editName: string = "Bearbeiten";
  editDesc: string = "Bearbeiten"
  editNameBtnClicked: boolean = false;
  editDescriptionBtnClicked: boolean = false;

  constructor(){
  }


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

