import { Injectable, inject, signal } from '@angular/core';
import {
  Firestore,
  addDoc,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Auth, Unsubscribe } from '@angular/fire/auth';
import { PrivateChat } from '../models/privateChat.class';
import { ChatMessage } from '../interfaces/chatMessage.interface';

@Injectable({ providedIn: 'root' })
export class DirectMessageRepository {
  private readonly firestore = inject(Firestore);
  private readonly auth = inject(Auth);

  readonly directMessages = signal<PrivateChat[]>([]);
  readonly allDirectMessages = signal<PrivateChat[]>([]);

  chatRoomId?: string;
  private currentUserId?: string;

  private unsubDirectMess: Unsubscribe | undefined;
  private unsubAllDirectMessages: Unsubscribe | undefined;

  constructor() {
    this.auth.onAuthStateChanged(user => {
      if (user) {
        this.currentUserId = user.uid;
        this.unsubDirectMess?.();
        this.unsubDirectMess = this.subDirectMessages();
        this.unsubAllDirectMessages?.();
        this.unsubAllDirectMessages = this.subAllExistingChatRooms();
      } else {
        this.unsubDirectMess?.();
        this.unsubAllDirectMessages?.();
        this.directMessages.set([]);
        this.allDirectMessages.set([]);
      }
    });
  }

  getDirectMessRef() {
    return collection(this.firestore, 'direct-messages');
  }

  getDirectMessSingleDoc(docId: string) {
    return doc(this.getDirectMessRef(), docId);
  }

  subDirectMessages(): Unsubscribe {
    const q = query(
      this.getDirectMessRef(),
      where('partecipantsIds', 'array-contains', this.currentUserId),
      orderBy('lastUpdateAt', 'desc')
    );
    return onSnapshot(q, list => {
      const items: PrivateChat[] = [];
      list.forEach(el => {
        items.push(new PrivateChat(el.data()));
      });
      this.directMessages.set(items);
    });
  }

  subAllExistingChatRooms(): Unsubscribe {
    return onSnapshot(this.getDirectMessRef(), list => {
      const items: PrivateChat[] = [];
      list.forEach(el => {
        items.push(new PrivateChat(el.data()));
      });
      this.allDirectMessages.set(items);
    });
  }

  async addChatRoom(obj: object): Promise<void> {
    try {
      const docRef = await addDoc(this.getDirectMessRef(), obj);
      if (docRef?.id) {
        this.chatRoomId = docRef.id;
        await updateDoc(this.getDirectMessSingleDoc(this.chatRoomId), { id: this.chatRoomId });
      }
    } catch (error) {
      console.error('Error adding chat room:', error);
    }
  }

  async updatePrivateChat(docId: string, messageObject: ChatMessage): Promise<void> {
    const chatRef = this.getDirectMessSingleDoc(docId);
    await updateDoc(chatRef, { chat: arrayUnion(messageObject) });
    await updateDoc(chatRef, { lastUpdateAt: new Date().getTime() });
  }

  async updateCompletePrivateMessage(docId: string, privateMessage: PrivateChat): Promise<void> {
    try {
      const pmRef = this.getDirectMessSingleDoc(docId);
      await updateDoc(pmRef, privateMessage.toJSON());
    } catch (error) {
      console.error('Error updating complete private messages', error);
    }
  }

  async updateCompletlyPrivateChat(docId: string, messageObject: ChatMessage[]): Promise<void> {
    try {
      await updateDoc(this.getDirectMessSingleDoc(docId), { chat: messageObject });
    } catch (error) {
      console.error('Error updating complete private chats', error);
    }
  }
}
