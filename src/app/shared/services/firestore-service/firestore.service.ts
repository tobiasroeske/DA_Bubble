import { Injectable, inject } from '@angular/core';
import { CurrentUser } from '../../interfaces/currentUser.interface';
import { Firestore, addDoc, arrayUnion, collection, doc, onSnapshot, setDoc, updateDoc, query, where, orderBy, deleteDoc } from '@angular/fire/firestore';
import { Channel } from '../../models/channel.class';
import { PrivateChat } from '../../models/privateChat.class';
import { ChatMessage } from '../../interfaces/chatMessage.interface';
import { Auth } from '@angular/fire/auth';
import { NotificationObj } from '../../models/notificationObj.class';
import { LocalStorageService } from '../local-storage-service/local-storage.service';


@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  firestore = inject(Firestore);
  auth = inject(Auth);

  userList: CurrentUser[] = [];
  allChannels: any[] = [];
  allExistingChannels: Channel[] = [];
  directMessages: PrivateChat[] = [];
  allDirectMessages: PrivateChat[] = [];
  unsubscribeUsers;
  unsubChannel: any;
  unsubAllChannels: any;
  unsubDirectMess: any;
  unsubAllDirectMessages: any;

  newChannelId?: string;
  chatRoomId?: string;
  currentUserId?: string;

  constructor() {
    this.unsubscribeUsers = this.subUsersList();
    this.auth.onAuthStateChanged((user) => {
      if (user) {
        this.currentUserId = user.uid; // take the current user id from authentication;
        this.unsubChannel = this.subChannelList();
        this.unsubDirectMess = this.subDirectMessages();
        this.unsubAllChannels = this.subAllExistingChannelList();
        this.unsubAllDirectMessages = this.subAllExistingChatRooms();
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeUsers();
    this.unsubChannel();
    this.unsubDirectMess();
    this.unsubAllChannels();
    this.unsubAllDirectMessages();
  }

  getUsersRef() {
    return collection(this.firestore, 'users');
  }

  getUserDocRef(userId: string) {
    return doc(this.getUsersRef(), userId);
  }

  async addUser(userId: string, user: CurrentUser) {
    await setDoc(this.getUserDocRef(userId), user);
  }

  async updateUser(userId: string, newUser: CurrentUser) {
    let userRef = this.getUserDocRef(userId);
    let userUpdate = this.setUserObject(newUser, userId);
    await updateDoc(userRef, userUpdate)
      .then(() => { })
      .catch(err => console.log(err))
  }

  async updateUserNotification(userId: string, notification: any) {
    let userRef = this.getUserDocRef(userId);
    await updateDoc(userRef, { notification: arrayUnion(notification) })
  }

  subUsersList() {
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

  subChannelList() {
    const q = query(this.getChannelsRef(), where('partecipantsIds', 'array-contains', this.currentUserId))
    return onSnapshot(q, (list) => {
      this.allChannels = [];
      list.forEach((el) => {
        let channel = new Channel(el.data());
        channel.id = el.id;
        this.allChannels.push(channel.toJSON());
      })
    })
  }

  subAllExistingChannelList() {
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

  async checkIfChannelHasMembers(channel: Channel, channelId: string) {
    if (channel.members.length <= 0) {
      await deleteDoc(this.getSingleChannelRef('channels', channelId))
        .then(() => console.log(`channel with channel-Id: ${channelId} got deleted`))
        .catch(err => console.error(err))
    }
  }

  async addChannel(obj: {}) {
    await addDoc(this.getChannelsRef(), obj)
      .then(docRef => {
        if (docRef?.id) {
          this.newChannelId = docRef?.id;
          updateDoc(this.getSingleChannelRef('channels', this.newChannelId), { id: this.newChannelId }).catch(err => console.log(err))
        }
      })
      .catch((err) => { console.error(err) });
  }

  async updateChannel(item: {}, docId: string) {
    let docRef = this.getSingleChannelRef('channels', docId)
    await updateDoc(docRef, item).catch((err) => {
      console.log(err);
    })
  }

  async updateAllChats(docId: string, newChats: ChatMessage[]) {
    let chatRef = this.getSingleChannelRef('channels', docId);
    await updateDoc(chatRef, { chat: newChats })
      .catch(err => console.log(err));
  }

  async updateChannelUsers(updatedUser: any, docId: string) {
    let channelRef = this.getSingleChannelRef('channels', docId);
    await updateDoc(channelRef, { allUsers: updatedUser });
  }

  async updateMembers(updateMembers: string | CurrentUser, docId: string) {
    let channelRef = this.getSingleChannelRef('channels', docId);
    await updateDoc(channelRef, { members: arrayUnion(updateMembers) })
  }

  async updatePartecipantsIds(id: string, docId: string) {
    let channelRef = this.getSingleChannelRef('channels', docId);
    await updateDoc(channelRef, { partecipantsIds: arrayUnion(id) })
  }

  async updateChats(docId: string, messageObject: ChatMessage) {
    let chatRef = this.getSingleChannelRef('channels', docId);
    await updateDoc(chatRef, { chat: arrayUnion(messageObject) })
      .catch(err => console.log(err));
  }

  subDirectMessages() {
    const q = query(this.getDirectMessRef(), where('partecipantsIds', 'array-contains', this.currentUserId), orderBy('lastUpdateAt', 'desc'));
    return onSnapshot(q, (list) => {
      this.directMessages = [];
      list.forEach(el => {
        let privateChat = new PrivateChat(el.data());
        this.directMessages.push(privateChat);
      });
    });
  }

  subAllExistingChatRooms() {
    return onSnapshot(this.getDirectMessRef(), (list) => {
      this.allDirectMessages = [];
      list.forEach(el => {
        let privateChat = new PrivateChat(el.data());
        this.allDirectMessages.push(privateChat);
      });
    });
  }

  async addChatRoom(obj: {}) {
    await addDoc(this.getDirectMessRef(), obj)
      .then((docRef) => {
        if (docRef?.id) {
          this.chatRoomId = docRef?.id;
          updateDoc(this.getDirectMessSingleDoc(this.chatRoomId), { id: this.chatRoomId }).catch(err => console.error(err))
        }
      }).catch((err) => {
        console.error(err);
      })
  }

  async updatePrivateChat(docId: string, messageObject: ChatMessage) {
    let chatRef = this.getDirectMessSingleDoc(docId);
    await updateDoc(chatRef, { chat: arrayUnion(messageObject) }).then(() => {
      updateDoc(chatRef, { lastUpdateAt: new Date().getTime() }).then(() => {

      })
    });
  }

  async updateCompletePrivateMessage(docId: string, privateMessage: PrivateChat) {
    let pmRef = this.getDirectMessSingleDoc(docId);
    await updateDoc(pmRef, privateMessage.toJSON()).catch(err => console.log(err))
  }

  async updateCompletlyPrivateChat(docId: string, messageObject: ChatMessage[]) {
    let chatRef = this.getDirectMessSingleDoc(docId);
    await updateDoc(chatRef, { chat: messageObject })
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

