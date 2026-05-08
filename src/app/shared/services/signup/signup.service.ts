import { Injectable, inject, signal } from '@angular/core';
import { Subject } from 'rxjs';
import {
  Auth,
  UserCredential,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { User } from '../../models/user.class';
import { CurrentUser } from '../../interfaces/currentUser.interface';

@Injectable({ providedIn: 'root' })
export class SignupService {
  private readonly firebaseAuth = inject(Auth);
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);

  // ── Re-export auth signals so existing consumers still work ─────────────
  readonly errorCode = this.authService.errorCode;
  readonly signUpSuccessful = signal<boolean>(false);

  // ── Expose Firebase Auth for legacy consumers that access .auth directly ─
  get auth() {
    return this.authService.auth;
  }

  // ── Registration state ───────────────────────────────────────────────────
  readonly user$ = new Subject<User | null>();
  user: User = new User();

  constructor() {
    this.user$.subscribe(val => {
      if (val) {
        this.user = val;
      }
    });
  }

  // ── Delegated auth methods (backward-compat for existing consumers) ──────
  get currentUser() {
    return this.authService.currentUser;
  }

  async googleLogin(): Promise<void> {
    return this.authService.googleLogin();
  }

  async googlePopupLogin(): Promise<void> {
    return this.authService.googlePopupLogin();
  }

  async getRedirectIntel(): Promise<void> {
    return this.authService.getRedirectIntel();
  }

  async sendPasswordResetMail(mail: string): Promise<void> {
    return this.authService.sendPasswordResetMail(mail);
  }

  async resetPassword(code: string, password: string): Promise<void> {
    return this.authService.resetPassword(code, password);
  }

  async updateEmail(email: string): Promise<void> {
    return this.authService.updateEmail(email);
  }

  async handleEmailUpdate(actionCode: string): Promise<void> {
    return this.authService.handleEmailUpdate(actionCode);
  }

  async verifyEmail(actionCode: string): Promise<void> {
    return this.authService.verifyEmail(actionCode);
  }

  async updateUserProfile(changes: object): Promise<void> {
    return this.authService.updateUserProfile(changes);
  }

  async login(email: string, password: string): Promise<void> {
    return this.authService.login(email, password);
  }

  async guestLogin(): Promise<void> {
    return this.authService.guestLogin();
  }

  async logout(): Promise<void> {
    return this.authService.logout();
  }

  getLoggedInUser(): void {
    return this.authService.getLoggedInUser();
  }

  updateLoggedInUser(user: { uid: string }): void {
    return this.authService.updateLoggedInUser(user);
  }

  findCurrentUser(user: { uid: string }): Record<string, unknown> {
    return this.authService.findCurrentUser(user);
  }

  setCurrentUserObject(obj: unknown): Record<string, unknown> {
    return this.authService.setCurrentUserObject(obj);
  }

  getUserData(uc: UserCredential): void {
    this.user.name = uc.user.displayName!;
    this.user.email = uc.user.email!;
    this.user.avatarPath = uc.user.photoURL!;
  }

  getCurrentUser(): CurrentUser {
    return this.currentUser;
  }

  // ── Registration-specific methods ────────────────────────────────────────
  async register(): Promise<void> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.firebaseAuth,
        this.user.email,
        this.user.password ?? ''
      );
      if (userCredential.user) {
        await this.authService.updateUserProfile({
          photoURL: this.user.avatarPath,
          displayName: this.user.name,
        });
        await this.pipeRegisterData(userCredential);
      }
    } catch (err: unknown) {
      const e = err as { code?: string };
      console.error(err);
      this.authService.errorCode.set(e.code ?? 'unknown-error');
      throw err;
    }
  }

  async pipeRegisterData(userCredential: UserCredential): Promise<void> {
    try {
      await this.authService.updateStorages(
        userCredential,
        this.setNewUserObject(userCredential.user.uid)
      );
      sendEmailVerification(userCredential.user!, this.authService.actionCodeSettings);
      this.signUpSuccessful.set(true);
      setTimeout(() => {
        this.router.navigateByUrl('board');
      }, 1500);
    } catch (err: unknown) {
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
      notification: [],
    };
  }
}
