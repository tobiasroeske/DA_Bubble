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
import { UserProfile, AppNotification } from '../interfaces/user.interface';

@Injectable({ providedIn: 'root' })
export class UserRepository {
  private readonly firestore = inject(Firestore);

  readonly userList = signal<UserProfile[]>([]);

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

  async addUser(userId: string, user: Omit<UserProfile, 'id'>): Promise<void> {
    try {
      await setDoc(this.getUserDocRef(userId), user);
    } catch (error) {
      console.error('Error adding user:', error);
    }
  }

  async updateUser(userId: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      await updateDoc(this.getUserDocRef(userId), updates as Record<string, unknown>);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  }

  async updatePresence(userId: string, status: UserProfile['loginState']): Promise<void> {
    try {
      await updateDoc(this.getUserDocRef(userId), { loginState: status });
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  }

  async addNotification(userId: string, notification: AppNotification): Promise<void> {
    try {
      await updateDoc(this.getUserDocRef(userId), { notifications: arrayUnion(notification) });
    } catch (error) {
      console.error('Error adding notification:', error);
    }
  }

  async updateNotifications(userId: string, notifications: AppNotification[]): Promise<void> {
    try {
      await updateDoc(this.getUserDocRef(userId), { notifications });
    } catch (error) {
      console.error('Error updating notifications:', error);
    }
  }

  subUsersList(): Unsubscribe {
    return onSnapshot(this.getUsersRef(), snapshot => {
      this.userList.set(
        snapshot.docs.map(d => ({ id: d.id, ...d.data() }) as UserProfile)
      );
    });
  }
}
