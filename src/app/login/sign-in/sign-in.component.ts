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
    this.signupService.getRedirectIntel();
  }

  async onSubmit(ngForm: NgForm): Promise<void> {
    if (ngForm.submitted) {
      const rawForm = ngForm.form.getRawValue();
      try {
        await this.signupService.login(rawForm.email, rawForm.password);
        this.router.navigateByUrl('board');
      } catch (err) {
        console.error('Login error:', err);
        this.errorMessage = true;
      }
    }
  }

  async guestLogin(): Promise<void> {
    try {
      await this.signupService.guestLogin();
      this.router.navigateByUrl('board');
    } catch (err) {
      console.error('Guest login error:', err);
    }
  }

  async googleLogin(): Promise<void> {
    try {
      if (this.smallScreen) {
        await this.signupService.googleLogin();
      } else {
        await this.signupService.googlePopupLogin();
      }
      this.router.navigateByUrl('board');
    } catch (err) {
      console.error('Google login error:', err);
    }
  }

  forgotPassword(): void {
    this.passwordForgotten.emit(true);
  }

}
