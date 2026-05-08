import { Injectable, inject } from '@angular/core';
import { UserRepository } from '../../repositories/user.repository';
import { ChannelRepository } from '../../repositories/channel.repository';
import { DirectMessageRepository } from '../../repositories/direct-message.repository';
import { CurrentUser } from '../../interfaces/currentUser.interface';
import { Channel } from '../../models/channel.class';
import { PrivateChat } from '../../models/privateChat.class';
import { ChatMessage } from '../../interfaces/chatMessage.interface';

/**
 * Facade that delegates to focused repositories.
 * All existing consumers continue to work without changes.
 */
@Injectable({ providedIn: 'root' })
export class FirestoreService {
  private readonly userRepo = inject(UserRepository);
  private readonly channelRepo = inject(ChannelRepository);
  private readonly dmRepo = inject(DirectMessageRepository);

  // ── Signals (re-exported from repositories) ────────────────────────────
  readonly userList = this.userRepo.userList;
  readonly allChannels = this.channelRepo.allChannels;
  readonly allExistingChannels = this.channelRepo.allExistingChannels;
  readonly directMessages = this.dmRepo.directMessages;
  readonly allDirectMessages = this.dmRepo.allDirectMessages;

  // ── Mutable state forwarded from repositories ───────────────────────────
  get newChannelId(): string | undefined {
    return this.channelRepo.newChannelId;
  }
  set newChannelId(v: string | undefined) {
    this.channelRepo.newChannelId = v;
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

  async addUser(userId: string, user: CurrentUser): Promise<void> {
    return this.userRepo.addUser(userId, user);
  }

  async updateUser(userId: string, newUser: CurrentUser): Promise<void> {
    return this.userRepo.updateUser(userId, newUser);
  }

  async updateUserNotification(userId: string, notification: unknown): Promise<void> {
    return this.userRepo.updateUserNotification(userId, notification);
  }

  setUserObject(obj: Record<string, unknown>, id: string): CurrentUser {
    return this.userRepo.setUserObject(obj, id);
  }

  getCleanUserJson(obj: Record<string, unknown>) {
    return this.userRepo.getCleanUserJson(obj);
  }

  // ── Channel operations ──────────────────────────────────────────────────
  getChannelsRef() {
    return this.channelRepo.getChannelsRef();
  }

  getSingleChannelRef(colId: string, docId: string) {
    return this.channelRepo.getSingleChannelRef(colId, docId);
  }

  getChatsRef(channelId: string) {
    return this.channelRepo.getSingleChannelRef('channels', channelId);
  }

  async addChannel(obj: object): Promise<void> {
    return this.channelRepo.addChannel(obj);
  }

  async updateChannel(item: object, docId: string): Promise<void> {
    return this.channelRepo.updateChannel(item, docId);
  }

  async updateAllChats(docId: string, newChats: ChatMessage[]): Promise<void> {
    return this.channelRepo.updateAllChats(docId, newChats);
  }

  async updateChannelUsers(updatedUser: unknown, docId: string): Promise<void> {
    return this.channelRepo.updateChannelUsers(updatedUser, docId);
  }

  async updateMembers(updateMembers: string | CurrentUser, docId: string): Promise<void> {
    return this.channelRepo.updateMembers(updateMembers, docId);
  }

  async updatePartecipantsIds(id: string, docId: string): Promise<void> {
    return this.channelRepo.updatePartecipantsIds(id, docId);
  }

  async updateChats(docId: string, messageObject: ChatMessage): Promise<void> {
    return this.channelRepo.updateChats(docId, messageObject);
  }

  // ── Direct Message operations ────────────────────────────────────────────
  getDirectMessRef() {
    return this.dmRepo.getDirectMessRef();
  }

  getDirectMessSingleDoc(docId: string) {
    return this.dmRepo.getDirectMessSingleDoc(docId);
  }

  async addChatRoom(obj: object): Promise<void> {
    return this.dmRepo.addChatRoom(obj);
  }

  async updatePrivateChat(docId: string, messageObject: ChatMessage): Promise<void> {
    return this.dmRepo.updatePrivateChat(docId, messageObject);
  }

  async updateCompletePrivateMessage(docId: string, privateMessage: PrivateChat): Promise<void> {
    return this.dmRepo.updateCompletePrivateMessage(docId, privateMessage);
  }

  async updateCompletlyPrivateChat(docId: string, messageObject: ChatMessage[]): Promise<void> {
    return this.dmRepo.updateCompletlyPrivateChat(docId, messageObject);
  }
}
