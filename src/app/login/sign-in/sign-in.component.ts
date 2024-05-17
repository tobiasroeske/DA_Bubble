import { Component, EventEmitter, Output, inject } from '@angular/core';
import { User } from '../../shared/models/user.class';
import { FormsModule, NgForm } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SignupService } from '../../shared/services/signup/signup.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent {
  signupService = inject(SignupService);
  router = inject(Router);
  mail = '';
  password = '';

  @Output() passwordForgotten = new EventEmitter<boolean>();

  onSubmit(ngForm: NgForm) {
    this.login();
  }

  async login() {
    await this.signupService.login(this.mail, this.password);
    this.router.navigateByUrl('board');
  }

  forgotPassword() {
    this.passwordForgotten.emit(true);
  }
}
