import { create } from 'zustand';
import { quizApi } from '../services/api';
import { LoadStatus, QuizMode, WordModeProgress, WordProgress, WordProgressRow } from '../types';
import { QUIZ_CONFIG } from '../constants/config';

export interface WordCombinedProgress {
  totalSeen: number;
  totalCorrect: number;
  isMastered: boolean;
}

// ─── Store definition ─────────────────────────────────────────────────────────
// Read-only copy of the signed-in user's progress. The backend computes it from the
// finished quizzes (POST /quiz-sessions); nothing is written to the device and nothing
// is computed here. Guests have no progress, so for them it simply stays empty.

interface ProgressState {
  words: Record<string, WordProgress>;
  status: LoadStatus;

  // Actions
  loadProgress: () => Promise<void>;
  getWordModeProgress: (wordId: string, mode: QuizMode) => WordModeProgress | undefined;
  getModeProgressMap: (mode: QuizMode) => Record<string, WordModeProgress | undefined>;
  getWordCombinedProgress: (wordId: string) => WordCombinedProgress;
  clearProgress: () => void;
}

const DEFAULT_MODE_PROGRESS: WordModeProgress = {
  mastery: 'new',
  correctStreak: 0,
  totalSeen: 0,
  totalCorrect: 0,
  lastSeen: 0,
};

type ModeKey = 'frEs' | 'esF';

const toModeKey = (mode: QuizMode): ModeKey => (mode === 'fr-es' ? 'frEs' : 'esF');

// Ignore a response that arrives after a newer load, or after the user signed out.
let loadId = 0;

export const useProgressStore = create<ProgressState>((set, get) => ({
  words: {},
  status: 'idle',

  // ─── Load the signed-in user's progress from the backend ────────────────────
  loadProgress: async () => {
    const id = ++loadId;
    set({ status: 'loading' });
    try {
      const rows = await quizApi.getWordProgress();
      if (id !== loadId) return;
      set({ words: rowsToWords(rows), status: 'ready' });
    } catch {
      // Fail silently — the quiz still works with the progress already in memory
      if (id === loadId) set({ status: 'error' });
    }
  },

  getWordModeProgress: (wordId, mode) => {
    return get().words[wordId]?.[toModeKey(mode)];
  },

  getModeProgressMap: (mode) => {
    const modeKey = toModeKey(mode);
    const map: Record<string, WordModeProgress | undefined> = {};
    for (const [wordId, wp] of Object.entries(get().words)) {
      map[wordId] = wp[modeKey];
    }
    return map;
  },

  getWordCombinedProgress: (wordId) => {
    const wp = get().words[wordId];
    if (!wp) return { totalSeen: 0, totalCorrect: 0, isMastered: false };
    const totalSeen = wp.frEs.totalSeen + wp.esF.totalSeen;
    const totalCorrect = wp.frEs.totalCorrect + wp.esF.totalCorrect;
    const isMastered = wp.frEs.mastery === 'mastered' && wp.esF.mastery === 'mastered';
    return { totalSeen, totalCorrect, isMastered };
  },

  // Empties the memory only (sign-out, user change). Nothing is deleted on the backend.
  clearProgress: () => {
    loadId++;
    set({ words: {}, status: 'idle' });
  },
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function computeMastery(streak: number, totalSeen: number): WordModeProgress['mastery'] {
  if (streak >= QUIZ_CONFIG.masteryThreshold) return 'mastered';
  if (totalSeen > 0) return 'seen';
  return 'new';
}

/** Groups the backend rows (one per word and per mode) by word, and derives the mastery level. */
export function rowsToWords(rows: WordProgressRow[]): Record<string, WordProgress> {
  const words: Record<string, WordProgress> = {};
  for (const row of rows) {
    const word = words[row.wordId] ?? {
      wordId: row.wordId,
      frEs: { ...DEFAULT_MODE_PROGRESS },
      esF: { ...DEFAULT_MODE_PROGRESS },
    };
    word[toModeKey(row.mode)] = {
      mastery: computeMastery(row.correctStreak, row.totalSeen),
      correctStreak: row.correctStreak,
      totalSeen: row.totalSeen,
      totalCorrect: row.totalCorrect,
      lastSeen: Date.parse(row.lastSeenAt),
    };
    words[row.wordId] = word;
  }
  return words;
}
