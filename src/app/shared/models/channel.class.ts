export class Channel {
    id?: string;
    title: string;
    members: string[] = [];
    description?: string;
    creatorId: string;
    creatorName:string;
    chat?: any[] = [];

    constructor(obj?: any) {
        this.id = obj ? obj.id : "";
        this.title = obj ? obj.title : "";
        this.members = obj ? [...obj.members] : [];
        this.description = obj ? obj.description : "";
        this.creatorId = obj ? obj.creatorId : "";
        this.creatorName = obj? obj.creatorName : "";
        this.chat = obj ? obj.chat : [];
    }

    public toJSON(): {} {
        return {
            id: this.id,
            title: this.title,
            members: this.members,
            description: this.description,
            creatorId: this.creatorId,
            creatorName: this.creatorName,
            chat: this.chat
        }
    }
}