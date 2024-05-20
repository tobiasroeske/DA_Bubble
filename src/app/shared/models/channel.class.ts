export class Channel {
    title: string;
    members: string[] = [];
    description?: string;
    creator: string;

    constructor(obj?: any) {
        this.title = obj ? obj.title : "";
        this.members = obj ? obj.memebrs : [];
        this.description = obj ? obj.description : "";
        this.creator = obj ? obj.creator : "";
    }

    public toJSON(): {} {
        return {
            title: this.title,
            members: this.members,
            description: this.description,
            creator: this.creator
        }
    }
}