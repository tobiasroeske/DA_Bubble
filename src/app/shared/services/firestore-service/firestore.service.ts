import { Injectable, inject } from '@angular/core';
import { CurrentUser } from '../../interfaces/currentUser.interface';
import { Firestore, addDoc, collection, doc, onSnapshot, setDoc, updateDoc } from '@angular/fire/firestore';
import { Channel } from '../../models/channel.class';
// import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  firestore = inject(Firestore)
  // userListSubject = new BehaviorSubject<CurrentUser[]>([])
  // userList$ = this.userListSubject.asObservable();
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

  async addUser(userId: string, user: CurrentUser) {
    await setDoc(this.getUserDocRef(userId), user);
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
      avatarPath: obj.avatarPath || ''
    }
  }

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
    await addDoc(this.getChannelsRef(), obj).catch((err) => {
      console.log(err);
    })
  }

  async updateChannel(item: {}, docId: string) {
    let docRef = this.getSingleChannelRef('channels', docId)
    await updateDoc(docRef, item).catch((err) => {
      console.log(err);
    }).then(() => { });
  }

  getChannelsRef() {
    return collection(this.firestore, 'channels');
  }

  getSingleChannelRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }
}

