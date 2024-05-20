import { Component, inject } from '@angular/core';
import { SignupComponent } from './signup/signup.component';
import { User } from '../shared/models/user.class';
import { Router } from '@angular/router';
import { AvatarPickerComponent } from './avatar-picker/avatar-picker.component';
import { SignupService } from '../shared/services/signup/signup.service';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [SignupComponent, AvatarPickerComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  router = inject(Router)
  signupService = inject(SignupService)
 
  next = false;
  user = new User();
  signupSuccessful = false;
  goToAvatarPicker($event: boolean) {
    this.next = $event;
  }

  getUserDetail($event: User) {
    this.user = $event;
    console.log(this.user);
  }


  async signup($event: boolean) {
    this.signupSuccessful = $event
    await this.signupService.register();
    setTimeout(() => {
      this.router.navigateByUrl('board')
      
    }, 1500)
  }

  
}
