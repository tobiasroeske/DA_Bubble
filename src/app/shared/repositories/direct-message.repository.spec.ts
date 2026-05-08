import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { DirectMessageRepository } from './direct-message.repository';
import { PrivateChat } from '../models/privateChat.class';

vi.mock('@angular/fire/firestore', async importOriginal => {
  const actual = await importOriginal<typeof import('@angular/fire/firestore')>();
  return {
    ...actual,
    onSnapshot: vi.fn(() => vi.fn()),
    collection: vi.fn(() => ({})),
    doc: vi.fn(() => ({})),
    addDoc: vi.fn(() => Promise.resolve({ id: 'new-chat-room-id' })),
    updateDoc: vi.fn(() => Promise.resolve()),
    query: vi.fn(() => ({})),
    where: vi.fn(() => ({})),
    orderBy: vi.fn(() => ({})),
    arrayUnion: vi.fn(v => v),
  };
});

describe('DirectMessageRepository', () => {
  let repo: DirectMessageRepository;
  let authStateCb: ((user: { uid: string } | null) => void) | undefined;

  const mockAuth = {
    onAuthStateChanged: vi.fn((cb: (user: { uid: string } | null) => void) => {
      authStateCb = cb;
      return vi.fn();
    }),
  };

  beforeEach(() => {
    authStateCb = undefined;
    mockAuth.onAuthStateChanged.mockImplementation((cb: (user: { uid: string } | null) => void) => {
      authStateCb = cb;
      return vi.fn();
    });

    TestBed.configureTestingModule({
      providers: [
        DirectMessageRepository,
        { provide: Firestore, useValue: {} },
        { provide: Auth, useValue: mockAuth },
      ],
    });

    repo = TestBed.inject(DirectMessageRepository);
  });

  it('initialises directMessages signal as empty array', () => {
    expect(repo.directMessages()).toEqual([]);
  });

  it('initialises allDirectMessages signal as empty array', () => {
    expect(repo.allDirectMessages()).toEqual([]);
  });

  it('clears signals when auth state changes to null (logout)', () => {
    const fakeChat = new PrivateChat({ partecipantsIds: ['u1', 'u2'], initiatedAt: '', lastUpdateAt: 0, creator: {}, guest: {}, chat: [], type: 'PrivateChat' });
    repo.directMessages.set([fakeChat]);
    repo.allDirectMessages.set([fakeChat]);

    authStateCb?.(null);

    expect(repo.directMessages()).toEqual([]);
    expect(repo.allDirectMessages()).toEqual([]);
  });

  it('addChatRoom calls addDoc and updateDoc', async () => {
    const { addDoc, updateDoc } = await import('@angular/fire/firestore');
    vi.mocked(addDoc).mockClear();
    vi.mocked(updateDoc).mockClear();

    await repo.addChatRoom({ partecipantsIds: ['u1', 'u2'] });

    expect(addDoc).toHaveBeenCalledTimes(1);
    expect(updateDoc).toHaveBeenCalledTimes(1);
  });

  it('addChatRoom stores the new document id in chatRoomId', async () => {
    await repo.addChatRoom({ partecipantsIds: ['u1', 'u2'] });
    expect(repo.chatRoomId).toBe('new-chat-room-id');
  });

  it('updatePrivateChat calls updateDoc twice (once for chat, once for lastUpdateAt)', async () => {
    const { updateDoc } = await import('@angular/fire/firestore');
    vi.mocked(updateDoc).mockClear();

    const message = { text: 'hello', creatorId: 'u1', creatorName: 'User 1', time: '10:00', date: '2024-01-01', reactions: [], thread: [] };
    await repo.updatePrivateChat('room-1', message as never);

    expect(updateDoc).toHaveBeenCalledTimes(2);
  });

  it('updateCompletePrivateMessage calls updateDoc with toJSON result', async () => {
    const { updateDoc } = await import('@angular/fire/firestore');
    vi.mocked(updateDoc).mockClear();

    const privateChat = new PrivateChat({
      id: 'room-1',
      partecipantsIds: ['u1', 'u2'],
      initiatedAt: '2024-01-01',
      lastUpdateAt: 0,
      creator: {},
      guest: {},
      chat: [],
      type: 'PrivateChat',
    });

    await repo.updateCompletePrivateMessage('room-1', privateChat);

    expect(updateDoc).toHaveBeenCalledTimes(1);
    const callArg = vi.mocked(updateDoc).mock.calls[0][1];
    expect(callArg).toHaveProperty('partecipantsIds');
    expect(callArg).toHaveProperty('type', 'PrivateChat');
  });

  it('addChatRoom handles addDoc rejection gracefully without throwing', async () => {
    const { addDoc } = await import('@angular/fire/firestore');
    vi.mocked(addDoc).mockRejectedValueOnce(new Error('Firestore unavailable'));

    await expect(repo.addChatRoom({ partecipantsIds: [] })).resolves.toBeUndefined();
  });

  it('updateCompletePrivateMessage handles updateDoc rejection gracefully without throwing', async () => {
    const { updateDoc } = await import('@angular/fire/firestore');
    vi.mocked(updateDoc).mockRejectedValueOnce(new Error('Write failed'));

    const privateChat = new PrivateChat({});
    await expect(repo.updateCompletePrivateMessage('room-fail', privateChat)).resolves.toBeUndefined();
  });
});
