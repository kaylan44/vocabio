jest.mock('../services/api', () => ({
  quizApi: { getWordProgress: jest.fn() },
}));

import { computeMastery, rowsToWords, useProgressStore } from '../store/progressStore';
import { quizApi } from '../services/api';
import type { WordProgressRow } from '../types';

const getWordProgress = quizApi.getWordProgress as jest.MockedFunction<typeof quizApi.getWordProgress>;

const row = (overrides: Partial<WordProgressRow> = {}): WordProgressRow => ({
  wordId: 'n001',
  mode: 'fr-es',
  correctStreak: 1,
  totalSeen: 2,
  totalCorrect: 1,
  lastSeenAt: '2026-10-05T10:00:00.000Z',
  ...overrides,
});

beforeEach(() => {
  getWordProgress.mockReset();
  getWordProgress.mockResolvedValue([]);
  useProgressStore.getState().clearProgress();
});

// ─── computeMastery unit tests ────────────────────────────────────────────────

describe('computeMastery', () => {
  it('returns "new" when totalSeen is 0', () => {
    expect(computeMastery(0, 0)).toBe('new');
  });

  it('returns "seen" after first answer', () => {
    expect(computeMastery(1, 1)).toBe('seen');
    expect(computeMastery(0, 1)).toBe('seen');
  });

  it('returns "mastered" after 3 consecutive correct answers', () => {
    expect(computeMastery(3, 3)).toBe('mastered');
  });

  it('returns "mastered" for streak >= 3', () => {
    expect(computeMastery(5, 5)).toBe('mastered');
  });

  it('streak of 2 is still "seen"', () => {
    expect(computeMastery(2, 3)).toBe('seen');
  });
});

// ─── rowsToWords unit tests ───────────────────────────────────────────────────

describe('rowsToWords', () => {
  it('groups the two modes of a word under the same entry', () => {
    const words = rowsToWords([
      row({ mode: 'fr-es', totalSeen: 2 }),
      row({ mode: 'es-fr', totalSeen: 7 }),
    ]);
    expect(Object.keys(words)).toEqual(['n001']);
    expect(words['n001'].frEs.totalSeen).toBe(2);
    expect(words['n001'].esF.totalSeen).toBe(7);
  });

  it('leaves the other mode at its defaults when only one mode has a row', () => {
    const words = rowsToWords([row({ mode: 'es-fr' })]);
    expect(words['n001'].frEs).toMatchObject({ mastery: 'new', totalSeen: 0, lastSeen: 0 });
  });

  it('derives the mastery level from the streak', () => {
    const words = rowsToWords([
      row({ wordId: 'n001', correctStreak: 3, totalSeen: 3 }),
      row({ wordId: 'n002', correctStreak: 2, totalSeen: 9 }),
      row({ wordId: 'n003', correctStreak: 0, totalSeen: 4 }),
    ]);
    expect(words['n001'].frEs.mastery).toBe('mastered');
    expect(words['n002'].frEs.mastery).toBe('seen');
    expect(words['n003'].frEs.mastery).toBe('seen');
  });

  it('converts lastSeenAt to a timestamp', () => {
    const words = rowsToWords([row()]);
    expect(words['n001'].frEs.lastSeen).toBe(Date.parse('2026-10-05T10:00:00.000Z'));
  });
});

// ─── loadProgress ─────────────────────────────────────────────────────────────

