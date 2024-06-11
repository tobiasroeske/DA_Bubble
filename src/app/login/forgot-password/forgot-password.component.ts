import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { User } from '../../shared/models/user.class';
import { SignupService } from '../../shared/services/signup/signup.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  @Output() goBack = new EventEmitter<boolean>();
  @Output() emailSent = new EventEmitter<boolean>();

  authService = inject(SignupService);
  
  mail = '';
  
  onSubmit(ngForm: NgForm) {
    if (ngForm.form.valid && ngForm.submitted) {
      this.authService.sendPasswordResetMail(this.mail)
      .then(() => this.emailSent.emit(true))
    }
  }

  gotBackToLogin() {
    this.goBack.emit(false);
    this.emailSent.emit(false)
  }
}
