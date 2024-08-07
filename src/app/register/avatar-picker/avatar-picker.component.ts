import { Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { User } from '../../shared/models/user.class';
import { RouterLink } from '@angular/router';
import { SignupService } from '../../shared/services/signup/signup.service';
import { FirebaseStorageService } from '../../shared/services/firebase-storage-service/firebase-storage.service';


@Component({
  selector: 'app-avatar-picker',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './avatar-picker.component.html',
  styleUrl: './avatar-picker.component.scss'
})
export class AvatarPickerComponent implements OnInit {
  @Input() userData!: User;
  @Output() goBack = new EventEmitter<boolean>();
  @Output() signUpSuccessful = new EventEmitter<boolean>();

  signupService = inject(SignupService);
  firebaseStorageService = inject(FirebaseStorageService);

  user!: User;
  avatars: string[] = ['assets/img/avatar0.png', 'assets/img/avatar1.png', 'assets/img/avatar2.png', 'assets/img/avatar3.png', 'assets/img/avatar4.png', 'assets/img/avatar5.png']
  avatarImgPath = 'assets/img/profile_big.png';
  avatarPicked = false;

  ngOnInit(): void {
    this.user = this.userData;
  }

  async onFileChange(event: any): Promise<void> {
    const file = event.target.files[0];
    if (file) {
      const path = `avatarImages/${file.name}`;
      try {
        await this.firebaseStorageService.uploadFile(path, file);
        const url = await this.firebaseStorageService.getDownloadUrl(path);
        this.user.avatarPath = url;
        this.avatarImgPath = url;
        this.avatarPicked = true;
      } catch (err) {
        console.error('Error handling file change:', err);
      }
    }
  }

  goBackToRegister(): void {
    this.goBack.emit(false)
    this.signupService.signUpSuccessful = false;
    this.signupService.errorCode = '';
  }

  completeSignup(): void {
    this.signupService.user$.next(this.user);
    this.signUpSuccessful.emit(true);
  }

  pickAvatar(i: number): void {
    this.user.avatarPath = this.avatars[i];
    this.avatarImgPath = this.avatars[i];
    this.avatarPicked = true;
  }
}