describe('progressStore.loadProgress', () => {
  it('fills the store with the rows of the backend', async () => {
    getWordProgress.mockResolvedValue([row({ correctStreak: 3, totalSeen: 4, totalCorrect: 3 })]);

    await useProgressStore.getState().loadProgress();

    expect(useProgressStore.getState().status).toBe('ready');
    expect(useProgressStore.getState().getWordModeProgress('n001', 'fr-es')).toMatchObject({
      mastery: 'mastered',
      totalSeen: 4,
      totalCorrect: 3,
    });
  });

  it('replaces the previous progress on a reload', async () => {
    getWordProgress.mockResolvedValue([row({ wordId: 'n001' })]);
    await useProgressStore.getState().loadProgress();

    getWordProgress.mockResolvedValue([row({ wordId: 'n002', totalSeen: 9 })]);
    await useProgressStore.getState().loadProgress();

    expect(Object.keys(useProgressStore.getState().words)).toEqual(['n002']);
  });

  it('reports an error and stays empty when the first load fails', async () => {
    getWordProgress.mockRejectedValue(new Error('offline'));

    await useProgressStore.getState().loadProgress();

    expect(useProgressStore.getState().status).toBe('error');
    expect(useProgressStore.getState().words).toEqual({});
  });

  it('keeps the progress already loaded when a reload fails', async () => {
    getWordProgress.mockResolvedValue([row()]);
    await useProgressStore.getState().loadProgress();

    getWordProgress.mockRejectedValue(new Error('offline'));
    await useProgressStore.getState().loadProgress();

    expect(useProgressStore.getState().status).toBe('error');
    expect(useProgressStore.getState().getWordModeProgress('n001', 'fr-es')?.totalSeen).toBe(2);
  });

  it('ignores a response that arrives after clearProgress (sign-out during the load)', async () => {
    let resolveRows: (rows: WordProgressRow[]) => void = () => {};
    getWordProgress.mockReturnValue(new Promise(resolve => { resolveRows = resolve; }));

    const pending = useProgressStore.getState().loadProgress();
    useProgressStore.getState().clearProgress();
    resolveRows([row()]);
    await pending;

    expect(useProgressStore.getState().words).toEqual({});
    expect(useProgressStore.getState().status).toBe('idle');
  });
});

// ─── Readers ──────────────────────────────────────────────────────────────────

describe('progressStore readers', () => {
  beforeEach(async () => {
    getWordProgress.mockResolvedValue([
      row({ wordId: 'n001', mode: 'fr-es', correctStreak: 3, totalSeen: 3, totalCorrect: 3 }),
      row({ wordId: 'n001', mode: 'es-fr', correctStreak: 3, totalSeen: 5, totalCorrect: 4 }),
      row({ wordId: 'n002', mode: 'es-fr', correctStreak: 1, totalSeen: 1, totalCorrect: 1 }),
    ]);
    await useProgressStore.getState().loadProgress();
  });

  it('fr-es and es-fr progress are independent', () => {
    const { getWordModeProgress } = useProgressStore.getState();
    expect(getWordModeProgress('n001', 'fr-es')?.totalSeen).toBe(3);
    expect(getWordModeProgress('n001', 'es-fr')?.totalSeen).toBe(5);
  });

  it('getModeProgressMap includes only words present in progress', () => {
    const frEsMap = useProgressStore.getState().getModeProgressMap('fr-es');
    expect(frEsMap['n001']?.totalSeen).toBe(3);
    // n002 was only answered es-fr → frEs is default (totalSeen 0)
    expect(frEsMap['n002']?.totalSeen).toBe(0);
    // word never seen at all → not in map
    expect(frEsMap['n999']).toBeUndefined();
  });

  it('getWordCombinedProgress adds both modes and needs both mastered', () => {
    const { getWordCombinedProgress } = useProgressStore.getState();
    expect(getWordCombinedProgress('n001')).toEqual({ totalSeen: 8, totalCorrect: 7, isMastered: true });
    expect(getWordCombinedProgress('n002')).toEqual({ totalSeen: 1, totalCorrect: 1, isMastered: false });
    expect(getWordCombinedProgress('n999')).toEqual({ totalSeen: 0, totalCorrect: 0, isMastered: false });
  });
});

// ─── clearProgress ────────────────────────────────────────────────────────────

describe('progressStore.clearProgress', () => {
  it('empties the store', async () => {
    getWordProgress.mockResolvedValue([row()]);
    await useProgressStore.getState().loadProgress();

    useProgressStore.getState().clearProgress();

    expect(useProgressStore.getState().words).toEqual({});
    expect(useProgressStore.getState().status).toBe('idle');
  });
});
