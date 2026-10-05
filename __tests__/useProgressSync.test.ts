jest.mock('../services/api', () => ({
  quizApi: { getWordProgress: jest.fn() },
}));

import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook } from '@testing-library/react-hooks';
import { useProgressSync } from '../hooks/useProgressSync';
import { quizApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useProgressStore } from '../store/progressStore';
import type { AuthUser, WordProgressRow } from '../types';

const list = quizApi.getWordProgress as jest.MockedFunction<typeof quizApi.getWordProgress>;

const LEGACY_KEY = '@vocabio_progress_v1';

const ROWS: WordProgressRow[] = [
  { wordId: 'n001', mode: 'fr-es', correctStreak: 3, totalSeen: 4, totalCorrect: 3, lastSeenAt: '2026-10-05T10:00:00.000Z' },
];

const user = (id: string): AuthUser => ({
  id, email: null, fullName: null, avatarUrl: null, provider: 'google', createdAt: null,
});

async function flush() {
  await act(async () => {});
}

beforeEach(() => {
  list.mockReset();
  list.mockResolvedValue(ROWS);
  useAuthStore.setState({ status: 'loading', user: null });
  useProgressStore.getState().clearProgress();
});

describe('useProgressSync', () => {
  it('loads the progress from the backend once the user is authenticated', async () => {
    useAuthStore.setState({ status: 'authenticated', user: user('u1') });
    renderHook(() => useProgressSync());
    await flush();

    expect(list).toHaveBeenCalledTimes(1);
    expect(useProgressStore.getState().getWordModeProgress('n001', 'fr-es')?.mastery).toBe('mastered');
  });

  it('loads nothing for a guest', async () => {
    useAuthStore.setState({ status: 'guest', user: null });
    renderHook(() => useProgressSync());
    await flush();

    expect(list).not.toHaveBeenCalled();
    expect(useProgressStore.getState().words).toEqual({});
  });

  it('empties the store on sign-out', async () => {
    useAuthStore.setState({ status: 'authenticated', user: user('u1') });
    renderHook(() => useProgressSync());
    await flush();

    act(() => { useAuthStore.setState({ status: 'unauthenticated', user: null }); });

    expect(useProgressStore.getState().words).toEqual({});
  });

  it('reloads when another user signs in', async () => {
    useAuthStore.setState({ status: 'authenticated', user: user('u1') });
    renderHook(() => useProgressSync());
    await flush();

    list.mockResolvedValue([]);
    act(() => { useAuthStore.setState({ status: 'authenticated', user: user('u2') }); });
    await flush();

    expect(list).toHaveBeenCalledTimes(2);
    expect(useProgressStore.getState().words).toEqual({});
  });

  it('deletes the progress left on the device by previous versions', async () => {
    await AsyncStorage.setItem(LEGACY_KEY, '{"words":{}}');
    useAuthStore.setState({ status: 'guest', user: null });
    renderHook(() => useProgressSync());
    await flush();

    expect(await AsyncStorage.getItem(LEGACY_KEY)).toBeNull();
  });
});
