jest.mock('../services/api', () => ({
  messagingApi: {
    listUsers: jest.fn(),
    searchUsers: jest.fn(),
  },
}));

import { act, renderHook } from '@testing-library/react-hooks';
import { MESSAGING_CONFIG } from '../constants/theme';
import { useUserSearch } from '../hooks/useUserSearch';
import { messagingApi } from '../services/api';

const api = messagingApi as jest.Mocked<typeof messagingApi>;
const ALL = [
  { id: 'u1', username: 'Ana', avatarUrl: null },
  { id: 'u2', username: 'Bruno', avatarUrl: null },
];

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  api.listUsers.mockResolvedValue(ALL);
  api.searchUsers.mockResolvedValue([ALL[1]]);
});

afterEach(() => jest.useRealTimers());

async function flush() {
  await act(async () => {
    jest.runOnlyPendingTimers();
  });
}

describe('useUserSearch', () => {
  it('lists every user before anything is typed', async () => {
    const { result } = renderHook(() => useUserSearch());
    await flush();

    expect(api.listUsers).toHaveBeenCalledTimes(1);
    expect(api.searchUsers).not.toHaveBeenCalled();
    expect(result.current.results).toEqual(ALL);
    expect(result.current.status).toBe('ready');
  });

  it('switches to a debounced server search as soon as one character is typed', async () => {
    const { result } = renderHook(() => useUserSearch());
    await flush();

    act(() => result.current.setQuery('b'));
    act(() => { jest.advanceTimersByTime(MESSAGING_CONFIG.searchDebounceMs - 1); });
    expect(api.searchUsers).not.toHaveBeenCalled();

    await flush();
    expect(api.searchUsers).toHaveBeenCalledWith('b');
    expect(result.current.results).toEqual([ALL[1]]);
  });

  it('goes back to the full list when the query is cleared', async () => {
    const { result } = renderHook(() => useUserSearch());
    await flush();
    act(() => result.current.setQuery('b'));
    await flush();

    act(() => result.current.setQuery('  '));
    await flush();

    expect(api.listUsers).toHaveBeenCalledTimes(2);
    expect(result.current.results).toEqual(ALL);
  });

  it('reports an error when loading fails', async () => {
    api.listUsers.mockRejectedValue(new Error('offline'));
    const { result } = renderHook(() => useUserSearch());
    await flush();

    expect(result.current.status).toBe('error');
  });
});
