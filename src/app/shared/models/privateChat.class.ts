import { CurrentUser } from "../interfaces/currentUser.interface";
import { ChatMessage } from "../interfaces/chatMessage.interface";

export class PrivateChat {
    id?: string;
    creator: CurrentUser;
    guest: CurrentUser;
    chat: ChatMessage[];

    constructor(obj?: any) {
        this.id = obj ? obj.id : "";
        this.creator = obj ? obj.creator : "";
        this.guest = obj ? obj.guest : "";
        this.chat = obj ? obj.chat : [];
    }

    public toJSON(): {} {
        return {
            id: this.id,
            creator: this.creator,
            guest: this.guest,
            chat: this.chat
        }
    }
}