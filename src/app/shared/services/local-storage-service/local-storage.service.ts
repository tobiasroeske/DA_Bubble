import { Injectable } from '@angular/core';
import { CurrentUser } from '../../interfaces/currentUser.interface';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  currentUser!: CurrentUser;
  introPlayed = false;
  constructor() { }

  saveCurrentUser(user: any) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  loadCurrentUser() {
    let userExists = localStorage.getItem('currentUser');
    if (userExists != null) {
      let userAsText = JSON.parse(localStorage.getItem('currentUser')!);
      if (userAsText.uid) {
        this.currentUser = this.setCurrentUserObject(userAsText);
        return this.currentUser
      } else {
        return userAsText;
      }
    } else {
      return;
    }
  }

  saveIntroPlayed(state: boolean) {
    localStorage.setItem('introPlayed', JSON.stringify(state));
  }

  saveCurrentChannelIndex(i: number) {
    localStorage.setItem('currentChannelIndex', JSON.stringify(i));
  }

  saveLastReactions(reactions: string[]) {
    localStorage.setItem('lastReactions', JSON.stringify(reactions));
  }

  loadLastReactions() {
    let reactionsExist = localStorage.getItem('lastReactions');
    if (reactionsExist != null) {
      let reactionsAsJson = JSON.parse(localStorage.getItem('lastReactions')!);
      return reactionsAsJson;
    } else {
      return ['thumbs_up', 'laughing']
    }
  }

  loadCurrentChannelIndex() {
    let currentIndex = localStorage.getItem('currentChannelIndex');
    if (currentIndex != null) {
      let currentIndexAsJson = JSON.parse(localStorage.getItem('currentChannelIndex')!);
      return currentIndexAsJson;
    }
  }

  loadIntroPlayed() {
    let introPlayed = localStorage.getItem('introPlayed');
    if (introPlayed != null) {
      let introPlayedAsJson = JSON.parse(localStorage.getItem('introPlayed')!);
      this.introPlayed = introPlayedAsJson;
    }
  }

  setCurrentUserObject(obj: any) {
    return {
      id: obj.uid || '',
      name: obj.displayName || '',
      email: obj.email || '',
      avatarPath: obj.photoURL || '',
      seleted: obj.selected || false,
      loginState: obj.loginState || 'loggedOut',
      type: obj.type || 'CurrentUser',
      notification: obj.notification || []
    }
  }

}
