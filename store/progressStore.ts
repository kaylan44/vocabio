import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProgress, WordModeProgress, QuizMode } from '../types';
import { QUIZ_CONFIG } from '../constants/theme';

const STORAGE_KEY = '@vocabio_progress_v1';

// ─── Store definition ─────────────────────────────────────────────────────────

interface ProgressState {
  progress: UserProgress;
  isLoaded: boolean;

  // Actions
  loadProgress: () => Promise<void>;
  recordAnswer: (wordId: string, mode: QuizMode, correct: boolean) => void;
  getWordModeProgress: (wordId: string, mode: QuizMode) => WordModeProgress | undefined;
  getModeProgressMap: (mode: QuizMode) => Record<string, WordModeProgress | undefined>;
  resetProgress: () => void;
}

const DEFAULT_PROGRESS: UserProgress = {
  words: {},
  totalSessions: 0,
  totalCorrect: 0,
};

const DEFAULT_MODE_PROGRESS: WordModeProgress = {
  mastery: 'new',
  correctStreak: 0,
  totalSeen: 0,
  totalCorrect: 0,
  lastSeen: 0,
};

export const useProgressStore = create<ProgressState>((set, get) => ({
  progress: DEFAULT_PROGRESS,
  isLoaded: false,

  // ─── Load from AsyncStorage on app start ────────────────────────────────────
  loadProgress: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: UserProgress = JSON.parse(raw);
        set({ progress: parsed, isLoaded: true });
      } else {
        set({ isLoaded: true });
      }
    } catch {
      set({ isLoaded: true }); // Fail silently — app still works
    }
  },

  // ─── Record an answer and update mastery ────────────────────────────────────
  recordAnswer: (wordId, mode, correct) => {
    const { progress } = get();
    const modeKey: 'frEs' | 'esF' = mode === 'fr-es' ? 'frEs' : 'esF';

    const wordProgress = progress.words[wordId] ?? {
      wordId,
      frEs: { ...DEFAULT_MODE_PROGRESS },
      esF: { ...DEFAULT_MODE_PROGRESS },
    };

    const modeProgress = wordProgress[modeKey];

    // Update stats
    const newStreak = correct ? modeProgress.correctStreak + 1 : 0;
    const newMastery = computeMastery(newStreak, modeProgress.totalSeen + 1);

    const updatedModeProgress: WordModeProgress = {
      mastery: newMastery,
      correctStreak: newStreak,
      totalSeen: modeProgress.totalSeen + 1,
      totalCorrect: modeProgress.totalCorrect + (correct ? 1 : 0),
      lastSeen: Date.now(),
    };

    const updatedProgress: UserProgress = {
      ...progress,
      totalCorrect: progress.totalCorrect + (correct ? 1 : 0),
      words: {
        ...progress.words,
        [wordId]: {
          ...wordProgress,
          [modeKey]: updatedModeProgress,
        },
      },
    };

    set({ progress: updatedProgress });

    // Persist async — fire and forget
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedProgress)).catch(console.error);
  },

  getWordModeProgress: (wordId, mode) => {
    const { progress } = get();
    const modeKey: 'frEs' | 'esF' = mode === 'fr-es' ? 'frEs' : 'esF';
    return progress.words[wordId]?.[modeKey];
  },

  getModeProgressMap: (mode) => {
    const { progress } = get();
    const modeKey: 'frEs' | 'esF' = mode === 'fr-es' ? 'frEs' : 'esF';
    const map: Record<string, WordModeProgress | undefined> = {};
    for (const [wordId, wp] of Object.entries(progress.words)) {
      map[wordId] = wp[modeKey];
    }
    return map;
  },

  resetProgress: () => {
    set({ progress: DEFAULT_PROGRESS });
    AsyncStorage.removeItem(STORAGE_KEY).catch(console.error);
  },
}));

// ─── Helper ───────────────────────────────────────────────────────────────────

function computeMastery(streak: number, totalSeen: number): WordModeProgress['mastery'] {
  if (streak >= QUIZ_CONFIG.masteryThreshold) return 'mastered';
  if (totalSeen > 0) return 'seen';
  return 'new';
}
