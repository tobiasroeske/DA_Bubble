import { Injectable, inject } from '@angular/core';
import { UserRepository } from '../../repositories/user.repository';
import { ChannelRepository } from '../../repositories/channel.repository';
import { DirectMessageRepository } from '../../repositories/direct-message.repository';
import { UserProfile, AppNotification } from '../../interfaces/user.interface';
import { Channel } from '../../interfaces/channel.interface';
import { DirectMessage } from '../../interfaces/direct-message.interface';
import { Message } from '../../interfaces/message.interface';

@Injectable({ providedIn: 'root' })
export class FirestoreService {
  private readonly userRepo = inject(UserRepository);
  private readonly channelRepo = inject(ChannelRepository);
  private readonly dmRepo = inject(DirectMessageRepository);

  // ── Signals ─────────────────────────────────────────────────────────────
  readonly userList = this.userRepo.userList;
  readonly allChannels = this.channelRepo.allChannels;
  readonly allExistingChannels = this.channelRepo.allExistingChannels;
  readonly channelMessages = this.channelRepo.currentMessages;
  readonly channelReplies = this.channelRepo.currentReplies;
  readonly directMessages = this.dmRepo.directMessages;
  readonly allDirectMessages = this.dmRepo.allDirectMessages;
  readonly dmMessages = this.dmRepo.currentMessages;

  // ── Mutable state forwarded from repositories ───────────────────────────
  get newChannelId(): string | undefined {
    return this.channelRepo.newChannelId;
  }

  get chatRoomId(): string | undefined {
    return this.dmRepo.chatRoomId;
  }

  get currentUserId(): string | undefined {
    return this.channelRepo.currentUserId;
  }

  // ── User operations ─────────────────────────────────────────────────────
  getUsersRef() {
    return this.userRepo.getUsersRef();
  }

  getUserDocRef(userId: string) {
    return this.userRepo.getUserDocRef(userId);
  }

  async addUser(userId: string, user: Omit<UserProfile, 'id'>): Promise<void> {
    return this.userRepo.addUser(userId, user);
  }

  async updateUser(userId: string, updates: Partial<UserProfile>): Promise<void> {
    return this.userRepo.updateUser(userId, updates);
  }

  async updatePresence(userId: string, status: UserProfile['loginState']): Promise<void> {
    return this.userRepo.updatePresence(userId, status);
  }

  async addNotification(userId: string, notification: AppNotification): Promise<void> {
    return this.userRepo.addNotification(userId, notification);
  }

  async updateNotifications(userId: string, notifications: AppNotification[]): Promise<void> {
    return this.userRepo.updateNotifications(userId, notifications);
  }

  // ── Channel operations ──────────────────────────────────────────────────
  getChannelsRef() {
    return this.channelRepo.getChannelsRef();
  }

  async addChannel(channel: Omit<Channel, 'id'>): Promise<string | undefined> {
    return this.channelRepo.addChannel(channel);
  }

  async updateChannel(channelId: string, updates: Partial<Channel>): Promise<void> {
    return this.channelRepo.updateChannel(channelId, updates);
  }

  async addMember(channelId: string, userId: string): Promise<void> {
    return this.channelRepo.addMember(channelId, userId);
  }

  async removeMember(channelId: string, userId: string): Promise<void> {
    return this.channelRepo.removeMember(channelId, userId);
  }

  subscribeToChannelMessages(channelId: string): void {
    this.channelRepo.subscribeToMessages(channelId);
  }

  subscribeToReplies(channelId: string, messageId: string): void {
    this.channelRepo.subscribeToReplies(channelId, messageId);
  }

  stopListeningToReplies(): void {
    this.channelRepo.stopListeningToReplies();
  }

  // ── Channel message operations ───────────────────────────────────────────
  async addChannelMessage(channelId: string, message: Omit<Message, 'id'>): Promise<void> {
    return this.channelRepo.addMessage(channelId, message);
  }

  async updateChannelMessage(
    channelId: string,
    messageId: string,
    updates: Partial<Message>
  ): Promise<void> {
    return this.channelRepo.updateMessage(channelId, messageId, updates);
  }

  async addReply(
    channelId: string,
    messageId: string,
    reply: Omit<Message, 'id' | 'replyCount'>
  ): Promise<void> {
    return this.channelRepo.addReply(channelId, messageId, reply);
  }

  async updateReply(
    channelId: string,
    messageId: string,
    replyId: string,
    updates: Partial<Message>
  ): Promise<void> {
    return this.channelRepo.updateReply(channelId, messageId, replyId, updates);
  }

  // ── Direct Message operations ────────────────────────────────────────────
  getDmRef() {
    return this.dmRepo.getDmRef();
  }

  async addChatRoom(participantIds: string[]): Promise<string | undefined> {
    return this.dmRepo.addChatRoom(participantIds);
  }

  subscribeToDirectMessages(dmId: string): void {
    this.dmRepo.subscribeToMessages(dmId);
  }

  async addDmMessage(dmId: string, message: Omit<Message, 'id'>): Promise<void> {
    return this.dmRepo.addMessage(dmId, message);
  }

  async updateDmMessage(dmId: string, messageId: string, updates: Partial<Message>): Promise<void> {
    return this.dmRepo.updateMessage(dmId, messageId, updates);
  }

  // ── Utility: find existing DM between two users ──────────────────────────
  findExistingDm(userId1: string, userId2: string): DirectMessage | undefined {
    return this.allDirectMessages().find(
      dm =>
        dm.participantIds.includes(userId1) && dm.participantIds.includes(userId2)
    );
  }
}
