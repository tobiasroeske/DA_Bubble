import { CurrentUser } from "../interfaces/currentUser.interface";
import { ChatMessage } from "../interfaces/chatMessage.interface";

export class PrivateChat {
    id?: string;
    partecipantsIds: string[];
    initiatedAt: string;
    lastUpdateAt: number;
    creator: CurrentUser;
    guest: CurrentUser;
    chat: ChatMessage[];
    type: string;

    constructor(obj?: any) {
        this.id = obj ? obj.id : "";
        this.partecipantsIds = obj ? obj.partecipantsIds : [];
        this.initiatedAt = obj ? obj.initiatedAt : "";
        this.lastUpdateAt = obj ? obj.lastUpdateAt : 0;
        this.creator = obj ? obj.creator : "";
        this.guest = obj ? obj.guest : "";
        this.chat = obj ? obj.chat : [];
        this.type = obj ? obj.type : 'PrivateChat';
    }

    public toJSON(): {} {
        return {
            id: this.id,
            partecipantsIds: this.partecipantsIds,
            initiatedAt: this.initiatedAt,
            lastUpdateAt: this.lastUpdateAt,
            creator: this.creator,
            guest: this.guest,
            chat: this.chat,
            type: this.type
        }
    }
}