import { CurrentUser } from "./currentUser.interface";
import { Reaction } from "./reaction.interface";

export interface ChatMessage {
    date: number;
    user: CurrentUser;
    message: string;
    answers: ChatMessage[];
    reactions: Reaction[];
    fileUpload: string;
    type: 'ChatMessage'
}