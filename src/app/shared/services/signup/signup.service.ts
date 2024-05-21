import { Injectable, inject } from '@angular/core';
import { User } from '../../models/user.class';
import { Subject } from 'rxjs';
import { Auth, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile} from '@angular/fire/auth';
import { Router } from '@angular/router';
import { FirestoreService } from '../firestore-service/firestore.service';
import { LocalStorageService } from '../local-storage-service/local-storage.service';

@Injectable({
  providedIn: 'root'
})
export class SignupService {
  auth = inject(Auth)
  router = inject(Router)
  firestoreService = inject(FirestoreService);
  storageService = inject(LocalStorageService);
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
        });
        this.storageService.saveCurrentUser(userCredential.user);
        this.firestoreService.addUser(userCredential.user.uid ,{
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
    await signInWithEmailAndPassword(this.auth, email, password)
    .then((userCredential) => {
      this.storageService.saveCurrentUser(userCredential.user);
    })
  }


  getLoggedInUser() {
    onAuthStateChanged(this.auth, user => {
      if (user) {
        const uid = user.uid;
        this.currentUser = user;
        console.log('Current user is: ', this.currentUser);
        this.storageService.saveCurrentUser(user);
      } else {
        console.log(user + 'is signed out');
        this.storageService.saveCurrentUser(user);
      }
    })
  }

  async logout() {
    await signOut(this.auth)
    .then(() => {
      this.storageService.saveCurrentUser('');
      window.open('login', '_self');
    })
  }

  

}
