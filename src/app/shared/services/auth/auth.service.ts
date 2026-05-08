import { Injectable, inject, signal } from '@angular/core';
import {
  ActionCodeSettings,
  Auth,
  GoogleAuthProvider,
  UserCredential,
  applyActionCode,
  checkActionCode,
  confirmPasswordReset,
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
import { CurrentUser } from '../../interfaces/currentUser.interface';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly firestoreService = inject(FirestoreService);
  private readonly storageService = inject(LocalStorageService);

  readonly provider = new GoogleAuthProvider();
  readonly errorCode = signal<string>('');
  readonly signupSuccessful = signal<boolean>(false);

  currentUser!: CurrentUser;

  readonly actionCodeSettings: ActionCodeSettings = {
    url: 'https://dabubble.tobias-roeske.ch/resetpassword',
  };

  async googleLogin(): Promise<void> {
    try {
      await signInWithRedirect(this.auth, this.provider);
    } catch (err: unknown) {
      console.error(err);
      throw err;
    }
  }

  async googlePopupLogin(): Promise<void> {
    try {
      const result = await signInWithPopup(this.auth, this.provider);
      if (result.user) {
        await this.handleSuccessfulLogin(result.user);
      }
    } catch (err: unknown) {
      console.error(err);
      throw err;
    }
  }

  private async handleSuccessfulLogin(user: unknown): Promise<void> {
    try {
      if (user) {
        await this.storageService.saveCurrentUser(user);
        this.router.navigateByUrl('board');
      }
    } catch (err: unknown) {
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
    } catch (err: unknown) {
      console.error(err);
      throw err;
    }
  }

  async sendPasswordResetMail(mail: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, mail, this.actionCodeSettings);
    } catch (err: unknown) {
      console.error(err);
      throw err;
    }
  }

  async resetPassword(code: string, password: string): Promise<void> {
    try {
      await confirmPasswordReset(this.auth, code, password);
    } catch (err: unknown) {
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
        this.errorCode.set('no error');
      }
    } catch (err: unknown) {
      const e = err as { code?: string };
      console.error(err);
      this.errorCode.set(e.code ?? 'unknown-error');
      throw err;
    }
  }

  async handleEmailUpdate(actionCode: string): Promise<void> {
    try {
      const info = await checkActionCode(this.auth, actionCode);
      void info.data.email;
      await applyActionCode(this.auth, actionCode);
    } catch (err: unknown) {
      console.error(err);
      throw err;
    }
  }

  async verifyEmail(actionCode: string): Promise<void> {
    try {
      await applyActionCode(this.auth, actionCode);
    } catch (err: unknown) {
      console.error(err);
      throw err;
    }
  }

  async updateUserProfile(changes: object): Promise<void> {
    try {
      if (this.auth.currentUser) {
        await updateProfile(this.auth.currentUser, changes);
        this.storageService.saveCurrentUser(this.auth.currentUser);
      }
    } catch (err: unknown) {
      console.error(err);
      throw err;
    }
  }

  getUserData(uc: UserCredential): void {
    // Implemented in SignupService using the User model
    void uc;
  }

  async login(email: string, password: string): Promise<void> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      this.updateLoggedInUser(userCredential.user);
      this.router.navigateByUrl('board');
    } catch (err: unknown) {
      const e = err as { code?: string };
      console.error(err);
      this.errorCode.set(e.code ?? 'unknown-error');
      throw err;
    }
  }

  async guestLogin(): Promise<void> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        'guest@guest.de',
        '12345678'
      );
      await this.updateUserProfile({ photoURL: 'assets/img/profile_big.png' });
      this.updateLoggedInUser(userCredential.user);
      this.router.navigateByUrl('board');
    } catch (err: unknown) {
      const e = err as { code?: string };
      console.error(err);
      this.errorCode.set(e.code ?? 'unknown-error');
      throw err;
    }
  }

  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.storageService.saveCurrentUser('');
      window.open('login', '_self');
    } catch (err: unknown) {
      console.error(err);
      throw err;
    }
  }

  async updateStorages(uc: UserCredential, newUserObject: CurrentUser): Promise<void> {
    try {
      this.storageService.saveCurrentUser(uc.user);
      await this.firestoreService.addUser(uc.user.uid, newUserObject);
    } catch (err: unknown) {
      console.error(err);
      throw err;
    }
  }

  updateLoggedInUser(user: { uid: string }): void {
    try {
      const currentUser = this.findCurrentUser(user);
      currentUser['loginState'] = 'loggedIn';
      this.storageService.saveCurrentUser(currentUser);
      this.firestoreService.updateUser(
        currentUser['uid'] as string,
        this.storageService.setCurrentUserObject(currentUser)
      );
    } catch (err: unknown) {
      console.error(err);
      throw err;
    }
  }

  getLoggedInUser(): void {
    onAuthStateChanged(this.auth, user => {
      if (user) {
        this.currentUser = user as unknown as CurrentUser;
        this.storageService.saveCurrentUser(user);
      } else {
        this.storageService.saveCurrentUser(user);
      }
    });
  }

  findCurrentUser(user: { uid: string }): Record<string, unknown> {
    const allUsers = this.firestoreService.userList();
    const currentUser = allUsers.find(u => u.id === user.uid);
    return this.setCurrentUserObject(currentUser);
  }

  setCurrentUserObject(obj: unknown): Record<string, unknown> {
    const u = obj as Record<string, unknown>;
    return {
      uid: u['id'],
      displayName: u['name'],
      email: u['email'],
      photoURL: u['avatarPath'],
      selected: u['selected'] ?? false,
      loginState: u['loginState'],
      type: u['type'],
      notification: u['notification'],
    };
  }
}
