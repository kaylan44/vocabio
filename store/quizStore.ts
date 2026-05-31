import { create } from 'zustand';
import { QuizSession, QuizMode } from '../types';
import { buildQuizSession } from '../features/quiz/quizEngine';

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
    const session = buildQuizSession(mode, progressMap);
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
