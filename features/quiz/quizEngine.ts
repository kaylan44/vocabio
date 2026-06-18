import { VOCABULARY, getWordsByCategory } from '../../data/vocabulary';
import { QuizMode, QuizQuestion, QuizSession, VocabWord, WordModeProgress } from '../../types';
import { QUIZ_CONFIG } from '../../constants/theme';

// ─── Word selection ───────────────────────────────────────────────────────────

/**
 * Weight a word for selection based on its progress.
 * - New words: highest weight (prioritized)
 * - Seen words: normal
 * - Mastered words: low weight (still appear but rarely)
 */
function getWordWeight(progress: WordModeProgress | undefined): number {
  if (!progress) return 10;  // New word — high priority
  if (progress.mastery === 'mastered') return 1;
  if (progress.mastery === 'seen') return 5;
  return 10;
}

/**
 * Weighted random selection without replacement.
 * Returns `count` distinct words.
 */
export function selectWeightedWords(
  words: VocabWord[],
  count: number,
  progressMap: Record<string, WordModeProgress | undefined>
): VocabWord[] {
  const available = [...words];
  const selected: VocabWord[] = [];

  while (selected.length < count && available.length > 0) {
    const weights = available.map(w => getWordWeight(progressMap[w.id]));
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let rand = Math.random() * totalWeight;

    let idx = 0;
    for (let i = 0; i < weights.length; i++) {
      rand -= weights[i];
      if (rand <= 0) { idx = i; break; }
    }

    selected.push(available[idx]);
    available.splice(idx, 1);
  }

  return selected;
}

// ─── Distractor generation ────────────────────────────────────────────────────

/**
 * Build 3 plausible wrong answers from the same grammatical category.
 * Ensures no duplicate with the correct answer.
 */
function buildDistractors(
  correctWord: VocabWord,
  mode: QuizMode,
  excludeIds: string[]
): string[] {
  const sameCategory = getWordsByCategory(correctWord.category).filter(
    w => w.id !== correctWord.id && !excludeIds.includes(w.id)
  );

  // Shuffle and take 3
  const shuffled = [...sameCategory].sort(() => Math.random() - 0.5);
  const picked = shuffled.slice(0, 3);

  return picked.map(w => (mode === 'fr-es' ? w.spanish : w.french));
}

// ─── Question builder ─────────────────────────────────────────────────────────

function buildQuestion(word: VocabWord, mode: QuizMode): QuizQuestion {
  const targetWord = mode === 'fr-es' ? word.french : word.spanish;
  const correctAnswer = mode === 'fr-es' ? word.spanish : word.french;

  const distractors = buildDistractors(word, mode, []);

  // Merge and shuffle options
  const options = [correctAnswer, ...distractors].sort(() => Math.random() - 0.5);

  return {
    wordId: word.id,
    targetWord,
    correctAnswer,
    options,
    category: word.category,
    level: word.level,
  };
}

// ─── Session builder ──────────────────────────────────────────────────────────

/**
 * Build a full quiz session.
 * @param mode          Direction of translation
 * @param progressMap   Current progress per word (for mode)
 */
export function buildQuizSession(
  mode: QuizMode,
  progressMap: Record<string, WordModeProgress | undefined>
): QuizSession {
  const count = QUIZ_CONFIG.questionsPerSession;

  // Select words with weighted probability
  const selectedWords = selectWeightedWords(VOCABULARY, count, progressMap);

  const questions = selectedWords.map(w => buildQuestion(w, mode));

  return {
    mode,
    questions,
    currentIndex: 0,
    score: 0,
    answers: new Array(count).fill(null),
    usedWordIds: selectedWords.map(w => w.id),
  };
}

// ─── Session helpers ──────────────────────────────────────────────────────────

export function isSessionComplete(session: QuizSession): boolean {
  return session.currentIndex >= session.questions.length;
}

export function getCurrentQuestion(session: QuizSession): QuizQuestion | null {
  if (isSessionComplete(session)) return null;
  return session.questions[session.currentIndex];
}
