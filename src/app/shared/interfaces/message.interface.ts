import { Reaction } from './reaction.interface';
import { MessageAuthor } from './user.interface';

export interface Message {
  id?: string;
  text: string;
  author: MessageAuthor;
  timestamp: number;
  fileUpload?: string;
  reactions: Reaction[];
  replyCount?: number;
}
