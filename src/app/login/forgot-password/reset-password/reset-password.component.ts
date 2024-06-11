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

  newPassword = '';
  passwordConfirmation = '';
  resetCode!: string;
  actionMode!: string;
  passwordNotConfirmed = false;
  passwordChanged = false;
  
  ngOnInit(): void {
    this.activatedRoute.queryParams.subscribe((val) => {
      this.resetCode = val['oobCode']
      this.actionMode = val['mode']
    })
    if (this.actionMode == 'verifyAndChangeEmail') {
      this.changeEmail();
    }
    if (this.actionMode =='verifyEmail') {
      this.verifyEmail();
    }
  }

  verifyEmail() {
    this.authService.verifyEmail(this.resetCode);
  }

  changeEmail() {
    this.authService.handleEmailUpdate(this.resetCode);
  }

  comparePasswords() {
    if(this.newPassword == this.passwordConfirmation){
      return true;
    } else {
      return false;
    }
  }

  backToLogin() {
    this.router.navigateByUrl('login');
  }

  onSubmit(ngForm: NgForm) {
    if (ngForm.submitted && ngForm.form.valid && this.comparePasswords()) {
      this.passwordNotConfirmed = false;
      this.authService.resetPassword(this.resetCode, this.newPassword)
      .then(() => {
        this.passwordChanged = true;
        setTimeout(() => { this.backToLogin() },1500)
      })
    } else if (ngForm.submitted && ngForm.form.valid && !this.comparePasswords()) {
      this.passwordNotConfirmed = true;
    }
  }
  
}
