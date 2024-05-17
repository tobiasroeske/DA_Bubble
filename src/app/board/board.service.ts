import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class BoardService {

  threadTranslate: boolean = false;
  sidenavTranslate: boolean = false;
  textHidden: boolean = true;
  status:string = ''


  constructor() { }

  open(element: string) {
    if (element == 'thread') {
      this.threadTranslate = true;
    } else {
      this.sidenavTranslate = !this.sidenavTranslate;
      this.hideText();
    }
  }

  close(element: string) {
    if (element == 'thread') {
      this.threadTranslate = false;
    }
  }

  hideText() {
    if (!this.sidenavTranslate) {
      this.status = 'öffnen';
      setTimeout(() => {
        this.textHidden = true;
      }, 50)
    } else {
      this.status = 'schließen'
      setTimeout(() => {
        this.textHidden = false;
      }, 50)
    }
  }


}
