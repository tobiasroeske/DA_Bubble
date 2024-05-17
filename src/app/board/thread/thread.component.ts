import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'app-thread',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './thread.component.html',
  styleUrl: './thread.component.scss'
})
export class ThreadComponent {

  specialBlue:string = "rgba(83, 90, 241, 1)"
}
