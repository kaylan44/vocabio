import { useQuizStore } from '../store/quizStore';

const emptyProgressMap = {};

function freshSession() {
  useQuizStore.getState().resetSession();
  useQuizStore.getState().startSession('fr-es', emptyProgressMap);
}

describe('quizStore', () => {
  beforeEach(freshSession);

  it('starts a session with 10 questions', () => {
    const { session } = useQuizStore.getState();
    expect(session?.questions).toHaveLength(10);
    expect(session?.currentIndex).toBe(0);
    expect(session?.score).toBe(0);
  });

  it('selectAnswer sets hasAnswered to true', () => {
    const { session } = useQuizStore.getState();
    const correct = session!.questions[0].correctAnswer;
    useQuizStore.getState().selectAnswer(correct);
    expect(useQuizStore.getState().hasAnswered).toBe(true);
  });

  it('selectAnswer correct increments score', () => {
    const { session } = useQuizStore.getState();
    const correct = session!.questions[0].correctAnswer;
    useQuizStore.getState().selectAnswer(correct);
    expect(useQuizStore.getState().session?.score).toBe(1);
  });

  it('selectAnswer wrong does not increment score', () => {
    const { session } = useQuizStore.getState();
    const wrong = session!.questions[0].options.find(
      o => o !== session!.questions[0].correctAnswer
    )!;
    useQuizStore.getState().selectAnswer(wrong);
    expect(useQuizStore.getState().session?.score).toBe(0);
  });

  it('selectAnswer is idempotent — second call is ignored', () => {
    const { session } = useQuizStore.getState();
    const correct = session!.questions[0].correctAnswer;
    useQuizStore.getState().selectAnswer(correct);
    useQuizStore.getState().selectAnswer(correct);
    expect(useQuizStore.getState().session?.score).toBe(1);
  });

  it('nextQuestion advances currentIndex and resets answer state', () => {
    const { session } = useQuizStore.getState();
    const correct = session!.questions[0].correctAnswer;
    useQuizStore.getState().selectAnswer(correct);
    useQuizStore.getState().nextQuestion();
    const state = useQuizStore.getState();
    expect(state.session?.currentIndex).toBe(1);
    expect(state.hasAnswered).toBe(false);
    expect(state.selectedAnswer).toBeNull();
  });

  it('resetSession clears everything', () => {
    useQuizStore.getState().resetSession();
    const state = useQuizStore.getState();
    expect(state.session).toBeNull();
    expect(state.hasAnswered).toBe(false);
    expect(state.selectedAnswer).toBeNull();
  });
});
