import { Injectable, inject, signal } from '@angular/core';
import {
  Firestore,
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { Auth, Unsubscribe } from '@angular/fire/auth';
import { Channel } from '../models/channel.class';
import { ChatMessage } from '../interfaces/chatMessage.interface';
import { CurrentUser } from '../interfaces/currentUser.interface';

@Injectable({ providedIn: 'root' })
export class ChannelRepository {
  private readonly firestore = inject(Firestore);
  private readonly auth = inject(Auth);

  readonly allChannels = signal<Channel[]>([]);
  readonly allExistingChannels = signal<Channel[]>([]);

  newChannelId?: string;
  currentUserId?: string;

  private unsubChannel: Unsubscribe | undefined;
  private unsubAllChannels: Unsubscribe | undefined;

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
        this.allChannels.set([]);
        this.allExistingChannels.set([]);
      }
    });
  }

  getChannelsRef() {
    return collection(this.firestore, 'channels');
  }

  getSingleChannelRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }

  subChannelList(): Unsubscribe {
    const q = query(
      this.getChannelsRef(),
      where('partecipantsIds', 'array-contains', this.currentUserId)
    );
    return onSnapshot(q, list => {
      const items: Channel[] = [];
      list.forEach(el => {
        const channel = new Channel(el.data());
        channel.id = el.id;
        items.push(channel.toJSON() as Channel);
      });
      this.allChannels.set(items);
    });
  }

  subAllExistingChannelList(): Unsubscribe {
    return onSnapshot(this.getChannelsRef(), list => {
      const items: Channel[] = [];
      list.forEach(c => {
        const channel = new Channel(c.data());
        channel.id = c.id;
        this.checkIfChannelHasMembers(channel, channel.id);
        items.push(channel);
      });
      this.allExistingChannels.set(items);
    });
  }

  private async checkIfChannelHasMembers(channel: Channel, channelId: string): Promise<void> {
    if (channel.members.length <= 0) {
      try {
        await deleteDoc(this.getSingleChannelRef('channels', channelId));
      } catch (error) {
        console.error('Error deleting empty channel:', error);
      }
    }
  }

  async addChannel(obj: object): Promise<void> {
    try {
      const docRef = await addDoc(this.getChannelsRef(), obj);
      if (docRef?.id) {
        this.newChannelId = docRef.id;
        await updateDoc(this.getSingleChannelRef('channels', this.newChannelId), {
          id: this.newChannelId,
        });
      }
    } catch (error) {
      console.error('Error adding channel:', error);
    }
  }

  async updateChannel(item: object, docId: string): Promise<void> {
    try {
      await updateDoc(this.getSingleChannelRef('channels', docId), item);
    } catch (error) {
      console.error('Error updating channel:', error);
    }
  }

  async updateAllChats(docId: string, newChats: ChatMessage[]): Promise<void> {
    try {
      await updateDoc(this.getSingleChannelRef('channels', docId), { chat: newChats });
    } catch (error) {
      console.error('Error updating all chats:', error);
    }
  }

  async updateChannelUsers(updatedUser: unknown, docId: string): Promise<void> {
    try {
      await updateDoc(this.getSingleChannelRef('channels', docId), { allUsers: updatedUser });
    } catch (error) {
      console.error('Error updating channel users:', error);
    }
  }

  async updateMembers(updateMembers: string | CurrentUser, docId: string): Promise<void> {
    try {
      await updateDoc(this.getSingleChannelRef('channels', docId), {
        members: arrayUnion(updateMembers),
      });
    } catch (error) {
      console.error('Error updating members:', error);
    }
  }

  async updatePartecipantsIds(id: string, docId: string): Promise<void> {
    try {
      await updateDoc(this.getSingleChannelRef('channels', docId), {
        partecipantsIds: arrayUnion(id),
      });
    } catch (error) {
      console.error('Error updating participants IDs:', error);
    }
  }

  async updateChats(docId: string, messageObject: ChatMessage): Promise<void> {
    try {
      await updateDoc(this.getSingleChannelRef('channels', docId), {
        chat: arrayUnion(messageObject),
      });
    } catch (error) {
      console.error('Error updating chats:', error);
    }
  }
}
