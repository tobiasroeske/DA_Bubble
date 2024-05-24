import { Injectable, inject } from '@angular/core';
import { Subject } from 'rxjs';
import {
  ActionCodeSettings,
  Auth,
  GoogleAuthProvider,
  UserCredential,
  applyActionCode,
  checkActionCode,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  getRedirectResult,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  updateEmail,
  updateProfile,
  user,
  verifyBeforeUpdateEmail,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { FirestoreService } from '../firestore-service/firestore.service';
import { LocalStorageService } from '../local-storage-service/local-storage.service';
import { User } from '../../models/user.class';
import { appConfig } from '../../../app.config';


@Injectable({
  providedIn: 'root',
})
export class SignupService {
  auth = inject(Auth);
  router = inject(Router);
  firestoreService = inject(FirestoreService);
  storageService = inject(LocalStorageService);
  provider = new GoogleAuthProvider();
  user$ = new Subject();
  user = new User();
  currentUser!: any;
  errorCode!: string;
  signUpSuccessful = false;
  actionCodeSettings: ActionCodeSettings;

  constructor() {
    this.user$.subscribe((val) => {
      this.user = new User(val);
    });
    this.actionCodeSettings = {
      url: 'http://localhost:4200/resetpassword',
    };
    console.log(this.user);
  }

  async googleLogin() {
    await signInWithRedirect(this.auth, this.provider).catch((err) =>
      console.log(err)
    );
  }

  async getRedirectIntel() {
    await getRedirectResult(this.auth).then((result) => {
      if (result != null) {
        this.updateUserProfile({ photoURL: 'assets/img/avatar0.png' }).then(
          () => {
            this.getUserData(result);
            this.firestoreService
              .addUser(result.user.uid, this.setNewUserObject(result.user.uid))
              .then(() => {
                this.router.navigateByUrl('board');
              });
          }
        );
      }
    });
  }

  getUserData(uc: UserCredential) {
    this.user.name = uc.user.displayName!;
    this.user.email = uc.user.email!;
    this.user.avatarPath = uc.user.photoURL!;
  }

  async sendPasswordResetMail(mail: string) {
    await sendPasswordResetEmail(this.auth, mail, this.actionCodeSettings)
      .then(() => console.log('Email sent'))
      .catch((err) => console.log(err));
  }

  async resetPassword(code: string, password: string) {
    await confirmPasswordReset(this.auth, code, password)
      .then(() => console.log('password changed'))
      .catch((err) => console.log(err));
  }

  async updateEmail(email: string) {
    if (this.auth.currentUser != null) {
      await verifyBeforeUpdateEmail(this.auth.currentUser, email)
        .then(() => {
          this.storageService.saveCurrentUser(this.auth.currentUser);
          this.errorCode = 'no error';
        })
        .catch((err) => {
          this.errorCode = err.code;
        });
    }
  }

  async handleEmailUpdate(actionCode: string) {
    let restoredMail = null;
    checkActionCode(this.auth, actionCode)
    .then(info => {
      restoredMail = info['data']['email'];
      return applyActionCode(this.auth, actionCode)
      .then(() => {
        console.log('email changed');
        
      })
      .catch(err => console.log(err))
    })
  }

  async verifyEmail(actionCode:string) {
    await applyActionCode(this.auth, actionCode)
    .then(response => {
      console.log('Email verified');
    }).catch(err => console.log(err));
  }

  async updateUserProfile(changes: {}) {
    if (this.auth.currentUser != null) {
      await updateProfile(this.auth.currentUser, changes)
        .then(() => {
          this.storageService.saveCurrentUser(this.auth.currentUser);
        })
        .catch((err) => console.error(err));
    }
  }

  async updateStorages(uc: UserCredential) {
    this.storageService.saveCurrentUser(uc.user);
    await this.firestoreService.addUser(uc.user.uid, this.setNewUserObject(uc.user.uid))
  }

  async register() {
    await createUserWithEmailAndPassword(this.auth, this.user.email, this.user.password)
      .then(userCredential => {
        if (userCredential.user != null) {
          this.updateUserProfile({ photoURL: this.user.avatarPath, displayName: this.user.name, })
            .then(() => {
              this.updateStorages(userCredential)
              sendEmailVerification(userCredential.user);
              this.signUpSuccessful = true;
              setTimeout(() => {
                this.router.navigateByUrl('board');
              }, 1500);
            })
        }
      })
      .catch((err) => {
        this.errorCode = err.code;
      });
  }

  setNewUserObject(userId: string) {
    return {
      id: userId,
      name: this.user.name,
      email: this.user.email,
      avatarPath: this.user.avatarPath,
    };
  }

  getCurrentUser() {
    return this.currentUser;
  }

  async login(email: string, password: string) {
    await signInWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        this.storageService.saveCurrentUser(userCredential.user);
        this.router.navigateByUrl('board');
      })
      .catch((err) => {
        this.errorCode = err.code;
      });
  }

  getLoggedInUser() {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        const uid = user.uid;
        this.currentUser = user;
        console.log('Current user is: ', this.currentUser);

        this.storageService.saveCurrentUser(user);
      } else {
        console.log(user + 'is signed out');
        this.storageService.saveCurrentUser(user);
      }
    });
  }

  async logout() {
    await signOut(this.auth).then(() => {
      this.storageService.saveCurrentUser('');
      window.open('login', '_self');
    });
  }
}
