import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { User } from '../shared/models/user.class';
import { SignInComponent } from './sign-in/sign-in.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { LocalStorageService } from '../shared/services/local-storage-service/local-storage.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, SignInComponent, ForgotPasswordComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  forgotPassword = false;
  smallScreen = false;
  confirmationMessage = false;
  localStorageService = inject(LocalStorageService)

 ngOnInit(): void {
  this.localStorageService.loadIntroPlayed();
  setTimeout(() => this.localStorageService.saveIntroPlayed(true), 3000);
  if (window.innerWidth <= 760) {this.smallScreen = true}
 }

 @HostListener('window:unload', [ '$event' ])
  async unloadHandler(event: Event) {
    event.preventDefault();
    this.localStorageService.saveIntroPlayed(false);
  }

  @HostListener('window:resize', ['$event'])
  handleResize(event:Event ) {
    if (window.innerWidth <= 760) {
      this.smallScreen = true;
    } else {
      this.smallScreen = false;
    }
  }
  
  openPasswordDialog($event: boolean) {
    this.forgotPassword = $event;
  }

  showConfirmation(event:boolean) {
    this.confirmationMessage = event;
  }
}
