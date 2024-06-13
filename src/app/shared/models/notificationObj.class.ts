
export class NotificationObj {
    date: number;
    channelName: string;
    channelId: string;
    senderName: string;
    senderId: string;
    receiverName: string;
    receiverId?: string;


    constructor(obj?: any) {
        this.date = obj ? obj.date : 0,
            this.channelName = obj ? obj.channelName : '',
            this.channelId = obj ? obj.channelId : '',
            this.senderName = obj ? obj.senderName : '',
            this.senderId = obj ? obj.senderId : '',
            this.receiverName = obj ? obj.receiverName : '',
            this.receiverId = obj ? obj.receiverId : ''
    }

    public toJSON(): {} {
        return {
            date: this.date,
            channelName: this.channelName,
            channelId: this.channelId,
            senderName: this.senderName,
            senderId: this.senderId,
            receiverName: this.receiverName,
            receiverId: this.receiverId
        }
    }
}