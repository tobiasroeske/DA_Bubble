import { Injectable, inject } from '@angular/core';
import { CurrentUser } from '../../interfaces/currentUser.interface';
import { Firestore, addDoc, arrayUnion, collection, doc, onSnapshot, setDoc, updateDoc, query, where, orderBy } from '@angular/fire/firestore';
import { Channel } from '../../models/channel.class';
import { PrivateChat } from '../../models/privateChat.class';
import { ChatMessage } from '../../interfaces/chatMessage.interface';
import { Auth } from '@angular/fire/auth';


@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  firestore = inject(Firestore);
  auth = inject(Auth);

  userList: CurrentUser[] = [];
  allChannels: any[] = [];
  directMessages: PrivateChat[] = [];
  unsubscribeUsers;
  unsubChannel: any;
  unsubDirectMess: any;
  
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
      }
    });
  }

  ngOnDestroy(): void {
    this.unsubscribeUsers();
    this.unsubChannel();
    this.unsubDirectMess();
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

  subUsersList() {
    return onSnapshot(this.getUsersRef(), list => {
      this.userList = [];
      list.forEach(user => {
        let singleUser: CurrentUser = this.setUserObject(user.data(), user.id);
        this.userList.push(singleUser);
      });
      console.log(this.userList);
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
      type: obj.type || 'CurrentUser'
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
      console.log(this.allChannels);
    })
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
    await updateDoc(chatRef, { chat: newChats }).then((data) => console.log(data)
    )
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
      console.log(this.directMessages);
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
      updateDoc(chatRef, { lastUpdateAt: new Date().getTime() })
      console.log(this.directMessages);
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

