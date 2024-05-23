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
  passwordNotConfirmed = false;
  resetCode!: string;
  passwordChanged = false;
  actionMode!: string;

  ngOnInit(): void {
    console.log(this.activatedRoute);
    
    this.activatedRoute.queryParams.subscribe((val) => {
      this.resetCode = val['oobCode']
      this.actionMode = val['mode']
    })
    
    
  }

  comparePasswords() {
    if(this.newPassword == this.passwordConfirmation){
      return true;
    } else {
      return false;
    }
  }

  backtoLogin() {
    this.router.navigateByUrl('login');
  }

  onSubmit(ngForm: NgForm) {
    if (ngForm.submitted && ngForm.form.valid && this.comparePasswords()) {
      this.passwordNotConfirmed = false;
      this.authService.resetPassword(this.resetCode, this.newPassword)
      .then(() => {
        this.passwordChanged = true;
        setTimeout(() => {
          this.backtoLogin();
        },1500)
      })
    } else if (ngForm.submitted && ngForm.form.valid && !this.comparePasswords()) {
      this.passwordNotConfirmed = true;
    }
  }
}
