import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { User } from '../../shared/models/user.class';
import { SignupService } from '../../shared/services/signup/signup.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  authService = inject(SignupService);
  mail = '';
  @Output() goBack = new EventEmitter<boolean>();
  
  
  onSubmit(ngForm: NgForm) {
    if (ngForm.form.valid && ngForm.submitted) {
      this.authService.sendPasswordResetMail(this.mail);
    }
  }

  gotBackToLogin() {
    this.goBack.emit(false);
  }
}
