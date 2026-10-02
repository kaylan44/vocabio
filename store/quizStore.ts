import { randomUUID } from 'expo-crypto';
import { create } from 'zustand';
import { QuizSession, QuizMode } from '../types';
import { buildQuizSession } from '../features/quiz/quizEngine';

// ─── Session id ───────────────────────────────────────────────────────────────

/**
 * On web, crypto.randomUUID() only exists in secure contexts (HTTPS or localhost).
 * The quiz must still start elsewhere (e.g. the dev server opened through a LAN IP),
 * so fall back to a Math.random-based UUID v4: it is an idempotency key, not a secret.
 */
function createSessionId(): string {
  try {
    return randomUUID();
  } catch {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.floor(Math.random() * 16);
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
  }
}

// ─── Store definition ─────────────────────────────────────────────────────────

interface QuizState {
  session: QuizSession | null;
  selectedAnswer: string | null;
  hasAnswered: boolean;

  // Actions
  startSession: (mode: QuizMode, progressMap: Record<string, any>) => void;
  selectAnswer: (answer: string) => void;
  nextQuestion: () => void;
  resetSession: () => void;
}

export const useQuizStore = create<QuizState>((set, get) => ({
  session: null,
  selectedAnswer: null,
  hasAnswered: false,

  // ─── Start a new session ─────────────────────────────────────────────────────
  startSession: (mode, progressMap) => {
    const session = { id: createSessionId(), ...buildQuizSession(mode, progressMap) };
    set({ session, selectedAnswer: null, hasAnswered: false });
  },

  // ─── User selects an answer ───────────────────────────────────────────────────
  selectAnswer: (answer) => {
    const { session, hasAnswered } = get();
    if (!session || hasAnswered) return;

    const question = session.questions[session.currentIndex];
    const isCorrect = answer === question.correctAnswer;

    const newAnswers = [...session.answers];
    newAnswers[session.currentIndex] = isCorrect;

    set({
      selectedAnswer: answer,
      hasAnswered: true,
      session: {
        ...session,
        score: isCorrect ? session.score + 1 : session.score,
        answers: newAnswers,
      },
    });
  },

  // ─── Advance to next question ─────────────────────────────────────────────────
  nextQuestion: () => {
    const { session } = get();
    if (!session) return;

    set({
      selectedAnswer: null,
      hasAnswered: false,
      session: {
        ...session,
        currentIndex: session.currentIndex + 1,
      },
    });
  },

  // ─── Clear session ────────────────────────────────────────────────────────────
  resetSession: () => {
    set({ session: null, selectedAnswer: null, hasAnswered: false });
  },
}));
