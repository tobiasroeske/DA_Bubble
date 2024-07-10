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
  updateProfile,
  verifyBeforeUpdateEmail,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { FirestoreService } from '../firestore-service/firestore.service';
import { LocalStorageService } from '../local-storage-service/local-storage.service';
import { User } from '../../models/user.class';
import { CurrentUser } from '../../interfaces/currentUser.interface';

@Injectable({
  providedIn: 'root',
})
export class SignupService {
  auth = inject(Auth);
  router = inject(Router);
  firestoreService = inject(FirestoreService);
  storageService = inject(LocalStorageService);

  provider = new GoogleAuthProvider();
  user$ = new Subject<User | null>();
  user: User = new User();

  currentUser!: any;
  errorCode!: string;
  signUpSuccessful = false;
  actionCodeSettings: ActionCodeSettings = { url: 'https://dabubble.tobias-roeske.ch/resetpassword' };

  constructor() {
    this.user$.subscribe((val) => {
      if (val) {
        this.user = val;
      }
    });
  }

  async googleLogin(): Promise<void> {
    try {
      await signInWithRedirect(this.auth, this.provider);
    } catch (err: any) {
      console.error(err);
      throw err; // Rethrow the error to propagate it upwards
    }
  }

  async googlePopupLogin(): Promise<void> {
    try {
      const result = await signInWithPopup(this.auth, this.provider);
      if (result.user) {
        await this.handleSuccessfulLogin(result.user);
      }
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  }

  private async handleSuccessfulLogin(user: any): Promise<void> {
    try {
      if (user) {
        await this.storageService.saveCurrentUser(user);
        this.router.navigateByUrl('board');
      }
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  }

  async getRedirectIntel(): Promise<void> {
    try {
      const result = await getRedirectResult(this.auth);
      if (result?.user) {
        await this.handleSuccessfulLogin(result.user);
      }
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  }

  getUserData(uc: UserCredential): void {
    this.user.name = uc.user.displayName!;
    this.user.email = uc.user.email!;
    this.user.avatarPath = uc.user.photoURL!;
  }

  async sendPasswordResetMail(mail: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, mail, this.actionCodeSettings);
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  }

  async resetPassword(code: string, password: string): Promise<void> {
    try {
      await confirmPasswordReset(this.auth, code, password);
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  }

  async updateEmail(email: string): Promise<void> {
    try {
      const currentUser = this.auth.currentUser;
      if (currentUser) {
        await verifyBeforeUpdateEmail(currentUser, email);
        this.storageService.saveCurrentUser(currentUser);
        this.errorCode = 'no error';
      }
    } catch (err: any) {
      console.error(err);
      this.errorCode = err.code;
      throw err;
    }
  }

  async handleEmailUpdate(actionCode: string): Promise<void> {
    try {
      let restoredMail: string | null | undefined = null;
      const info = await checkActionCode(this.auth, actionCode);
      restoredMail = info.data.email;
      await applyActionCode(this.auth, actionCode);
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  }

  async verifyEmail(actionCode: string): Promise<void> {
    try {
      await applyActionCode(this.auth, actionCode);
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  }

  async updateUserProfile(changes: {}): Promise<void> {
    try {
      if (this.auth.currentUser) {
        await updateProfile(this.auth.currentUser, changes);
        this.storageService.saveCurrentUser(this.auth.currentUser);
      }
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  }

  async updateStorages(uc: UserCredential): Promise<void> {
    try {
      this.storageService.saveCurrentUser(uc.user);
      await this.firestoreService.addUser(uc.user.uid, this.setNewUserObject(uc.user.uid));
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  }

  async register(): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, this.user.email, this.user.password);
      if (userCredential.user) {
        await this.updateUserProfile({ photoURL: this.user.avatarPath, displayName: this.user.name });
        await this.pipeRegisterData(userCredential);
      }
    } catch (err: any) {
      console.error(err);
      this.errorCode = err.code;
      throw err;
    }
  }

  pipeRegisterData(userCredential: UserCredential): void {
    try {
      this.updateStorages(userCredential);
      sendEmailVerification(userCredential.user!, this.actionCodeSettings);
      this.signUpSuccessful = true;
      setTimeout(() => {
        this.router.navigateByUrl('board');
      }, 1500);
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  }

  setNewUserObject(userId: string): CurrentUser {
    return {
      id: userId,
      name: this.user.name || '',
      email: this.user.email || '',
      avatarPath: this.user.avatarPath || '',
      loginState: 'loggedOut',
      type: 'CurrentUser',
      notification: []
    };
  }

  getCurrentUser(): any {
    return this.currentUser;
  }

  async login(email: string, password: string): Promise<void> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      this.updateLoggedInUser(userCredential.user);
      this.router.navigateByUrl('board');
    } catch (err: any) {
      console.error(err);
      this.errorCode = err.code;
      throw err;
    }
  }

  findCurrentUser(user: any): any {
    const allUsers = this.firestoreService.userList;
    const currentUser = allUsers.find((u: any) => u.id === user.uid);
    const currentUserAsUC = this.setCurrentUserObject(currentUser);
    return currentUserAsUC;
  }

  setCurrentUserObject(obj: any): any {
    return {
      uid: obj.id,
      displayName: obj.name,
      email: obj.email,
      photoURL: obj.avatarPath,
      seleted: obj.seleted || false,
      loginState: obj.loginState,
      type: obj.type,
      notification: obj.notification
    };
  }

  async guestLogin(): Promise<void> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, 'guest@guest.de', '12345678');
      await this.updateUserProfile({ photoURL: 'assets/img/profile_big.png' });
      this.updateLoggedInUser(userCredential.user);
      this.router.navigateByUrl('board');
    } catch (err: any) {
      console.error(err);
      this.errorCode = err.code;
      throw err;
    }
  }

  updateLoggedInUser(user: any): void {
    try {
      const currentUser = this.findCurrentUser(user);
      currentUser.loginState = 'loggedIn';
      this.storageService.saveCurrentUser(currentUser);
      this.firestoreService.updateUser(currentUser.uid, this.storageService.setCurrentUserObject(currentUser));
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  }

  getLoggedInUser(): void {
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

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.storageService.saveCurrentUser('');
      window.open('login', '_self');
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  }
}
