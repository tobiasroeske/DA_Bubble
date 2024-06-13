
export class NotificationObj {
    date: number;
    channelName: string;
    channelId: string;
    senderName: string;
    senderId: string;
    senderImage:string;
    receiverImage:string;
    receiverName: string;
    receiverId?: string;
    notificationRed: boolean;


    constructor(obj?: any) {
        this.date = obj ? obj.date : 0,
            this.channelName = obj ? obj.channelName : '',
            this.channelId = obj ? obj.channelId : '',
            this.senderName = obj ? obj.senderName : '',
            this.senderImage = obj ? obj.senderImage : '',
            this.senderId = obj ? obj.senderId : '',
            this.receiverImage = obj ? obj.receiverImage : '',
            this.receiverName = obj ? obj.receiverName : '',
            this.receiverId = obj ? obj.receiverId : ''
            this.notificationRed = obj ? obj.notificationRed : false
    }

    public toJSON(): {} {
        return {
            date: this.date,
            channelName: this.channelName,
            channelId: this.channelId,
            senderImage: this.senderImage,
            senderName: this.senderName,
            senderId: this.senderId,
            receiverImage: this.receiverImage,
            receiverName: this.receiverName,
            receiverId: this.receiverId,
            notificationRed: this.notificationRed
        }
    }
}