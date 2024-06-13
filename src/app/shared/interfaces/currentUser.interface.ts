import { NotificationObj } from "../models/notificationObj.class";


export interface CurrentUser {
    id?: string;
    name: string;
    email: string;
    avatarPath: string;
    selected?:boolean;
    loginState: 'loggedIn' | 'loggedOut' | 'idle';
    type: 'CurrentUser';
    notification: NotificationObj[];
}