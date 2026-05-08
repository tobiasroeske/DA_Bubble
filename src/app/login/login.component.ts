import { Component, HostListener, OnInit, inject, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { SignInComponent } from './sign-in/sign-in.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LocalStorageService } from '../shared/services/local-storage-service/local-storage.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-login',
  imports: [FormsModule, SignInComponent, ForgotPasswordComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  localStorageService = inject(LocalStorageService);

  forgotPassword = false;
  smallScreen = false;
  confirmationMessage = false;

  @HostListener('window:unload', ['$event'])
  unloadHandler(event: Event): void {
    event.preventDefault();
    this.localStorageService.saveIntroPlayed(false);
  }

  @HostListener('window:resize', ['$event'])
  handleResize(event: Event): void {
    if (window.innerWidth <= 760) {
      this.smallScreen = true;
    } else {
      this.smallScreen = false;
    }
  }

  ngOnInit(): void {
    this.localStorageService.loadIntroPlayed();
    if (window.innerWidth <= 760) {
      this.smallScreen = true;
    }
  }

  onIntroEnd(event: AnimationEvent): void {
    if (event.animationName === 'background-vanish') {
      this.localStorageService.saveIntroPlayed(true);
    }
  }

  openPasswordDialog($event: boolean) {
    this.forgotPassword = $event;
  }

  showConfirmation(event: boolean) {
    this.confirmationMessage = event;
  }
}
