import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { User } from '../../shared/models/user.class';
import { RouterLink } from '@angular/router';
import { SignupService } from '../../shared/services/signup/signup.service';

@Component({
  selector: 'app-avatar-picker',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './avatar-picker.component.html',
  styleUrl: './avatar-picker.component.scss'
})
export class AvatarPickerComponent {
  signupService = inject(SignupService);
  @Input() userData!:User;
  @Output() goBack = new EventEmitter<boolean>();
  user!: User;
  avatarPicked = false;
  @Output() signUpSuccessful = new EventEmitter<boolean>();
  avatars: string[] = ['avatar0.png', 'avatar1.png', 'avatar2.png', 'avatar3.png', 'avatar4.png', 'avatar5.png']
  avatarImgPath = 'profile_big.png';


  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.user = this.userData;
  }

  goBackToRegister() {
    this.goBack.emit(false)
    this.signupService.signUpSuccessful = false;
    this.signupService.errorCode = '';
  }

  completeSignup() {
    this.signupService.user$.next(this.user);
    this.signUpSuccessful.emit(true);
  }

  pickAvatar(i:number) {
    this.user.avatarPath = this.avatars[i];
    this.avatarImgPath = this.avatars[i];
    this.avatarPicked = true;
  }
}
