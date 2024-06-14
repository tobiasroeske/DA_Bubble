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
import { CurrentUser } from '../../interfaces/currentUser.interface';
import { NotificationObj } from '../../models/notificationObj.class';


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
    this.actionCodeSettings = { url: 'https://dabubble-212.developerakademie.net/angular-projects/dabubble/resetpassword' };
  }

  async googleLogin() {
    await signInWithRedirect(this.auth, this.provider).catch((err) =>
      console.error(err)
    );
  }

  async googlePopupLogin() {
    await signInWithPopup(this.auth, this.provider).then(result => {
      if (result != null) {
        this.getUserData(result);
        this.firestoreService.addUser(result.user.uid, this.setNewUserObject(result.user.uid))
          .then(() => {
            this.storageService.saveCurrentUser(result.user);
            this.router.navigateByUrl('board');
          });
      }
    })
      .catch(err => {
        console.error(err);
        this.googleLogin();
      })
  }

  async getRedirectIntel() {
    await getRedirectResult(this.auth).then((result) => {
      if (result != null) {
        this.getUserData(result);
        this.firestoreService
          .addUser(result.user.uid, this.setNewUserObject(result.user.uid))
          .then(() => {
            this.storageService.saveCurrentUser(result.user);
            this.router.navigateByUrl('board');
          });
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
    await checkActionCode(this.auth, actionCode)
      .then(info => {
        restoredMail = info['data']['email'];
        return applyActionCode(this.auth, actionCode)
          .catch(err => console.error(err))
      })
  }

  async verifyEmail(actionCode: string) {
    await applyActionCode(this.auth, actionCode)
      .then(() => {
      }).catch(err => console.error(err));
  }

  async updateUserProfile(changes: {}) {
    if (this.auth.currentUser != null) {
      await updateProfile(this.auth.currentUser, changes)
        .then(() => { this.storageService.saveCurrentUser(this.auth.currentUser) })
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
            .then(() => { this.pipeRegisterData(userCredential) })
        }
      })
      .catch((err) => {
        this.errorCode = err.code;
      });
  }

  pipeRegisterData(userCredential: UserCredential) {
    this.updateStorages(userCredential)
    sendEmailVerification(userCredential.user, this.actionCodeSettings);
    this.signUpSuccessful = true;
    setTimeout(() => {
      this.router.navigateByUrl('board');
    }, 1500);
  }

  setNewUserObject(userId: string): CurrentUser {
    return {
      id: userId,
      name: this.user.name,
      email: this.user.email,
      avatarPath: this.user.avatarPath,
      loginState: "loggedOut",
      type: 'CurrentUser',
      notification: []
    };
  }

  getCurrentUser() {
    return this.currentUser;
  }

  async login(email: string, password: string) {
    await signInWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        this.storageService.saveCurrentUser(this.findCurrentUser(userCredential.user));
        this.router.navigateByUrl('board');
      })
      .catch((err) => {
        this.errorCode = err.code;
      });
  }

  findCurrentUser(user: any) {
    let allUsers = this.firestoreService.userList;
    let currentUser = allUsers.find(u => u.id == user.uid)
    console.log('currentUser from signup', currentUser);
    let currentUserAsUC = this.setCurrentUserObject(currentUser)
    return currentUserAsUC;
  }

  setCurrentUserObject(obj: any) {
    return {
      uid: obj.id,
      displayName: obj.name,
      email: obj.email,
      photoURL: obj.avatarPath,
      seleted: obj.seleted || false,
      loginState: obj.loginState,
      type: obj.type,
      notification: obj.notification
    }
  }

  async guestLogin() {
    await signInWithEmailAndPassword(this.auth, 'guest@guest.de', '12345678')
      .then((userCredential) => {
        this.updateUserProfile({ photoURL: 'assets/img/profile_big.png' })
        this.storageService.saveCurrentUser(userCredential.user);
        this.router.navigateByUrl('board');
      })
      .catch(err => {
        this.errorCode = err.code;
      })
  }

  getLoggedInUser() {
    onAuthStateChanged(this.auth, (user) => {
      if (user) {
        const uid = user.uid;
        this.currentUser = user;
        this.storageService.saveCurrentUser(user);
      } else {
        this.storageService.saveCurrentUser(user);
      }
    });
  }

  async logout() {
    let currentUser = this.storageService.loadCurrentUser();
    currentUser.loginState = 'loggedOut';
    this.storageService.saveIntroPlayed(false)
    await this.firestoreService.updateUser(currentUser.id, currentUser)
      .then(() => {
        signOut(this.auth).then(() => {
          this.storageService.saveCurrentUser('');
          window.open('login', '_self');
        })
      })
  }
}
