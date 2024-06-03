import { Injectable } from '@angular/core';
import { CurrentUser } from '../../interfaces/currentUser.interface';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  currentUser!: CurrentUser;
  introPlayed = false;
  constructor() { }

  saveCurrentUser(user:any) {
    localStorage.setItem('currentUser', JSON.stringify(user));
  }

  loadCurrentUser() {
    let userExists = localStorage.getItem('currentUser');
    if (userExists != null) {
      let userAsText = JSON.parse(localStorage.getItem('currentUser')!);
      this.currentUser = this.setCurrentUserObject(userAsText);
      return this.currentUser;
    } else {
      return;
    }
  }

  saveIntroPlayed(state: boolean) {
    localStorage.setItem('introPlayed', JSON.stringify(state));
  }

  loadIntroPlayed() {
    let introPlayed = localStorage.getItem('introPlayed');
    if (introPlayed != null) {
      let introPlayedAsJson = JSON.parse(localStorage.getItem('introPlayed')!);
      this.introPlayed = introPlayedAsJson;
      console.log(this.introPlayed);
      
    }
  }


  setCurrentUserObject(obj: any) {
    return {
      id: obj.uid || '',
      name: obj.displayName || '',
      email: obj.email || '',
      avatarPath: obj.photoURL || '',
      seleted: obj.selected || false,
      loginState: obj.loginState || 'loggedOut'
    }
  }

}
