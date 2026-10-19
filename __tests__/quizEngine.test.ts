import {
  buildQuizSession,
  buildSessionPayload,
  isSessionComplete,
  getCurrentQuestion,
  selectWeightedWords,
} from '../features/quiz/quizEngine';
import { VOCABULARY, getVocabulary, getWordById } from '../data/vocabulary';
import { QuizSession, WordModeProgress } from '../types';

const emptyProgress = {};

const masteredProgress = (wordId: string): WordModeProgress => ({
  mastery: 'mastered',
  correctStreak: 3,
  totalSeen: 5,
  totalCorrect: 5,
  lastSeen: Date.now(),
});

describe('selectWeightedWords', () => {
  it('returns exactly count distinct words', () => {
    const result = selectWeightedWords(VOCABULARY, 10, emptyProgress);
    expect(result).toHaveLength(10);
    const ids = result.map(w => w.id);
    expect(new Set(ids).size).toBe(10);
  });

  it('returns fewer words if pool is smaller than count', () => {
    const tiny = VOCABULARY.slice(0, 5);
    const result = selectWeightedWords(tiny, 10, emptyProgress);
    expect(result.length).toBeLessThanOrEqual(5);
  });

  it('mastered words are selected less often than new words', () => {
    const [first, ...rest] = VOCABULARY;
    const progressMap: Record<string, WordModeProgress | undefined> = {
      [first.id]: masteredProgress(first.id),
    };

    let masteredCount = 0;
    const RUNS = 500;
    for (let i = 0; i < RUNS; i++) {
      const result = selectWeightedWords(VOCABULARY, 1, progressMap);
      if (result[0].id === first.id) masteredCount++;
    }

    // With weight 1 vs 10, mastered word should appear ~1/300 of the time
    // In 500 runs selecting 1 word from 300, expected ≈ 0.7% → well under 5%
    expect(masteredCount / RUNS).toBeLessThan(0.05);
  });
});

describe('buildQuizSession', () => {
  it('generates exactly 10 questions', () => {
    const session = buildQuizSession('fr-es', emptyProgress);
    expect(session.questions).toHaveLength(10);
  });

  it('each question has 4 unique options', () => {
    const session = buildQuizSession('fr-es', emptyProgress);
    for (const q of session.questions) {
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size).toBe(4);
    }
  });

  it('correctAnswer is always among options', () => {
    const session = buildQuizSession('fr-es', emptyProgress);
    for (const q of session.questions) {
      expect(q.options).toContain(q.correctAnswer);
    }
  });

  it('each word appears only once in a session', () => {
    const session = buildQuizSession('fr-es', emptyProgress);
    const ids = session.questions.map(q => q.wordId);
    expect(new Set(ids).size).toBe(10);
  });

  it('fr-es mode: targetWord is french, correctAnswer is the target word', () => {
    const session = buildQuizSession('fr-es', emptyProgress);
    for (const q of session.questions) {
      const word = VOCABULARY.find(w => w.id === q.wordId)!;
      expect(q.targetWord).toBe(word.french);
      expect(q.correctAnswer).toBe(word.target);
    }
  });

  it('es-fr mode: targetWord is the target word, correctAnswer is french', () => {
    const session = buildQuizSession('es-fr', emptyProgress);
    for (const q of session.questions) {
      const word = VOCABULARY.find(w => w.id === q.wordId)!;
      expect(q.targetWord).toBe(word.target);
      expect(q.correctAnswer).toBe(word.french);
    }
  });

  it('usedWordIds matches question wordIds', () => {
    const session = buildQuizSession('fr-es', emptyProgress);
    const questionIds = session.questions.map(q => q.wordId).sort();
    expect([...session.usedWordIds].sort()).toEqual(questionIds);
  });
});

describe('isSessionComplete', () => {
  it('returns false when currentIndex < questions.length', () => {
    const session = buildQuizSession('fr-es', emptyProgress);
    expect(isSessionComplete(session)).toBe(false);
  });

  it('returns true when currentIndex equals questions.length', () => {
    const session = buildQuizSession('fr-es', emptyProgress);
    const done = { ...session, currentIndex: session.questions.length };
    expect(isSessionComplete(done)).toBe(true);
  });
});

describe('getCurrentQuestion', () => {
  it('returns the current question', () => {
    const session = buildQuizSession('fr-es', emptyProgress);
    expect(getCurrentQuestion(session)).toBe(session.questions[0]);
  });

  it('returns null when session is complete', () => {
    const session = buildQuizSession('fr-es', emptyProgress);
    const done = { ...session, currentIndex: session.questions.length };
    expect(getCurrentQuestion(done)).toBeNull();
  });
});

describe('buildSessionPayload', () => {
  const answered = (answers: (boolean | null)[]): QuizSession => ({
    id: 'session-1',
    ...buildQuizSession('es-fr', emptyProgress),
    answers,
  });

  it('pairs each question with its answer, in quiz order', () => {
    const answers = [true, false, true, true, false, true, true, true, false, true];
    const session = answered(answers);
    const payload = buildSessionPayload(session)!;

    expect(payload.id).toBe('session-1');
    expect(payload.mode).toBe('es-fr');
    expect(payload.answers).toEqual(
      session.questions.map((q, i) => ({
        wordId: q.wordId,
        category: q.category,
        level: q.level,
        isCorrect: answers[i],
      })),
    );
  });

  it('returns null while a question is unanswered', () => {
    const answers = [...new Array(9).fill(true), null];
    expect(buildSessionPayload(answered(answers))).toBeNull();
  });
});

describe('Indonesian modes', () => {
  const idWords = getVocabulary('id');
  const idFrench = new Set(idWords.map(w => w.french));
  const idTargets = new Set(idWords.map(w => w.target));

  it('fr-id draws the words and the distractors from the Indonesian vocabulary only', () => {
    const session = buildQuizSession('fr-id', emptyProgress);
    for (const q of session.questions) {
      expect(q.wordId.startsWith('id-')).toBe(true);
      const word = getWordById(q.wordId)!;
      expect(q.targetWord).toBe(word.french);
      expect(q.correctAnswer).toBe(word.target);
      for (const option of q.options) expect(idTargets.has(option)).toBe(true);
    }
  });

  it('id-fr shows the Indonesian word and offers French answers of Indonesian words', () => {
    const session = buildQuizSession('id-fr', emptyProgress);
    for (const q of session.questions) {
      const word = getWordById(q.wordId)!;
      expect(q.targetWord).toBe(word.target);
      expect(q.correctAnswer).toBe(word.french);
      for (const option of q.options) expect(idFrench.has(option)).toBe(true);
    }
  });

  it('a Spanish mode never draws an Indonesian word', () => {
    const session = buildQuizSession('es-fr', emptyProgress);
    expect(session.questions.every(q => q.wordId.startsWith('es-'))).toBe(true);
  });

  it('keeps the Indonesian mode in the backend payload', () => {
    const built = buildQuizSession('id-fr', emptyProgress);
    const session: QuizSession = { id: 'sid', ...built, answers: built.answers.map(() => true) };
    const payload = buildSessionPayload(session)!;
    expect(payload.mode).toBe('id-fr');
    expect(payload.answers.every(a => a.wordId.startsWith('id-'))).toBe(true);
  });
});
