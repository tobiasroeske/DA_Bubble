import { Injectable, inject } from '@angular/core';
import { CurrentUser } from '../../interfaces/currentUser.interface';
import { Firestore, addDoc, collection, doc, onSnapshot, setDoc, updateDoc } from '@angular/fire/firestore';
import { Channel } from '../../models/channel.class';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  firestore = inject(Firestore)
  userList: CurrentUser[] = [];
  unsubscribeUsers;
  unsubChannel;
  allChannels: any[] = [];


  constructor() {
    this.unsubscribeUsers = this.subUsersList();
    this.unsubChannel = this.subChannelList();
  }

  ngOnDestroy(): void {
    this.unsubscribeUsers();
    this.unsubChannel();
  }

  getUsersRef() {
    return collection(this.firestore, 'users');
  }

  getUserDocRef(userId: string) {
    return doc(this.getUsersRef(), userId)
  }

  async addUser(userId: string, user:CurrentUser) {
    await setDoc(this.getUserDocRef(userId), user);
  }

  // async addUser(user: CurrentUser) {
  //   await addDoc(this.getUsersRef(), this.getCleanUserJson(user))
  //   .catch(err => console.error(err))
  //   .then(docRef => {
  //     if (docRef?.id) {
  //       let uid = docRef?.id;
  //       updateDoc(this.getUserDocRef(uid), { id: uid });
  //     }
  //   })
  // }

  subUsersList() {
    return onSnapshot(this.getUsersRef(), list => {
      this.userList = [];
      list.forEach(user => {
        let singleUser: CurrentUser = this.setUserObject(user.data(), user.id);
        this.userList.push(singleUser);
      });
    })
  }

  getCleanUserJson(obj: any) {
    return {
      id: obj.id ? obj.id : '',
      name: obj.name,
      email: obj.email,
      avatarPath: obj.avatarPath
    }
  }

  setUserObject(obj: any, id: string) {
    return {
      id: id || '',
      name: obj.name || '',
      email: obj.email || '',
      avatarPath: obj.path || ''
    }
  }

  subChannelList() {
    return onSnapshot(this.getChannelsRef(), (list) => {
      this.allChannels = [];
      list.forEach((el) => {
        let channel = new Channel(el.data());
        channel.id = el.id;
        this.allChannels.push(channel.toJSON());
        console.log(this.allChannels);
      });
    });
  }

  async addChannel(obj: {}) {
    await addDoc(this.getChannelsRef(), obj).catch((err) => {
      console.log(err);
    })
  }

  getChannelsRef() {
    return collection(this.firestore, 'channels');
  }

  getSingleChannelRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }
}

