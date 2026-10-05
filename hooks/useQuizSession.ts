import { useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { buildSessionPayload } from '../features/quiz/quizEngine';
import { quizApi } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { useQuizStore } from '../store/quizStore';
import { useProgressStore } from '../store/progressStore';
import { QuizMode } from '../types';

/**
 * Central hook for the quiz flow.
 * Coordinates: quizStore (session state) + progressStore (per-word progress) + navigation.
 * A finished session of a signed-in user is sent to the backend, which derives both the
 * statistics and the per-word progress from it; the progress is then reloaded.
 * Nothing is sent for an unfinished quiz, nor for a guest.
 */
export function useQuizSession() {
  const router = useRouter();

  const {
    session,
    selectedAnswer,
    hasAnswered,
    startSession,
    selectAnswer: storeSelectAnswer,
    nextQuestion: storeNextQuestion,
    resetSession,
  } = useQuizStore();

  const {
    words,
    getModeProgressMap,
    loadProgress,
    getWordModeProgress: readWordModeProgress,
    getWordCombinedProgress: readWordCombinedProgress,
  } = useProgressStore();
  const isAuthenticated = useAuthStore(s => s.status === 'authenticated');

  // ─── Progress readers ────────────────────────────────────────────────────────
  // The store getters never change identity. These wrappers do, each time the progress
  // changes (it arrives from the network, after the first render), so a list whose
  // renderItem depends on them re-renders its rows.
  const getWordModeProgress = useCallback(
    (wordId: string, mode: QuizMode) => readWordModeProgress(wordId, mode),
    [readWordModeProgress, words],
  );
  const getWordCombinedProgress = useCallback(
    (wordId: string) => readWordCombinedProgress(wordId),
    [readWordCombinedProgress, words],
  );

  // ─── Start a new session ─────────────────────────────────────────────────────
  const start = useCallback((mode: QuizMode) => {
    const progressMap = getModeProgressMap(mode);
    startSession(mode, progressMap);
    router.push('/quiz');
  }, [getModeProgressMap, startSession, router]);

  // ─── Handle answer selection ─────────────────────────────────────────────────
  const selectAnswer = useCallback((answer: string) => {
    if (!session || hasAnswered) return;
    // Only the session changes here: progress is recorded when the quiz is finished.
    storeSelectAnswer(answer);
  }, [session, hasAnswered, storeSelectAnswer]);

  // ─── Advance to next question or go to results ───────────────────────────────
  const nextQuestion = useCallback(() => {
    if (!session) return;
    const isLastQuestion = session.currentIndex >= session.questions.length - 1;

    if (isLastQuestion) {
      // Guests have no JWT: their results are not stored on the backend.
      const payload = isAuthenticated ? buildSessionPayload(session) : null;
      if (payload) {
        // Fire and forget — a network failure must not block the result screen.
        // Once saved, reload the progress: the backend recomputes it from this quiz.
        quizApi.saveSession(payload)
          .then(() => loadProgress())
          .catch(err => console.warn('Quiz session not saved', err));
      }
      // Navigate to result — session data stays in store until reset
      router.push('/result');
    } else {
      storeNextQuestion();
    }
  }, [session, isAuthenticated, loadProgress, storeNextQuestion, router]);

  // ─── Replay same mode ────────────────────────────────────────────────────────
  const replay = useCallback(() => {
    if (!session) return;
    const mode = session.mode;
    resetSession();
    start(mode);
  }, [session, resetSession, start]);

  // ─── Go home ─────────────────────────────────────────────────────────────────
  const goHome = useCallback(() => {
    resetSession();
    router.replace('/');
  }, [resetSession, router]);

  return {
    session,
    selectedAnswer,
    hasAnswered,
    currentQuestion: session ? session.questions[session.currentIndex] : null,
    currentIndex: session?.currentIndex ?? 0,
    totalQuestions: session?.questions.length ?? 0,
    score: session?.score ?? 0,
    start,
    selectAnswer,
    nextQuestion,
    replay,
    goHome,
    getWordModeProgress,
    getWordCombinedProgress,
  };
}
