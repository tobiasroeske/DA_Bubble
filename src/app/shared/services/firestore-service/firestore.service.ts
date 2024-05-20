import { Injectable, inject, } from '@angular/core';
import { Firestore, addDoc, collection, doc, onSnapshot, updateDoc } from '@angular/fire/firestore';
import { Channel } from '../../models/channel.class';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {
  firestore = inject(Firestore);

  unsubChannel;
  allChannels:any[] = [];

  constructor() {
    this.unsubChannel = this.subChannelList();
  }

  subChannelList() {
    return onSnapshot(this.getChannelsRef(), (list) => {
      this.allChannels = [];
      list.forEach((el) => {
        this.allChannels.push(el.data());
      });
    });
  }

  getChannelsRef() {
    return collection(this.firestore, 'channels');
  }

  getSingleChannelRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }
}
