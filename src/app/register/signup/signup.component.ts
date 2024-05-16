import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { User } from '../../shared/models/user.class';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  user = new User();
  checkboxChecked = false;
  @Output() showNextPage = new EventEmitter<boolean>();
  @Output() passUserDetail = new EventEmitter<User>();


  onSubmit(ngForm: NgForm) {
    if (ngForm.submitted && ngForm.form.valid) {
      this.showNextPage.emit(true);
      this.passUserDetail.emit(this.user);
    }

  }
}
