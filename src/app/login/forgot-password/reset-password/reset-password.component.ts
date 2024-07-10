import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { SignupService } from '../../../shared/services/signup/signup.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  authService = inject(SignupService);
  activatedRoute = inject(ActivatedRoute);
  router = inject(Router)

  newPassword: string = '';
  passwordConfirmation: string = '';
  resetCode: string = '';
  actionMode: string = '';
  passwordNotConfirmed: boolean = false;
  passwordChanged: boolean = false;

  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((params) => {
      this.resetCode = params['oobCode'] || '';
      this.actionMode = params['mode'] || '';
      if (this.actionMode === 'verifyAndChangeEmail') {
        this.changeEmail();
      }
      if (this.actionMode === 'verifyEmail') {
        this.verifyEmail();
      }
    });
  }

  async verifyEmail(): Promise<void> {
    try {
      await this.authService.verifyEmail(this.resetCode);
    } catch (err) {
      console.error('Error verifying email:', err);
    }
  }

  async changeEmail(): Promise<void> {
    try {
      await this.authService.handleEmailUpdate(this.resetCode);
    } catch (err) {
      console.error('Error handling email update:', err);
    }
  }

  comparePasswords(): boolean {
    return this.newPassword === this.passwordConfirmation;
  }

  backToLogin(): void {
    this.router.navigateByUrl('login');
  }

  async onSubmit(ngForm: NgForm): Promise<void> {
    if (ngForm.submitted && ngForm.form.valid && this.comparePasswords()) {
      this.passwordNotConfirmed = false;
      try {
        await this.authService.resetPassword(this.resetCode, this.newPassword);
        this.passwordChanged = true;
        setTimeout(() => this.backToLogin(), 1500);
      } catch (err) {
        console.error('Error resetting password:', err);
      }
    } else if (ngForm.submitted && ngForm.form.valid && !this.comparePasswords()) {
      this.passwordNotConfirmed = true;
    }
  }
}
