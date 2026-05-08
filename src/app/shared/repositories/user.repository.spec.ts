import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Firestore } from '@angular/fire/firestore';
import { UserRepository } from './user.repository';
import { CurrentUser } from '../interfaces/currentUser.interface';

vi.mock('@angular/fire/firestore', async importOriginal => {
  const actual = await importOriginal<typeof import('@angular/fire/firestore')>();
  return {
    ...actual,
    onSnapshot: vi.fn(() => vi.fn()),
    collection: vi.fn(() => ({})),
    doc: vi.fn(() => ({})),
    setDoc: vi.fn(() => Promise.resolve()),
    updateDoc: vi.fn(() => Promise.resolve()),
    arrayUnion: vi.fn(v => v),
  };
});

const buildUser = (overrides: Partial<CurrentUser> = {}): CurrentUser => ({
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  avatarPath: '/avatar.png',
  selected: false,
  loginState: 'loggedOut',
  type: 'CurrentUser',
  notification: [],
  directMessages: [],
  ...overrides,
} as CurrentUser);

describe('UserRepository', () => {
  let repo: UserRepository;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserRepository, { provide: Firestore, useValue: {} }],
    });
    repo = TestBed.inject(UserRepository);
  });

  it('initialises userList signal as empty array', () => {
    expect(repo.userList()).toEqual([]);
  });

  it('addUser calls setDoc with the correct userId and user object', async () => {
    const { setDoc } = await import('@angular/fire/firestore');
    vi.mocked(setDoc).mockClear();

    const user = buildUser();
    await repo.addUser('user-1', user);

    expect(setDoc).toHaveBeenCalledTimes(1);
  });

  it('updateUser calls updateDoc once', async () => {
    const { updateDoc } = await import('@angular/fire/firestore');
    vi.mocked(updateDoc).mockClear();

    await repo.updateUser('user-1', buildUser());

    expect(updateDoc).toHaveBeenCalledTimes(1);
  });

  it('updateUserNotification calls updateDoc with arrayUnion of the notification', async () => {
    const { updateDoc, arrayUnion } = await import('@angular/fire/firestore');
    vi.mocked(updateDoc).mockClear();
    vi.mocked(arrayUnion).mockClear();

    await repo.updateUserNotification('user-1', { message: 'You have a new message' });

    expect(arrayUnion).toHaveBeenCalledWith({ message: 'You have a new message' });
    expect(updateDoc).toHaveBeenCalledTimes(1);
  });

  it('setUserObject maps all fields correctly from a plain object', () => {
    const raw = {
      name: 'Alice',
      email: 'alice@test.com',
      avatarPath: '/alice.png',
      selected: true,
      directMessages: ['dm-1'],
      loginState: 'loggedIn',
      notification: [{ text: 'hi' }],
    };

    const result = repo.setUserObject(raw as Record<string, unknown>, 'uid-42');

    expect(result.id).toBe('uid-42');
    expect(result.name).toBe('Alice');
    expect(result.email).toBe('alice@test.com');
    expect(result.avatarPath).toBe('/alice.png');
    expect(result.selected).toBe(true);
    expect(result.loginState).toBe('loggedIn');
    expect(result.notification).toEqual([{ text: 'hi' }]);
    expect(result.type).toBe('CurrentUser');
  });

  it('setUserObject uses defaults when fields are missing', () => {
    const result = repo.setUserObject({}, 'uid-empty');

    expect(result.name).toBe('');
    expect(result.email).toBe('');
    expect(result.avatarPath).toBe('');
    expect(result.selected).toBe(false);
    expect(result.loginState).toBe('loggedOut');
    expect(result.directMessages).toEqual([]);
    expect(result.notification).toEqual([]);
  });

  it('getCleanUserJson returns only the allowed fields', () => {
    const raw = {
      id: 'u-99',
      name: 'Bob',
      email: 'bob@test.com',
      avatarPath: '/bob.png',
      selected: false,
      directMessages: ['dm-2'],
      loginState: 'loggedIn',
      notification: [],
    };

    const clean = repo.getCleanUserJson(raw);

    expect(Object.keys(clean)).toEqual(['id', 'name', 'email', 'avatarPath', 'selected', 'directMessages']);
    expect(clean).not.toHaveProperty('loginState');
    expect(clean).not.toHaveProperty('notification');
  });

  it('addUser handles setDoc rejection gracefully without throwing', async () => {
    const { setDoc } = await import('@angular/fire/firestore');
    vi.mocked(setDoc).mockRejectedValueOnce(new Error('Write failed'));

    await expect(repo.addUser('user-fail', buildUser())).resolves.toBeUndefined();
  });
});
