import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { User } from '../../shared/models/user.class';
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
  signupService = inject(SignupService);
  router = inject(Router);
  mail!: string;
  password!: string;
  errorMessage = false;

  @Output() passwordForgotten = new EventEmitter<boolean>();

  ngOnInit(): void {
    this.signupService.getRedirectIntel()
  }

  async onSubmit(ngForm: NgForm) {
    if (ngForm.submitted) {
      let rawForm = ngForm.form.getRawValue()
      await this.signupService.login(rawForm.email, rawForm.password)
      // .then(() => this.router.navigateByUrl('board'))
      // .catch(err => {
        
      //   this.errorMessage = true;
      //   console.log(err);
      //   console.log(err.code);
        
      // })
    }
  }

  googleLogin() {
    this.signupService.googleLogin()
  }

  forgotPassword() {
    this.passwordForgotten.emit(true);
  }
}
