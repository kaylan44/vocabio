import { renderHook, act } from '@testing-library/react-hooks';
import { useQuizSession } from '../hooks/useQuizSession';
import { useQuizStore } from '../store/quizStore';
import { useProgressStore } from '../store/progressStore';
import { useAuthStore } from '../store/authStore';
import { quizApi } from '../services/api';

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

jest.mock('../services/api', () => ({
  quizApi: { saveSession: jest.fn(), getWordProgress: jest.fn() },
}));

const saveSession = quizApi.saveSession as jest.MockedFunction<typeof quizApi.saveSession>;
const getWordProgress = quizApi.getWordProgress as jest.MockedFunction<typeof quizApi.getWordProgress>;

/** Plays a whole quiz, answering right or wrong as listed, then leaves the last question. */
function playQuiz(result: { current: ReturnType<typeof useQuizSession> }, outcomes: boolean[]) {
  for (const isCorrect of outcomes) {
    const q = result.current.currentQuestion!;
    const answer = isCorrect ? q.correctAnswer : q.options.find(o => o !== q.correctAnswer)!;
    act(() => { result.current.selectAnswer(answer); });
    act(() => { result.current.nextQuestion(); });
  }
}

describe('useQuizSession', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockReplace.mockClear();
    saveSession.mockReset();
    saveSession.mockResolvedValue({ id: 'x', mode: 'fr-es', score: 0, total: 10, createdAt: '' });
    getWordProgress.mockReset();
    getWordProgress.mockResolvedValue([]);
    useAuthStore.setState({ status: 'guest', user: null });
    useQuizStore.getState().resetSession();
    useProgressStore.getState().clearProgress();
  });

  it('start() creates a session and navigates to /quiz', () => {
    const { result } = renderHook(() => useQuizSession());
    act(() => { result.current.start('fr-es'); });
    expect(result.current.session).not.toBeNull();
    expect(mockPush).toHaveBeenCalledWith('/quiz');
  });

  it('selectAnswer() correct updates score', () => {
    const { result } = renderHook(() => useQuizSession());
    act(() => { result.current.start('fr-es'); });
    const correct = result.current.currentQuestion!.correctAnswer;
    act(() => { result.current.selectAnswer(correct); });
    expect(result.current.score).toBe(1);
  });

  describe('per-word progress', () => {
    const outcomes = [true, false, true, true, true, false, true, true, true, true];

    it('answering does not change the progress nor call the backend', () => {
      useAuthStore.setState({ status: 'authenticated' });
      const { result } = renderHook(() => useQuizSession());
      act(() => { result.current.start('fr-es'); });
      playQuiz(result, outcomes.slice(0, 9));

      expect(useProgressStore.getState().words).toEqual({});
      expect(saveSession).not.toHaveBeenCalled();
      expect(getWordProgress).not.toHaveBeenCalled();
    });

    it('reloads the progress from the backend once the finished quiz is saved', async () => {
      useAuthStore.setState({ status: 'authenticated' });
      const { result } = renderHook(() => useQuizSession());
      act(() => { result.current.start('fr-es'); });
      const wordId = result.current.currentQuestion!.wordId;
      getWordProgress.mockResolvedValue([
        { wordId, mode: 'fr-es', correctStreak: 1, totalSeen: 1, totalCorrect: 1, lastSeenAt: '2026-10-05T10:00:00.000Z' },
      ]);
      const before = result.current.getWordCombinedProgress;

      playQuiz(result, outcomes);
      await act(async () => {});

      expect(getWordProgress).toHaveBeenCalledTimes(1);
      expect(result.current.getWordCombinedProgress(wordId).totalSeen).toBe(1);
      // New identity, so a list rendering through it refreshes its rows
      expect(result.current.getWordCombinedProgress).not.toBe(before);
    });

    it('does not reload the progress when saving the quiz fails', async () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      saveSession.mockRejectedValue(new Error('offline'));
      useAuthStore.setState({ status: 'authenticated' });
      const { result } = renderHook(() => useQuizSession());
      act(() => { result.current.start('fr-es'); });
      playQuiz(result, outcomes);
      await act(async () => {});

      expect(getWordProgress).not.toHaveBeenCalled();
      warn.mockRestore();
    });

    it('never loads nor records anything for a guest', async () => {
      const { result } = renderHook(() => useQuizSession());
      act(() => { result.current.start('fr-es'); });
      playQuiz(result, outcomes);
      await act(async () => {});

      expect(getWordProgress).not.toHaveBeenCalled();
      expect(useProgressStore.getState().words).toEqual({});
    });
  });

  it('nextQuestion() navigates to /result after last question', () => {
    const { result } = renderHook(() => useQuizSession());
    act(() => { result.current.start('fr-es'); });

    // Answer and advance through all 10 questions
    for (let i = 0; i < 10; i++) {
      const q = result.current.currentQuestion!;
      act(() => { result.current.selectAnswer(q.correctAnswer); });
      act(() => { result.current.nextQuestion(); });
    }

    expect(mockPush).toHaveBeenLastCalledWith('/result');
  });

  describe('sending the finished session to the backend', () => {
    const outcomes = [true, false, true, true, true, false, true, true, true, true];

    it('sends the answers of a signed-in user once the quiz is finished', () => {
      useAuthStore.setState({ status: 'authenticated' });
      const { result } = renderHook(() => useQuizSession());
      act(() => { result.current.start('es-fr'); });
      const session = result.current.session!;

      playQuiz(result, outcomes.slice(0, 9));
      expect(saveSession).not.toHaveBeenCalled();

      playQuiz(result, outcomes.slice(9));
      expect(saveSession).toHaveBeenCalledTimes(1);
      expect(saveSession).toHaveBeenCalledWith({
        id: session.id,
        mode: 'es-fr',
        answers: session.questions.map((q, i) => ({
          wordId: q.wordId,
          category: q.category,
          level: q.level,
          isCorrect: outcomes[i],
        })),
      });
    });

    it('sends nothing for a guest', () => {
      const { result } = renderHook(() => useQuizSession());
      act(() => { result.current.start('fr-es'); });
      playQuiz(result, outcomes);

      expect(saveSession).not.toHaveBeenCalled();
      expect(mockPush).toHaveBeenLastCalledWith('/result');
    });

    it('still shows the result when saving fails', async () => {
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      saveSession.mockRejectedValue(new Error('offline'));
      useAuthStore.setState({ status: 'authenticated' });
      const { result } = renderHook(() => useQuizSession());
      act(() => { result.current.start('fr-es'); });
      playQuiz(result, outcomes);
      await act(async () => {});

      expect(mockPush).toHaveBeenLastCalledWith('/result');
      expect(warn).toHaveBeenCalled();
      warn.mockRestore();
    });
  });

  it('goHome() resets session and navigates to /', () => {
    const { result } = renderHook(() => useQuizSession());
    act(() => { result.current.start('fr-es'); });
    act(() => { result.current.goHome(); });
    expect(result.current.session).toBeNull();
    expect(mockReplace).toHaveBeenCalledWith('/');
  });
});
