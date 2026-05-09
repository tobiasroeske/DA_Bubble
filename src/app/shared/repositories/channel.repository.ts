import { Injectable, inject, signal } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  deleteDoc,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Auth, Unsubscribe } from '@angular/fire/auth';
import { Channel } from '../interfaces/channel.interface';
import { Message } from '../interfaces/message.interface';

@Injectable({ providedIn: 'root' })
export class ChannelRepository {
  private readonly firestore = inject(Firestore);
  private readonly auth = inject(Auth);

  readonly allChannels = signal<Channel[]>([]);
  readonly allExistingChannels = signal<Channel[]>([]);
  readonly currentMessages = signal<Message[]>([]);
  readonly currentReplies = signal<Message[]>([]);

  newChannelId?: string;
  currentUserId?: string;

  private unsubChannel?: Unsubscribe;
  private unsubAllChannels?: Unsubscribe;
  private unsubMessages?: Unsubscribe;
  private unsubReplies?: Unsubscribe;

  constructor() {
    this.auth.onAuthStateChanged(user => {
      if (user) {
        this.currentUserId = user.uid;
        this.unsubChannel?.();
        this.unsubChannel = this.subChannelList();
        this.unsubAllChannels?.();
        this.unsubAllChannels = this.subAllExistingChannelList();
      } else {
        this.unsubChannel?.();
        this.unsubAllChannels?.();
        this.unsubMessages?.();
        this.unsubReplies?.();
        this.allChannels.set([]);
        this.allExistingChannels.set([]);
        this.currentMessages.set([]);
        this.currentReplies.set([]);
      }
    });
  }

  getChannelsRef() {
    return collection(this.firestore, 'channels');
  }

  getChannelRef(channelId: string) {
    return doc(this.firestore, 'channels', channelId);
  }

  getMessagesRef(channelId: string) {
    return collection(this.firestore, 'channels', channelId, 'messages');
  }

  getMessageRef(channelId: string, messageId: string) {
    return doc(this.firestore, 'channels', channelId, 'messages', messageId);
  }

  getRepliesRef(channelId: string, messageId: string) {
    return collection(this.firestore, 'channels', channelId, 'messages', messageId, 'replies');
  }

  getReplyRef(channelId: string, messageId: string, replyId: string) {
    return doc(this.firestore, 'channels', channelId, 'messages', messageId, 'replies', replyId);
  }

  subChannelList(): Unsubscribe {
    const q = query(
      this.getChannelsRef(),
      where('memberIds', 'array-contains', this.currentUserId)
    );
    return onSnapshot(q, snapshot => {
      this.allChannels.set(snapshot.docs.map(d => ({ id: d.id, ...d.data() }) as Channel));
    });
  }

  subAllExistingChannelList(): Unsubscribe {
    return onSnapshot(this.getChannelsRef(), snapshot => {
      const channels = snapshot.docs.map(d => ({ id: d.id, ...d.data() }) as Channel);
      channels.forEach(c => {
        if (c.memberIds.length === 0) {
          this.deleteChannel(c.id!).catch(console.error);
        }
      });
      this.allExistingChannels.set(channels);
    });
  }

  subscribeToMessages(channelId: string): void {
    this.unsubMessages?.();
    const q = query(this.getMessagesRef(channelId), orderBy('timestamp', 'asc'));
    this.unsubMessages = onSnapshot(q, snapshot => {
      this.currentMessages.set(snapshot.docs.map(d => ({ id: d.id, ...d.data() }) as Message));
    });
  }

  subscribeToReplies(channelId: string, messageId: string): void {
    this.unsubReplies?.();
    const q = query(this.getRepliesRef(channelId, messageId), orderBy('timestamp', 'asc'));
    this.unsubReplies = onSnapshot(q, snapshot => {
      this.currentReplies.set(snapshot.docs.map(d => ({ id: d.id, ...d.data() }) as Message));
    });
  }

  stopListeningToReplies(): void {
    this.unsubReplies?.();
    this.currentReplies.set([]);
  }

  private async deleteChannel(channelId: string): Promise<void> {
    await deleteDoc(this.getChannelRef(channelId));
  }

  async addChannel(channel: Omit<Channel, 'id'>): Promise<string | undefined> {
    try {
      const docRef = await addDoc(this.getChannelsRef(), channel);
      this.newChannelId = docRef.id;
      return docRef.id;
    } catch (error) {
      console.error('Error adding channel:', error);
      return undefined;
    }
  }

  async updateChannel(channelId: string, updates: Partial<Channel>): Promise<void> {
    try {
      await updateDoc(this.getChannelRef(channelId), updates as Record<string, unknown>);
    } catch (error) {
      console.error('Error updating channel:', error);
    }
  }

  async addMessage(channelId: string, message: Omit<Message, 'id'>): Promise<void> {
    try {
      await addDoc(this.getMessagesRef(channelId), message);
    } catch (error) {
      console.error('Error adding message:', error);
    }
  }

  async updateMessage(
    channelId: string,
    messageId: string,
    updates: Partial<Message>
  ): Promise<void> {
    try {
      await updateDoc(this.getMessageRef(channelId, messageId), updates as Record<string, unknown>);
    } catch (error) {
      console.error('Error updating message:', error);
    }
  }

  async addReply(
    channelId: string,
    messageId: string,
    reply: Omit<Message, 'id' | 'replyCount'>
  ): Promise<void> {
    try {
      await addDoc(this.getRepliesRef(channelId, messageId), reply);
      await updateDoc(this.getMessageRef(channelId, messageId), {
        replyCount: increment(1),
      });
    } catch (error) {
      console.error('Error adding reply:', error);
    }
  }

  async updateReply(
    channelId: string,
    messageId: string,
    replyId: string,
    updates: Partial<Message>
  ): Promise<void> {
    try {
      await updateDoc(
        this.getReplyRef(channelId, messageId, replyId),
        updates as Record<string, unknown>
      );
    } catch (error) {
      console.error('Error updating reply:', error);
    }
  }

  async addMember(channelId: string, userId: string): Promise<void> {
    const channel = this.allChannels().find(c => c.id === channelId);
    if (!channel) return;
    const memberIds = [...new Set([...channel.memberIds, userId])];
    try {
      await updateDoc(this.getChannelRef(channelId), { memberIds });
    } catch (error) {
      console.error('Error adding member:', error);
    }
  }

  async removeMember(channelId: string, userId: string): Promise<void> {
    const channel = this.allChannels().find(c => c.id === channelId);
    if (!channel) return;
    const memberIds = channel.memberIds.filter(id => id !== userId);
    try {
      await updateDoc(this.getChannelRef(channelId), { memberIds });
    } catch (error) {
      console.error('Error removing member:', error);
    }
  }
}
