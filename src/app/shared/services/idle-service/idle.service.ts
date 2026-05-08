import { Injectable, inject, signal } from '@angular/core';
import { BoardService } from '../board-service/board.service';
import { FirestoreService } from '../firestore-service/firestore.service';

export enum IdleUserTimes {
  IdleTime = 10000,
  CountdownTime = 5000,
}

@Injectable({ providedIn: 'root' })
export class IdleService {
  boardServ = inject(BoardService);
  firestore = inject(FirestoreService);

  private timeoutId: ReturnType<typeof setTimeout> | undefined;
  private countdownId: ReturnType<typeof setInterval> | undefined;
  private countdownValue!: number;

  readonly userInactive = signal<boolean>(false);

  constructor() {
    this.reset();
    this.initListener();
  }

  initListener() {
    const resetFn = () => this.reset();
    window.addEventListener('mousemove', resetFn);
    window.addEventListener('click', resetFn);
    window.addEventListener('keypress', resetFn);
    window.addEventListener('DOMMouseScroll', resetFn);
    window.addEventListener('mousewheel', resetFn);
    window.addEventListener('touchmove', resetFn);
    window.addEventListener('MSPointerMove', resetFn);
  }

  reset() {
    clearTimeout(this.timeoutId);
    clearInterval(this.countdownId);
    this.userInactive.set(false);
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
        this.userInactive.set(true);
      }
    }, 1000);
  }
}
