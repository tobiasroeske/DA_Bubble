import { User } from "../models/user.class";

export interface ChatMessage {
    date: number;
    user: User;
    message: string;
    answers: [];
    reactions: [];
}