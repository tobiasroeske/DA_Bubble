import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Firestore } from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { ChannelRepository } from './channel.repository';
import { Channel } from '../models/channel.class';

vi.mock('@angular/fire/firestore', async importOriginal => {
  const actual = await importOriginal<typeof import('@angular/fire/firestore')>();
  return {
    ...actual,
    onSnapshot: vi.fn(() => vi.fn()),
    collection: vi.fn(() => ({})),
    doc: vi.fn(() => ({})),
    addDoc: vi.fn(() => Promise.resolve({ id: 'new-channel-id' })),
    updateDoc: vi.fn(() => Promise.resolve()),
    deleteDoc: vi.fn(() => Promise.resolve()),
    query: vi.fn(() => ({})),
    where: vi.fn(() => ({})),
    arrayUnion: vi.fn(v => v),
  };
});

describe('ChannelRepository', () => {
  let repo: ChannelRepository;
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
        ChannelRepository,
        { provide: Firestore, useValue: {} },
        { provide: Auth, useValue: mockAuth },
      ],
    });

    repo = TestBed.inject(ChannelRepository);
  });

  it('initialises allChannels signal as empty array', () => {
    expect(repo.allChannels()).toEqual([]);
  });

  it('initialises allExistingChannels signal as empty array', () => {
    expect(repo.allExistingChannels()).toEqual([]);
  });

  it('clears signals when auth state changes to null (logout)', () => {
    repo.allChannels.set([new Channel({ title: 'test', members: [], creatorId: '', creatorName: '', allUsers: [], partecipantsIds: [], type: 'Channel' })]);
    repo.allExistingChannels.set([new Channel({ title: 'test', members: [], creatorId: '', creatorName: '', allUsers: [], partecipantsIds: [], type: 'Channel' })]);

    authStateCb?.(null);

    expect(repo.allChannels()).toEqual([]);
    expect(repo.allExistingChannels()).toEqual([]);
  });

  it('addChannel calls addDoc and updateDoc with channel data', async () => {
    const { addDoc, updateDoc } = await import('@angular/fire/firestore');
    const channelData = { title: 'New Channel', members: [], partecipantsIds: [] };

    await repo.addChannel(channelData);

    expect(addDoc).toHaveBeenCalled();
    expect(updateDoc).toHaveBeenCalled();
  });

  it('addChannel stores the new document id in newChannelId', async () => {
    await repo.addChannel({ title: 'Test' });
    expect(repo.newChannelId).toBe('new-channel-id');
  });

  it('updateChannel calls updateDoc with the correct item and docId', async () => {
    const { updateDoc } = await import('@angular/fire/firestore');
    vi.mocked(updateDoc).mockClear();

    await repo.updateChannel({ title: 'Updated' }, 'channel-123');

    expect(updateDoc).toHaveBeenCalledTimes(1);
  });

  it('updateChats calls updateDoc with arrayUnion of the message', async () => {
    const { updateDoc, arrayUnion } = await import('@angular/fire/firestore');
    vi.mocked(updateDoc).mockClear();

    const message = { text: 'hello', creatorId: 'u1', creatorName: 'User 1', time: '10:00', date: '2024-01-01', reactions: [], thread: [] };
    await repo.updateChats('channel-abc', message as never);

    expect(arrayUnion).toHaveBeenCalledWith(message);
    expect(updateDoc).toHaveBeenCalledTimes(1);
  });

  it('updateMembers calls updateDoc with arrayUnion of the member', async () => {
    const { updateDoc, arrayUnion } = await import('@angular/fire/firestore');
    vi.mocked(updateDoc).mockClear();
    vi.mocked(arrayUnion).mockClear();

    await repo.updateMembers('user-id-99', 'channel-abc');

    expect(arrayUnion).toHaveBeenCalledWith('user-id-99');
    expect(updateDoc).toHaveBeenCalledTimes(1);
  });

  it('addChannel handles addDoc rejection gracefully without throwing', async () => {
    const { addDoc } = await import('@angular/fire/firestore');
    vi.mocked(addDoc).mockRejectedValueOnce(new Error('Firestore unavailable'));

    await expect(repo.addChannel({ title: 'fail' })).resolves.toBeUndefined();
  });
});
