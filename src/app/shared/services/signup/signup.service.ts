import { Injectable } from '@angular/core';
import { User } from '../../models/user.class';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SignupService {
  user$ = new Subject();
  user!: User;

  constructor() {
    this.user$.subscribe(val => {
      this.user = new User(val);
      console.log('user for signup: ', this.user);
    })
   }
}
