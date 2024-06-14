import { User } from "../models/user.class";

export interface Reaction {
    emojiPath: string;
    creator: User[];
    count: number;
}