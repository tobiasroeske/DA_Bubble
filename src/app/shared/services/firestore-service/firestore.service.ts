import { Injectable, inject } from '@angular/core';
import { CurrentUser } from '../../interfaces/currentUser.interface';
import { Firestore, addDoc, arrayUnion, collection, doc, onSnapshot, setDoc, updateDoc, query, where, orderBy, deleteDoc } from '@angular/fire/firestore';
import { Channel } from '../../models/channel.class';
import { PrivateChat } from '../../models/privateChat.class';
import { ChatMessage } from '../../interfaces/chatMessage.interface';
import { Auth, Unsubscribe } from '@angular/fire/auth';
import { User } from '../../models/user.class';
import { Subscribable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  private firestore: Firestore = inject(Firestore);
  private auth: Auth = inject(Auth);

  userList: CurrentUser[] = [];
  allChannels: any[] = [];
  allExistingChannels: Channel[] = [];
  directMessages: PrivateChat[] = [];
  allDirectMessages: PrivateChat[] = [];

  private unsubscribeUsers: Unsubscribe | undefined;
  private unsubChannel: Unsubscribe | undefined;
  private unsubAllChannels: Unsubscribe | undefined;
  private unsubDirectMess: Unsubscribe | undefined;
  private unsubAllDirectMessages: Unsubscribe | undefined;

  newChannelId?: string;
  chatRoomId?: string;
  currentUserId?: string;

  constructor() {
    this.initSubscriptions();
  }

  private initSubscriptions(): void {
    this.unsubscribeUsers = this.subUsersList();
    this.auth.onAuthStateChanged(user => {
      if (user) {
        this.currentUserId = user.uid;
        this.unsubChannel = this.subChannelList();
        this.unsubDirectMess = this.subDirectMessages();
        this.unsubAllChannels = this.subAllExistingChannelList();
        this.unsubAllDirectMessages = this.subAllExistingChatRooms();
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeAll();
  }

  private unsubscribeAll(): void {
    this.unsubscribeUsers?.();
    this.unsubChannel?.();
    this.unsubDirectMess?.();
    this.unsubAllChannels?.();
    this.unsubAllDirectMessages?.();
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
      const userUpdate = this.setUserObject(newUser, userId);
      await updateDoc(userRef, userUpdate);
    } catch (error) {
      console.error('Error updating user:', error);
    }
  }

  async updateUserNotification(userId: string, notification: any): Promise<void> {
    try {
      const userRef = this.getUserDocRef(userId);
      await updateDoc(userRef, { notification: arrayUnion(notification) });
    } catch (error) {
      console.error('Error updating user notification:', error);
    }
  }

  subUsersList(): Unsubscribe {
    return onSnapshot(this.getUsersRef(), list => {
      this.userList = [];
      list.forEach(user => {
        let singleUser: CurrentUser = this.setUserObject(user.data(), user.id);
        this.userList.push(singleUser);
      });
    });
  }

  getCleanUserJson(obj: any) {
    return {
      id: obj.id ? obj.id : '',
      name: obj.name,
      email: obj.email,
      avatarPath: obj.avatarPath,
      selected: obj.selected ? obj.selected : false,
      directMessages: obj.directMessages ? obj.directMessages : []
    }
  }

  setUserObject(obj: any, id: string) {
    return {
      id: id || '',
      name: obj.name || '',
      email: obj.email || '',
      avatarPath: obj.avatarPath || '',
      selected: obj.selected || false,
      directMessages: obj.directMessages || [],
      loginState: obj.loginState || 'loggedOut',
      type: obj.type || 'CurrentUser',
      notification: obj.notification || [],
    }
  }

  subChannelList(): Unsubscribe {
    console.log('current user id firestore service is ', this.currentUserId)
    const q = query(this.getChannelsRef(), where('partecipantsIds', 'array-contains', this.currentUserId))
    return onSnapshot(q, (list) => {
      this.allChannels = [];
      list.forEach((el) => {
        console.log(el.data());
        
        let channel = new Channel(el.data());
        channel.id = el.id;
        this.allChannels.push(channel.toJSON());
      })
    })
  }

  subAllExistingChannelList(): Unsubscribe {
    return onSnapshot(this.getChannelsRef(), list => {
      this.allExistingChannels = [];
      list.forEach(c => {
        let channel = new Channel(c.data());
        channel.id = c.id;
        this.checkIfChannelHasMembers(channel, channel.id)
        this.allExistingChannels.push(channel);
      })
    })
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

  async addChannel(obj: {}): Promise<void> {
    try {
      const docRef = await addDoc(this.getChannelsRef(), obj);
      if (docRef?.id) {
        this.newChannelId = docRef.id;
        await updateDoc(this.getSingleChannelRef('channels', this.newChannelId), { id: this.newChannelId });
      }
    } catch (error) {
      console.error('Error adding channel:', error);
    }
  }

  async updateChannel(item: {}, docId: string): Promise<void> {
    try {
      const docRef = this.getSingleChannelRef('channels', docId);
      await updateDoc(docRef, item);
    } catch (error) {
      console.error('Error updating channel:', error);
    }
  }

  async updateAllChats(docId: string, newChats: ChatMessage[]): Promise<void> {
    try {
      const chatRef = this.getSingleChannelRef('channels', docId);
      await updateDoc(chatRef, { chat: newChats });
    } catch (error) {
      console.error('Error updating all chats:', error);
    }
  }

  async updateChannelUsers(updatedUser: any, docId: string): Promise<void> {
    try {
      const channelRef = this.getSingleChannelRef('channels', docId);
      await updateDoc(channelRef, { allUsers: updatedUser });
    } catch (error) {
      console.error('Error updating channel users:', error);
    }
  }

  async updateMembers(updateMembers: string | CurrentUser, docId: string): Promise<void> {
    try {
      const channelRef = this.getSingleChannelRef('channels', docId);
      await updateDoc(channelRef, { members: arrayUnion(updateMembers) });
    } catch (error) {
      console.error('Error updating members:', error);
    }
  }

  async updatePartecipantsIds(id: string, docId: string): Promise<void> {
    try {
      const channelRef = this.getSingleChannelRef('channels', docId);
      await updateDoc(channelRef, { partecipantsIds: arrayUnion(id) });
    } catch (error) {
      console.error('Error updating participants IDs:', error);
    }
  }

  async updateChats(docId: string, messageObject: ChatMessage): Promise<void> {
    try {
      const chatRef = this.getSingleChannelRef('channels', docId);
      await updateDoc(chatRef, { chat: arrayUnion(messageObject) });
    } catch (error) {
      console.error('Error updating chats:', error);
    }
  }

  subDirectMessages(): Unsubscribe {
    const q = query(this.getDirectMessRef(), where('partecipantsIds', 'array-contains', this.currentUserId), orderBy('lastUpdateAt', 'desc'));
    return onSnapshot(q, (list) => {
      this.directMessages = [];
      list.forEach(el => {
        let privateChat = new PrivateChat(el.data());
        this.directMessages.push(privateChat);
      });
    });
  }

  subAllExistingChatRooms(): Unsubscribe {
    return onSnapshot(this.getDirectMessRef(), (list) => {
      this.allDirectMessages = [];
      list.forEach(el => {
        let privateChat = new PrivateChat(el.data());
        this.allDirectMessages.push(privateChat);
      });
    });
  }

  async addChatRoom(obj: {}): Promise<void> {
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

  async updatePrivateChat(docId: string, messageObject: ChatMessage) {
    let chatRef = this.getDirectMessSingleDoc(docId);
    await updateDoc(chatRef, { chat: arrayUnion(messageObject) }).then(() => {
      updateDoc(chatRef, { lastUpdateAt: new Date().getTime() }).then(() => {

      })
    });
  }

  async updateCompletePrivateMessage(docId: string, privateMessage: PrivateChat) {
    try {
      let pmRef = this.getDirectMessSingleDoc(docId);
    await updateDoc(pmRef, privateMessage.toJSON()).catch(err => console.error(err))
    } catch (error) {
      console.error("Error updating complete private messages", error)
    }
    
  }

  async updateCompletlyPrivateChat(docId: string, messageObject: ChatMessage[]) {
    try {
      let chatRef = this.getDirectMessSingleDoc(docId);
    await updateDoc(chatRef, { chat: messageObject })
    } catch (error) {
      console.error('Error updating complete private chats', error)
    }
    
  }

  getChatsRef(channelId: string) {
    return collection(this.firestore, 'channels', channelId, 'chatMessages');
  }

  getChannelsRef() {
    return collection(this.firestore, 'channels');
  }

  getSingleChannelRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }

  getDirectMessRef() {
    return collection(this.firestore, 'direct-messages');
  }

  getDirectMessSingleDoc(colId: string) {
    return doc(this.getDirectMessRef(), colId)
  }

}

