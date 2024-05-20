import { Injectable, inject } from '@angular/core';
import { User } from '../../models/user.class';
import { BehaviorSubject, Observable, Subject, from } from 'rxjs';
import { Auth, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { FirestoreService } from '../firestore-service/firestore.service';

@Injectable({
  providedIn: 'root'
})
export class SignupService {
  auth = inject(Auth)
  router = inject(Router)
  firestoreService = inject(FirestoreService);
  user$ = new Subject();
  user!: User;
  currentUser!: any;
  

  constructor() {
    this.user$.subscribe(val => {
      this.user = new User(val);
      console.log('user for signup: ', this.user);
    })
  }

  async register() {
    await createUserWithEmailAndPassword(this.auth, this.user.email, this.user.password)
      .then(userCredential => {
        updateProfile(userCredential.user, {
          photoURL: this.user.avatarPath,
          displayName: this.user.name
        })
        this.firestoreService.addUser({
          id: userCredential.user.uid, 
          name: this.user.name, 
          email: this.user.email, 
          avatarPath: this.user.avatarPath
        })
      })
      .catch(error => {
        console.error(error);
      })
  }

  getCurrentUser() {
    return this.currentUser
  }

  async login(email: string, password: string) {
    await signInWithEmailAndPassword(this.auth, email, password);
  }


  getLoggedInUser() {
    onAuthStateChanged(this.auth, user => {
      if (user) {
        console.log('signed in ', user);
        const uid = user.uid;
        this.currentUser = user;
        console.log('Current user is: ', this.currentUser);
      } else {
        console.log(user + 'is signed out');
      }
    })
  }

  async logout() {
    await signOut(this.auth)
    this.router.navigateByUrl('login')
  }

}
