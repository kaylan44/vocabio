// ─── Core vocabulary types ───────────────────────────────────────────────────

export type GrammarCategory = 'noun' | 'verb' | 'adjective' | 'adverb' | 'expression' | 'pronoun';

export type WordLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export interface VocabWord {
  id: string;
  french: string;
  spanish: string;
  category: GrammarCategory;
  level: WordLevel;
  // Future: audio, example sentences, tags
}

// ─── Quiz types ───────────────────────────────────────────────────────────────

export type QuizMode = 'fr-es' | 'es-fr';

export interface QuizQuestion {
  wordId: string;
  targetWord: string;      // The word displayed to the user
  correctAnswer: string;   // The correct translation
  options: string[];       // 4 shuffled options
  category: GrammarCategory;
  level: WordLevel;
}

export type TileState = 'idle' | 'selected-correct' | 'selected-wrong' | 'revealed-correct' | 'disabled';

export interface QuizSession {
  mode: QuizMode;
  questions: QuizQuestion[];
  currentIndex: number;
  score: number;
  answers: (boolean | null)[];  // null = not answered yet
  usedWordIds: string[];         // Prevent repeats within session
}

// ─── Progress types ───────────────────────────────────────────────────────────

export type MasteryLevel = 'new' | 'seen' | 'mastered';

export interface WordProgress {
  wordId: string;
  // Per-mode stats — FR→ES and ES→FR tracked independently
  frEs: WordModeProgress;
  esF: WordModeProgress;
}

export interface WordModeProgress {
  mastery: MasteryLevel;
  correctStreak: number;
  totalSeen: number;
  totalCorrect: number;
  lastSeen: number;  // timestamp
}

export interface UserProgress {
  words: Record<string, WordProgress>;
  totalSessions: number;
  totalCorrect: number;
  // Future: streaks, xp, achievements
}

// ─── Result types ─────────────────────────────────────────────────────────────

export interface SessionResult {
  score: number;
  total: number;
  mode: QuizMode;
}
