import { Component } from '@angular/core';
import { SignupComponent } from './signup/signup.component';
import { AvatarPickerComponent } from '../avatar-picker/avatar-picker.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [SignupComponent, AvatarPickerComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {

}
