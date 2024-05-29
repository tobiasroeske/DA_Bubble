import { Component, ElementRef, Input, OnInit, ViewChild, inject } from '@angular/core';
import { BoardService } from '../../board.service';
import { FirestoreService } from '../../../shared/services/firestore-service/firestore.service';
import { CommonModule } from '@angular/common';
import { ChatMessage } from '../../../shared/interfaces/chatMessage.interface';
import { Reaction } from '../../../shared/interfaces/reaction.interface';


@Component({
  selector: 'app-chat-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-message.component.html',
  styleUrl: './chat-message.component.scss'
})
export class ChatMessageComponent implements OnInit {
  @Input() chat!: ChatMessage;
  @Input() lastIndex!: boolean;
  @Input() channelId!: string;
  @Input() chatMessageIndex!: number;

  mouseIsOverMessage: boolean = false;
  popUpReaction: boolean = false;
  memberDialogIsOpen: boolean = false;
  reactionDialogOpen = false;
  boardServ = inject(BoardService);
  firestore = inject(FirestoreService);
  membersList: any[] = []
  currentChannel!: any;
  currentUserName!: any
  lastReactions: string[] = ['thumbs_up', 'laughing'];
  currentChatMessage!: ChatMessage


  reactionEmojis: string[] = ['angry', 'cool', 'flushed', 'hearts', 'high_five', 'laughing', 'thumbs_up'];

  ngOnInit(): void {
    this.currentChannel = (this.firestore.allChannels[this.boardServ.idx]);
    this.currentUserName = this.boardServ.currentUser.name;
    this.currentChatMessage = this.currentChannel.chat[this.chatMessageIndex];
  }

  checkIfDateIsToday(date: number) {
    let todayAsString = new Date().toDateString();
    let dateToCheckAsString = new Date(date).toDateString();
    let sameDate = todayAsString == dateToCheckAsString;
    if (sameDate) {
      return true;
    } else {
      return false;
    }
  }

  toggleReactionDialog() {
    this.reactionDialogOpen = !this.reactionDialogOpen;
  }



  updateCompleteChannel(emojiIdx: number, emojiArray: string[]) {
    let newChatMessage = this.checkIfReactionExists(emojiIdx, emojiArray);
    this.currentChannel.chat.splice(this.chatMessageIndex, 1, newChatMessage);
    console.log('current chanel after update', this.currentChannel.chat);
    this.firestore.updateAllChats(this.channelId, this.currentChannel.chat);
    this.getLastTwoReactions(emojiIdx);
  }

  checkIfReactionExists(emojiIdx: number, emojiArray: string[]): ChatMessage {
    let chatMessage: ChatMessage = this.currentChannel.chat[this.chatMessageIndex];
    let emojiPath = emojiArray[emojiIdx];
    let existingReaction = chatMessage.reactions.find(reaction => reaction.emojiPath === emojiPath);
    if (existingReaction) {
      existingReaction.count += 1;
      if (!existingReaction.creator.includes(this.currentUserName)) {
        existingReaction.creator.push(this.currentUserName);
      }
    } else {
      chatMessage.reactions.push(this.setReactionObject(emojiIdx));
    }
    return chatMessage
  }

  getLastTwoReactions(index: number) {
    let newReaction = this.reactionEmojis[index];
    if (this.lastReactions[this.lastReactions.length - 1] !== newReaction) {
      if (this.lastReactions.length >= 2) {
        this.lastReactions.splice(0, 1);
      }
      this.lastReactions.push(newReaction);
    }
  }

  setReactionObject(i: number): Reaction {
    return {
      emojiPath: this.reactionEmojis[i],
      creator: [this.boardServ.currentUser.name],
      count: 1,

    }
  }

  onHover(htmlElement: string) {
    if (htmlElement == 'message-box') {
      this.mouseIsOverMessage = true;
    }
    // } else {
    //   this.popUpReaction = true;
    // }
  }

  onLeave(htmlElement: string) {
    if (htmlElement == 'message-box') {
      this.mouseIsOverMessage = false;
      this.reactionDialogOpen = false;
    }
    // } else {
    //   this.popUpReaction = false;
    // }
  }

  showMembersDialogToggle() {
    this.memberDialogIsOpen = true;
  }
}
