import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { AddSpecificPersonDialogComponent } from '../add-specific-person-dialog/add-specific-person-dialog.component';
import { FirstTwoSelectedMembersComponent } from '../add-specific-person-dialog/first-two-selected-members/first-two-selected-members.component';
import { SuggestedListComponent } from '../add-specific-person-dialog/suggested-list/suggested-list.component';
import { SelectedMembersFullListComponent } from '../add-specific-person-dialog/selected-members-full-list/selected-members-full-list.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-specific-person-dialog-mobile',
  standalone: true,
  imports: [CommonModule, FirstTwoSelectedMembersComponent, SuggestedListComponent, SelectedMembersFullListComponent, FormsModule],
  templateUrl: './add-specific-person-dialog-mobile.component.html',
  styleUrls: ['./add-specific-person-dialog-mobile.component.scss', './add-specific-person-dialog-mobile.component.scss']
})
export class AddSpecificPersonDialogMobileComponent extends AddSpecificPersonDialogComponent {
  constructor() {
    super();
  }
}
