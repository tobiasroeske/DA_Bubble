import { Injectable, inject } from '@angular/core';
import { Subject } from 'rxjs';
import { BoardService } from '../board.service';
import { FirestoreService } from '../firestore-service/firestore.service';

export enum IdleUserTimes {
  IdleTime = 10000,
  CountdownTime = 5000
}

@Injectable({
  providedIn: 'root'
})
export class IdleService {
  boardServ = inject(BoardService);
  firestore = inject(FirestoreService)
  private timeoutId: any;
  private countdownId: any;
  private countdownValue!: number;

  userInactive: Subject<boolean> = new Subject();

  constructor() {
    this.reset();
    this.initListener();
  }

  initListener() {
    window.addEventListener('mousemove', () => this.reset());
    window.addEventListener('click', () => this.reset());
    window.addEventListener('keypress', () => this.reset());
    window.addEventListener('DOMMouseScroll', () => this.reset());
    window.addEventListener('mousewheel', () => this.reset());
    window.addEventListener('touchmove', () => this.reset());
    window.addEventListener('MSPointerMove', () => this.reset());
  }

  async reset() {
    clearTimeout(this.timeoutId);
    clearTimeout(this.countdownId);
    this.startIdleTimer();
  }

  startIdleTimer() {
    this.timeoutId = setTimeout(() => {
      this.startCountdown();
    }, IdleUserTimes.IdleTime);
  }

  startCountdown() {
    this.countdownValue = IdleUserTimes.CountdownTime / 1000;
    this.countdownId = setInterval(() => {
      this.countdownValue--;
      if (this.countdownValue <= 0) {
        clearInterval(this.countdownId);
        this.userInactive.next(true);
      }
    }, 1000);
  }
}
