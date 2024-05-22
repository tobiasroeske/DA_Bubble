import { Injectable, inject } from '@angular/core';
import { User } from '../../models/user.class';
import { Subject } from 'rxjs';
import { Auth, GoogleAuthProvider, createUserWithEmailAndPassword, onAuthStateChanged, sendEmailVerification, signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, signOut, updateEmail, updateProfile, verifyBeforeUpdateEmail } from '@angular/fire/auth';
import { Router } from '@angular/router';
import { FirestoreService } from '../firestore-service/firestore.service';
import { LocalStorageService } from '../local-storage-service/local-storage.service';
import { BoardService } from '../../../board/board.service';

@Injectable({
  providedIn: 'root'
})
export class SignupService {
  auth = inject(Auth)
  router = inject(Router)
  firestoreService = inject(FirestoreService);
  storageService = inject(LocalStorageService);
  provider = new GoogleAuthProvider()
  user$ = new Subject();
  user!: User;
  currentUser!: any;
  errorCode!: string;
  signUpSuccessful = false;


  constructor() {
    this.user$.subscribe(val => {
      this.user = new User(val);
    })
  }

  async googleLogin() {
    await signInWithPopup(this.auth, this.provider)
    .then(result => {
      this.updateUserProfile({ photoURL: 'avatar0.png' })
      .then(() => {
        this.storageService.saveCurrentUser(result.user);
        this.router.navigateByUrl('board');
      })
    })
    .catch(err => console.error(err))
  }

  async updateEmail(email: string) {
    if (this.auth.currentUser) {
      await verifyBeforeUpdateEmail(this.auth.currentUser, email)
      //await updateEmail(this.auth.currentUser, email)
        .then(() => {
          console.log('email updated')
          this.storageService.saveCurrentUser(this.auth.currentUser)
          this.errorCode = 'no error'
        })
        .catch(err => {
          this.errorCode = err.code
          
        })
    } else {
      console.log('Current user does not exist on auth');

    }
  }

  async updateUserProfile(changes: {}) {
    if (this.auth.currentUser) {
      await updateProfile(this.auth.currentUser, changes)
        .then(() => {
          console.log('profile updated')
          this.storageService.saveCurrentUser(this.auth.currentUser)
        })
        .catch(err => console.error(err))
    } else {
      console.log('update was not successful');

    }
  }

  async register() {
    await createUserWithEmailAndPassword(this.auth, this.user.email, this.user.password)
      .then(userCredential => {
        updateProfile(userCredential.user, {
          photoURL: this.user.avatarPath,
          displayName: this.user.name
        })
          .then(() => {
            let currentUser = this.auth.currentUser;
            this.storageService.saveCurrentUser(currentUser);
            if (currentUser != null) {
              this.firestoreService.addUser(currentUser.uid, this.setNewUserObject(currentUser.uid));
              sendEmailVerification(currentUser)
                .then(() => console.log('Verification mail send'))
            }
          })
      })
      .then(() => {
        this.signUpSuccessful = true;
        setTimeout(() => {
          this.router.navigateByUrl('board')
          
        }, 1500)
      })
      .catch(err => {
        this.errorCode = err.code;
      })
  }

  setNewUserObject(userId: string) {
    return {
      id: userId,
      name: this.user.name,
      email: this.user.email,
      avatarPath: this.user.avatarPath
    }

  }

  getCurrentUser() {
    return this.currentUser
  }

  async login(email: string, password: string) {
    await signInWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        this.storageService.saveCurrentUser(userCredential.user);
        this.router.navigateByUrl('board');
      })
      .catch(err => {
        this.errorCode = err.code;
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
