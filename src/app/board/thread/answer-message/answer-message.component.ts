import { AfterViewInit, Component, Input, OnInit, inject } from '@angular/core';
import { ChatMessage } from '../../../shared/interfaces/chatMessage.interface';
import { Channel } from '../../../shared/models/channel.class';
import { BoardService } from '../../board.service';
import { CommonModule } from '@angular/common';
import { CurrentUser } from '../../../shared/interfaces/currentUser.interface';
import { User } from '../../../shared/models/user.class';
import { Reaction } from '../../../shared/interfaces/reaction.interface';
import { FirestoreService } from '../../../shared/services/firestore-service/firestore.service';

@Component({
  selector: 'app-answer-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './answer-message.component.html',
  styleUrl: './answer-message.component.scss'
})
export class AnswerMessageComponent implements OnInit, AfterViewInit{
  firestoreService = inject(FirestoreService)

  @Input() currentChannel!: Channel
  @Input() currentChatMessage?: ChatMessage;
  @Input() answer!: ChatMessage;
  @Input() lastIndex!:boolean;
  @Input() chatMessagaeIndex?:number;
  @Input() answerIndex?:number

  currentUserName!: User;
  showReactionPopup = false;
  showEmojiBar = false;
  reactionDialogIndicatorbarOpen = false;

  boardServ = inject(BoardService)

  reactionEmojis: string[] = ['angry', 'cool', 'flushed', 'hearts', 'high_five', 'laughing', 'thumbs_up'];

  ngOnInit(): void {
    this.currentUserName = this.boardServ.currentUser.name;
    this.boardServ.scrollToBottom(this.boardServ.threadRef);
  }

  ngAfterViewInit(): void {
    this.boardServ.scrollToBottom(this.boardServ.threadRef);
  }

  updateAllChannels(emojiIdx: number) {
    let newAnswer =  this.checkIfReactionExists(emojiIdx);
      console.log(this.currentChannel);
      this.currentChannel?.chat?.splice(this.chatMessagaeIndex!, 1, this.currentChatMessage)
      this.firestoreService.updateAllChats(this.currentChannel.id!, this.currentChannel.chat!)
    console.log(this.currentChatMessage);
  }



  checkIfReactionExists(emojiIdx: number){
    let emojiPath = this.reactionEmojis[emojiIdx];
    let existingReaction = this.answer.reactions.find(reaction => reaction.emojiPath === emojiPath);
    if (existingReaction) {
      existingReaction.count++;
      if (!existingReaction.creator.includes(this.currentUserName)) {
        existingReaction.creator.push(this.currentUserName);
      }
    } else {
      this.answer.reactions.push(this.setReactionObject(emojiIdx));
    }
    return this.answer;
  }

  setReactionObject(i: number): Reaction {
    return {
      emojiPath: this.reactionEmojis[i],
      creator: [this.boardServ.currentUser.name],
      count: 1,
    }
  }

  

  toggleReactionPopup(event: Event) {
    if (event.type == 'mouseover') {
      this.showReactionPopup = true;
    } 
    if (event.type == 'mouseleave') {
      this.showReactionPopup = false;
      this.showEmojiBar = false;
    }
  }

  showEmmojibar(boolean: boolean) {
    if (boolean == true) {
      this.reactionDialogIndicatorbarOpen = !this.reactionDialogIndicatorbarOpen;
    }
    if (boolean == false) {
      this.showEmojiBar = !this.showEmojiBar
    }
  }


 
}
