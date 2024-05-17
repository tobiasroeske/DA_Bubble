import { Injectable, inject } from '@angular/core';
import { User } from '../../models/user.class';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { Auth, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, user } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root'
})
export class SignupService {
  auth = inject(Auth)
  user$ = new Subject();
  user!: User;
  currentUser = this.auth.currentUser

  constructor() {
    this.user$.subscribe(val => {
      this.user = new User(val);
      console.log('user for signup: ', this.user);
    })
  }

  async register() {
    await createUserWithEmailAndPassword(this.auth, this.user.email, this.user.password)
    .then( userCredential => {
      let currentUser = userCredential.user;
      console.log(currentUser);
    })
    .catch(error => {
      let errorCode = error.code;
      let errorMessage = error.message;
      console.warn(errorCode)
      console.warn(errorMessage)
    })
  }

  async login(email: string, password: string) {
    await signInWithEmailAndPassword(this.auth, email, password)
    .then(userCredential => {
      let currentUser = userCredential.user;
      console.log(currentUser);
      
    }).catch(error =>  {
      let errorCode = error.code;
      let errorMessage = error.code;
      console.error(errorCode);
      console.error(errorMessage);
    })
  }

  getLoggedInUser() {
    onAuthStateChanged(this.auth, user => {
      if (user) {
        console.log('signed in ', user);
        const uid = user.uid;
        console.log('User id is', uid);
      } else {
        console.log(user + 'is signed out');
      }
    })
  }

  async logout() {
    await signOut(this.auth)
  }

}
