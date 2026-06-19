import { renderHook, act } from '@testing-library/react-hooks';
import { useQuizSession } from '../hooks/useQuizSession';
import { useQuizStore } from '../store/quizStore';
import { useProgressStore } from '../store/progressStore';

const mockPush = jest.fn();
const mockReplace = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

describe('useQuizSession', () => {
  beforeEach(() => {
    mockPush.mockClear();
    mockReplace.mockClear();
    useQuizStore.getState().resetSession();
    useProgressStore.getState().resetProgress();
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

  it('selectAnswer() records answer in progressStore', () => {
    const { result } = renderHook(() => useQuizSession());
    act(() => { result.current.start('fr-es'); });
    const q = result.current.currentQuestion!;
    act(() => { result.current.selectAnswer(q.correctAnswer); });
    const p = useProgressStore.getState().getWordModeProgress(q.wordId, 'fr-es');
    expect(p?.totalSeen).toBe(1);
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

  it('goHome() resets session and navigates to /', () => {
    const { result } = renderHook(() => useQuizSession());
    act(() => { result.current.start('fr-es'); });
    act(() => { result.current.goHome(); });
    expect(result.current.session).toBeNull();
    expect(mockReplace).toHaveBeenCalledWith('/');
  });
});
