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
    const userExists = localStorage.getItem('currentUser');
    if (userExists != null) {
      const userAsText = JSON.parse(localStorage.getItem('currentUser')!);
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
    const reactionsExist = localStorage.getItem('lastReactions');
    if (reactionsExist != null) {
      const reactionsAsJson = JSON.parse(localStorage.getItem('lastReactions')!);
      return reactionsAsJson;
    } else {
      return ['thumbs_up', 'laughing']
    }
  }

  loadCurrentChannelIndex() {
    const currentIndex = localStorage.getItem('currentChannelIndex');
    if (currentIndex != null) {
      const currentIndexAsJson = JSON.parse(localStorage.getItem('currentChannelIndex')!);
      return currentIndexAsJson;
    }
  }

  loadIntroPlayed() {
    const introPlayed = localStorage.getItem('introPlayed');
    if (introPlayed != null) {
      const introPlayedAsJson = JSON.parse(localStorage.getItem('introPlayed')!);
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
