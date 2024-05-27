import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MemberDialogsService {

  membersDialogIsOpen: boolean = false;
  addMemberDialogIsOpen: boolean = false;
  addSpecificPerson: boolean = false;

  constructor() { }

  toggleMembersDialog(event: Event) {
    this.membersDialogIsOpen = !this.membersDialogIsOpen;
    event?.stopPropagation();
  }

  openAddMembersDialog(event: Event) {
    this.addMemberDialogIsOpen = true;
    if (this.membersDialogIsOpen) {
      this.toggleMembersDialog(event)
    }
  }

  goToAddSpecificPerson(event: Event) {
    this.addSpecificPerson = true;
    event.stopPropagation();
  }

  stopPropagation(event: Event) {
    event.stopPropagation();
  }
}
