import { Component, EventEmitter, Output } from '@angular/core';
import { User } from '../../shared/models/user.class';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent {
  user = new User();

  @Output() passwordForgotten = new EventEmitter<boolean>();

  onSubmit(ngForm: NgForm) {
    
  }

  forgotPassword() {
    this.passwordForgotten.emit(true);
  }
}
