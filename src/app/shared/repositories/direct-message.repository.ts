import { Injectable, inject, signal } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Auth, Unsubscribe } from '@angular/fire/auth';
import { DirectMessage } from '../interfaces/direct-message.interface';
import { Message } from '../interfaces/message.interface';

@Injectable({ providedIn: 'root' })
export class DirectMessageRepository {
  private readonly firestore = inject(Firestore);
  private readonly auth = inject(Auth);

  readonly directMessages = signal<DirectMessage[]>([]);
  readonly allDirectMessages = signal<DirectMessage[]>([]);
  readonly currentMessages = signal<Message[]>([]);

  chatRoomId?: string;
  private currentUserId?: string;

  private unsubDirectMess?: Unsubscribe;
  private unsubAllDirectMessages?: Unsubscribe;
  private unsubMessages?: Unsubscribe;

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
        this.unsubMessages?.();
        this.directMessages.set([]);
        this.allDirectMessages.set([]);
        this.currentMessages.set([]);
      }
    });
  }

  getDmRef() {
    return collection(this.firestore, 'direct-messages');
  }

  getDmDocRef(dmId: string) {
    return doc(this.firestore, 'direct-messages', dmId);
  }

  getMessagesRef(dmId: string) {
    return collection(this.firestore, 'direct-messages', dmId, 'messages');
  }

  getMessageRef(dmId: string, messageId: string) {
    return doc(this.firestore, 'direct-messages', dmId, 'messages', messageId);
  }

  subDirectMessages(): Unsubscribe {
    const q = query(
      this.getDmRef(),
      where('participantIds', 'array-contains', this.currentUserId),
      orderBy('lastMessageAt', 'desc')
    );
    return onSnapshot(q, snapshot => {
      this.directMessages.set(snapshot.docs.map(d => ({ id: d.id, ...d.data() }) as DirectMessage));
    });
  }

  subAllExistingChatRooms(): Unsubscribe {
    return onSnapshot(this.getDmRef(), snapshot => {
      this.allDirectMessages.set(
        snapshot.docs.map(d => ({ id: d.id, ...d.data() }) as DirectMessage)
      );
    });
  }

  subscribeToMessages(dmId: string): void {
    this.unsubMessages?.();
    const q = query(this.getMessagesRef(dmId), orderBy('timestamp', 'asc'));
    this.unsubMessages = onSnapshot(q, snapshot => {
      this.currentMessages.set(snapshot.docs.map(d => ({ id: d.id, ...d.data() }) as Message));
    });
  }

  async addChatRoom(participantIds: string[]): Promise<string | undefined> {
    const now = Date.now();
    const dm: Omit<DirectMessage, 'id'> = {
      participantIds,
      createdAt: now,
      lastMessageAt: now,
    };
    try {
      const docRef = await addDoc(this.getDmRef(), dm);
      this.chatRoomId = docRef.id;
      return docRef.id;
    } catch (error) {
      console.error('Error adding chat room:', error);
      return undefined;
    }
  }

  async addMessage(dmId: string, message: Omit<Message, 'id'>): Promise<void> {
    try {
      await addDoc(this.getMessagesRef(dmId), message);
      await updateDoc(this.getDmDocRef(dmId), { lastMessageAt: message.timestamp });
    } catch (error) {
      console.error('Error adding DM message:', error);
    }
  }

  async updateMessage(dmId: string, messageId: string, updates: Partial<Message>): Promise<void> {
    try {
      await updateDoc(this.getMessageRef(dmId, messageId), updates as Record<string, unknown>);
    } catch (error) {
      console.error('Error updating DM message:', error);
    }
  }
}
