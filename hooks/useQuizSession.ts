import { useCallback, useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useQuizStore } from '../store/quizStore';
import { useProgressStore } from '../store/progressStore';
import { QuizMode } from '../types';

/**
 * Central hook for the quiz flow.
 * Coordinates: quizStore (session state) + progressStore (persistence) + navigation.
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

  const { getModeProgressMap, recordAnswer, getWordModeProgress, getWordCombinedProgress } = useProgressStore();

  // ─── Start a new session ─────────────────────────────────────────────────────
  const start = useCallback((mode: QuizMode) => {
    const progressMap = getModeProgressMap(mode);
    startSession(mode, progressMap);
    router.push('/quiz');
  }, [getModeProgressMap, startSession, router]);

  // ─── Handle answer selection ─────────────────────────────────────────────────
  const selectAnswer = useCallback((answer: string) => {
    if (!session || hasAnswered) return;
    const question = session.questions[session.currentIndex];
    const isCorrect = answer === question.correctAnswer;

    storeSelectAnswer(answer);
    // Record to progress store (async persist handled internally)
    recordAnswer(question.wordId, session.mode, isCorrect);
  }, [session, hasAnswered, storeSelectAnswer, recordAnswer]);

  // ─── Advance to next question or go to results ───────────────────────────────
  const nextQuestion = useCallback(() => {
    if (!session) return;
    const isLastQuestion = session.currentIndex >= session.questions.length - 1;

    if (isLastQuestion) {
      // Navigate to result — session data stays in store until reset
      router.push('/result');
    } else {
      storeNextQuestion();
    }
  }, [session, storeNextQuestion, router]);

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
