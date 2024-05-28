import { Injectable, inject, signal } from '@angular/core';
import { CurrentUser } from '../../interfaces/currentUser.interface';
import { Firestore, addDoc, arrayUnion, collection, doc, onSnapshot, setDoc, updateDoc } from '@angular/fire/firestore';
import { Channel } from '../../models/channel.class';
import { ChatMessage } from '../../interfaces/chatMessage.interface';
import { BehaviorSubject } from 'rxjs';
// import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  firestore = inject(Firestore)

  // usersListSubject = new BehaviorSubject<CurrentUser[]>([])
  // usersList$ = this.usersListSubject.asObservable();
  userList: CurrentUser[] = [];
  unsubscribeUsers;
  unsubChannel;
  // unsubChannelAlternative;
  // unsubUserListAlternative;
  unsubPrivateMessage!: any;
  allChannels: any[] = [];
  allChannelsSubject = new BehaviorSubject<any[]>([]);
  allChannels$ = this.allChannelsSubject.asObservable();
  privateMessages = [];
  
  constructor() {
    this.unsubscribeUsers = this.subUsersList();
    this.unsubChannel = this.subChannelList();
    // this.unsubChannelAlternative = this.subChannelListAlternative();
    // this.unsubUserListAlternative = this.subUsersListAlternative();
  }

  ngOnDestroy(): void {
    this.unsubscribeUsers();
    this.unsubChannel();
    // this.unsubChannelAlternative;
    // this.unsubUserListAlternative();
  }

  getUsersRef() {
    return collection(this.firestore, 'users');
  }

  getUserDocRef(userId: string) {
    return doc(this.getUsersRef(), userId)
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
      // const userList = list.docs.map(doc => this.setUserObject(doc.data(), doc.id))
      // this.userListSubject.next(userList);
      this.userList = [];
      list.forEach(user => {
        let singleUser: CurrentUser = this.setUserObject(user.data(), user.id);
        this.userList.push(singleUser);
      });
      console.log(this.userList);

    })
  }

  // subUsersListAlternative() {
  //   return onSnapshot(this.getUsersRef(), list => {
  //     let usersList: CurrentUser[] = [];
  //     list.forEach(user => {
  //       let singleUser: CurrentUser = this.setUserObject(user.data(), user.id);
  //       usersList.push(singleUser);
  //     })
  //     this.usersListSubject.next(usersList);
  //   })
  // }

  getCleanUserJson(obj: any) {
    return {
      id: obj.id ? obj.id : '',
      name: obj.name,
      email: obj.email,
      avatarPath: obj.avatarPath,
      selected: obj.selected ? obj.selected : false
    }
  }

  setUserObject(obj: any, id: string) {
    return {
      id: id || '',
      name: obj.name || '',
      email: obj.email || '',
      avatarPath: obj.avatarPath || '',
      selected: obj.selected || false
    }
  }

  // subChannelListAlternative() {
  //   return onSnapshot(this.getChannelsRef(), (list) => {
  //     let allChannels: any[] = [];
  //     list.forEach((el) => {
  //       let channel = new Channel(el.data());
  //       channel.id = el.id;
  //       allChannels.push(channel.toJSON());
  //     });
  //     console.log(allChannels);
      
  //     this.allChannelsSubject.next(allChannels);
  //   });
  // }

  subChannelList() {
    return onSnapshot(this.getChannelsRef(), (list) => {
      this.allChannels = [];
      list.forEach((el) => {
        let channel = new Channel(el.data());
        channel.id = el.id;
        this.allChannels.push(channel.toJSON());
      });
    });
  }

  async addChannel(obj: {}) {
    await addDoc(this.getChannelsRef(), obj)
    .then(docRef => {
      if (docRef?.id) {
        let channelId = docRef?.id;
        updateDoc(this.getSingleChannelRef('channels', channelId), { id: channelId}).catch(err => console.log(err))
      }
      
    })
    .catch((err) => {
      console.log(err);
    })
  }

  async updateChannel(item: {}, docId: string) {
    let docRef = this.getSingleChannelRef('channels', docId)
    await updateDoc(docRef, item).catch((err) => {
      console.log(err);
    }).then(() => { });
  }

  async updateMembers(newMember: string, docId: string) {
    let channelRef = this.getSingleChannelRef('channels', docId);
    await updateDoc(channelRef, { members: arrayUnion(newMember) });
  }

  async updateChannelUsers(updatedUser: any, docId: string) {
    let channelRef = this.getSingleChannelRef('channels', docId);
    await updateDoc(channelRef, { allUsers: updatedUser })
  }

  async updateChats(docId: string, messageObject: ChatMessage) {
    let chatRef = this.getSingleChannelRef('channels', docId);
    await updateDoc(chatRef, { chat: arrayUnion(messageObject) })
    .catch(err => console.log(err));
  }

  async updateReactions(docId: string, newChats: ChatMessage[]) {
    let chatRef = this.getSingleChannelRef('channels', docId);
    await updateDoc(chatRef, { chat: newChats }).then((data) => console.log(data)
    )
    .catch(err => console.log(err));
  }

  subChatMessages(channelId: string) {
    return onSnapshot(this.getChatsRef(channelId), list => {
      console.log(list.docs);
      
    })
  }

  getChatsRef(channelId:string) {
    return collection(this.firestore, 'channels', channelId, 'chatMessages');
  }

  getChannelsRef() {
    return collection(this.firestore, 'channels');
  }

  getSingleChannelRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }
}

