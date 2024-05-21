import { Component, inject } from '@angular/core';
import { BoardService } from '../board/board.service';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-profile-dialog',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './edit-profile-dialog.component.html',
  styleUrl: './edit-profile-dialog.component.scss'
})
export class EditProfileDialogComponent {
  boardServ = inject(BoardService);
  fullname!: string;
  mail!: string;

  

 

  onsubmit(ngForm: NgForm) {
   
  }

}
