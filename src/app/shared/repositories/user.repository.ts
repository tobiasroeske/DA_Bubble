import { Injectable, inject, signal } from '@angular/core';
import {
  Firestore,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { Unsubscribe } from '@angular/fire/auth';
import { CurrentUser } from '../interfaces/currentUser.interface';

@Injectable({ providedIn: 'root' })
export class UserRepository {
  private readonly firestore = inject(Firestore);

  readonly userList = signal<CurrentUser[]>([]);

  private unsub: Unsubscribe;

  constructor() {
    this.unsub = this.subUsersList();
  }

  getUsersRef() {
    return collection(this.firestore, 'users');
  }

  getUserDocRef(userId: string) {
    return doc(this.getUsersRef(), userId);
  }

  async addUser(userId: string, user: CurrentUser): Promise<void> {
    try {
      await setDoc(this.getUserDocRef(userId), user);
    } catch (error) {
      console.error('Error adding user:', error);
    }
  }

  async updateUser(userId: string, newUser: CurrentUser): Promise<void> {
    try {
      const userRef = this.getUserDocRef(userId);
      const userUpdate = this.setUserObject(newUser as unknown as Record<string, unknown>, userId);
      await updateDoc(userRef, userUpdate as unknown as Record<string, unknown>);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  }

  async updateUserNotification(userId: string, notification: unknown): Promise<void> {
    try {
      const userRef = this.getUserDocRef(userId);
      await updateDoc(userRef, { notification: arrayUnion(notification) });
    } catch (error) {
      console.error('Error updating user notification:', error);
    }
  }

  subUsersList(): Unsubscribe {
    return onSnapshot(this.getUsersRef(), list => {
      const items: CurrentUser[] = [];
      list.forEach(snapshot => {
        items.push(this.setUserObject(snapshot.data(), snapshot.id));
      });
      this.userList.set(items);
    });
  }

  setUserObject(obj: Record<string, unknown>, id: string): CurrentUser {
    return {
      id: id || '',
      name: (obj['name'] as string) || '',
      email: (obj['email'] as string) || '',
      avatarPath: (obj['avatarPath'] as string) || '',
      selected: (obj['selected'] as boolean) || false,
      directMessages: (obj['directMessages'] as string[]) || [],
      loginState: ((obj['loginState'] as string) || 'loggedOut') as CurrentUser['loginState'],
      type: 'CurrentUser',
      notification: (obj['notification'] as unknown[]) || [],
    } as CurrentUser;
  }

  getCleanUserJson(obj: Record<string, unknown>) {
    return {
      id: obj['id'] ?? '',
      name: obj['name'] ?? '',
      email: obj['email'] ?? '',
      avatarPath: obj['avatarPath'] ?? '',
      selected: obj['selected'] ?? false,
      directMessages: obj['directMessages'] ?? [],
    };
  }
}
