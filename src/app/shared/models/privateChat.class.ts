import { CurrentUser } from "../interfaces/currentUser.interface";

export class PrivateChat {
    id?: string;
    creator: CurrentUser;
    guest: CurrentUser;
    chat: any[];

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