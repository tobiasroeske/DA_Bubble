import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BoardToolbarComponent } from './board-toolbar/board-toolbar.component';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, BoardToolbarComponent],
  templateUrl: './board.component.html',
  styleUrl: './board.component.scss'
})
export class BoardComponent {

}
