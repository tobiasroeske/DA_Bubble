import { Component, Input } from '@angular/core';
import { MessageEditorComponent } from '../../message-editor/message-editor.component';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PrivateChat } from '../../../../shared/models/privateChat.class';

@Component({
  selector: 'app-private-message-editor',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './private-message-editor.component.html',
  styleUrl: './private-message-editor.component.scss'
})
export class PrivateMessageEditorComponent extends MessageEditorComponent {
  @Input() privateChat!: PrivateChat;

  override editMessage(index:number) {
    console.log("aktueller chat: ", this.privateChat);
    console.log('Nachricht: ', this.chat.message);
    console.log('editierte nachricht: ', this.editedMessage)
    console.log('Index:', index)
    this.chat.message = this.editedMessage!;
    this.privateChat.chat.splice(index, 1, this.chat)
    console.log('nach edit: ',this.privateChat);
    this.firestore.updateCompletePrivateMessage(this.privateChat.id!, this.privateChat)
    


    // this.currentChannel = this.firestore.allChannels[this.boardServ.idx];
    // this.chat.message = this.editedMessage!;
    // this.currentChannel.chat.splice(index, 1, this.chat);
    // this.firestore.updateChannel(this.currentChannel, this.currentChannel.id)
    // .then(() => this.closeEditor());
  }
}
