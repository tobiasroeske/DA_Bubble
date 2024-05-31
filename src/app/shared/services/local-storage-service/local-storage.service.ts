import { Injectable } from '@angular/core';
import { CurrentUser } from '../../interfaces/currentUser.interface';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  currentUser!: CurrentUser;
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


  setCurrentUserObject(obj: any) {
    return {
      id: obj.uid || '',
      name: obj.displayName || '',
      email: obj.email || '',
      avatarPath: obj.photoURL || '',
      seleted: obj.selected || false,
      loggedIn: obj.loggedIn || false
    }
  }

}
