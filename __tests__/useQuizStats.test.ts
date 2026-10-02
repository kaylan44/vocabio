jest.mock('../services/api', () => ({
  quizApi: { getStats: jest.fn() },
}));

// Outside a navigator, "focus" is simply the hook being mounted.
jest.mock('expo-router', () => ({
  useFocusEffect: (effect: () => void | (() => void)) => {
    const { useEffect } = require('react');
    useEffect(effect, [effect]);
  },
}));

import { act, renderHook } from '@testing-library/react-hooks';
import { useQuizStats } from '../hooks/useQuizStats';
import { quizApi } from '../services/api';
import type { QuizStats } from '../types';

const getStats = quizApi.getStats as jest.MockedFunction<typeof quizApi.getStats>;

const STATS: QuizStats = {
  totalSessions: 2,
  totalAnswers: 20,
  totalCorrect: 15,
  accuracy: 0.75,
  lastSessionAt: '2026-10-01T10:00:00.000Z',
  byMode: [{ mode: 'fr-es', sessions: 2, answers: 20, correct: 15, accuracy: 0.75 }],
  byCategory: [{ category: 'noun', answers: 20, correct: 15, accuracy: 0.75 }],
  byLevel: [{ level: 'A1', answers: 20, correct: 15, accuracy: 0.75 }],
  mostMissedWords: [{ wordId: 'n001', wrong: 2 }],
};

async function flush() {
  await act(async () => {});
}

beforeEach(() => {
  getStats.mockReset();
  getStats.mockResolvedValue(STATS);
});

describe('useQuizStats', () => {
  it('loads the stats when the screen gets focus', async () => {
    const { result } = renderHook(() => useQuizStats());
    expect(result.current.status).toBe('loading');
    expect(result.current.stats).toBeNull();

    await flush();
    expect(getStats).toHaveBeenCalledTimes(1);
    expect(result.current.status).toBe('ready');
    expect(result.current.stats).toEqual(STATS);
  });

  it('reports an error when loading fails', async () => {
    getStats.mockRejectedValue(new Error('offline'));
    const { result } = renderHook(() => useQuizStats());
    await flush();

    expect(result.current.status).toBe('error');
    expect(result.current.stats).toBeNull();
  });

  it('refresh() reloads and keeps the previous stats if the reload fails', async () => {
    const { result } = renderHook(() => useQuizStats());
    await flush();

    getStats.mockRejectedValue(new Error('offline'));
    await act(async () => { await result.current.refresh(); });

    expect(getStats).toHaveBeenCalledTimes(2);
    expect(result.current.status).toBe('error');
    expect(result.current.stats).toEqual(STATS);
  });

  it('ignores a response that arrives after a newer request', async () => {
    let resolveFirst: (stats: QuizStats) => void = () => {};
    getStats.mockReturnValueOnce(new Promise(resolve => { resolveFirst = resolve; }));
    const { result } = renderHook(() => useQuizStats());

    const newer = { ...STATS, totalSessions: 3 };
    getStats.mockResolvedValue(newer);
    await act(async () => { await result.current.refresh(); });

    await act(async () => { resolveFirst(STATS); });
    expect(result.current.stats).toEqual(newer);
  });
});
