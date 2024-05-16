import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { User } from '../../shared/models/user.class';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  mail = '';
  @Output() goBack = new EventEmitter<boolean>();
  onSubmit(ngForm: NgForm) {

  }

  gotBackToLogin() {
    this.goBack.emit(false);
  }
}
