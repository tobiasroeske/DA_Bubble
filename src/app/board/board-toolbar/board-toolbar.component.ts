import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardService } from '../board.service';
import { SignupService } from '../../shared/services/signup/signup.service';

@Component({
  selector: 'app-board-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './board-toolbar.component.html',
  styleUrl: './board-toolbar.component.scss'
})
export class BoardToolbarComponent {
  authService = inject(SignupService);
  boardServ = inject(BoardService);
}
