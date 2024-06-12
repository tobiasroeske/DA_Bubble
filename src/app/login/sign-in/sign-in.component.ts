import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SignupService } from '../../shared/services/signup/signup.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent implements OnInit{
  @Input() smallScreen!: boolean;
  @Output() passwordForgotten = new EventEmitter<boolean>();

  signupService = inject(SignupService);
  router = inject(Router);

  mail!: string;
  password!: string;
  errorMessage = false;

  ngOnInit(): void {
    this.signupService.getRedirectIntel()
  }

  async onSubmit(ngForm: NgForm) {
    if (ngForm.submitted) {
      let rawForm = ngForm.form.getRawValue()
      await this.signupService.login(rawForm.email, rawForm.password)
    }
  }

  async guestLogin() {
    await this.signupService.guestLogin();
  }

  async googleLogin() {
    if (this.smallScreen) {
      await this.signupService.googleLogin();
    } else {
      await this.signupService.googlePopupLogin();
    }
  }

  forgotPassword() {
    this.passwordForgotten.emit(true);
  }
}
