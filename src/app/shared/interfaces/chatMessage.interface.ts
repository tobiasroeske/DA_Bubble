import { User } from "../models/user.class";
import { Reaction } from "./reaction.interface";

export interface ChatMessage {
    date: number;
    user: User;
    message: string;
    answers: ChatMessage[];
    reactions: Reaction[];
    fileUpload: string;
    type: 'ChatMessage'
}