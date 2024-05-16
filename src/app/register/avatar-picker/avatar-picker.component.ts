import { Component, EventEmitter, Input, Output } from '@angular/core';
import { User } from '../../shared/models/user.class';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-avatar-picker',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './avatar-picker.component.html',
  styleUrl: './avatar-picker.component.scss'
})
export class AvatarPickerComponent {
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
    console.log(this.user);
  }

  goBackToRegister() {
    this.goBack.emit(false)
  }

  completeSignup() {
    this.signUpSuccessful.emit(true);
  }

  pickAvatar(i:number) {
    this.avatarImgPath = this.avatars[i];
    this.avatarPicked = true;
  }
}
