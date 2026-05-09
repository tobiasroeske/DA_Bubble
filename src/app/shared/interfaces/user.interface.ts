export type PresenceStatus = 'loggedIn' | 'loggedOut' | 'idle';

export interface MessageAuthor {
  id: string;
  name: string;
  avatarPath: string;
}

export interface AppNotification {
  id: string;
  date: number;
  channelId: string;
  channelName: string;
  senderId: string;
  senderName: string;
  senderAvatarPath: string;
  message: string;
  isRead: boolean;
}

export interface UserProfile {
  id?: string;
  name: string;
  email: string;
  avatarPath: string;
  loginState: PresenceStatus;
  notifications: AppNotification[];
}
