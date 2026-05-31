import { VocabWord } from '../types';
import ADJECTIVE from './adjectives';
import ADVERB from './adverbs';
import EXPRESSION from './expressions';
import NOUN from './nouns';
import PRONOUN from './pronouns';
import VERB from './verbs';

// ─── Mock vocabulary dataset ──────────────────────────────────────────────────
// The vocabulary list is split by grammatical category for maintainability.

export const VOCABULARY: VocabWord[] = [
  ...NOUN,
  ...VERB,
  ...ADJECTIVE,
  ...ADVERB,
  ...EXPRESSION,
  ...PRONOUN,
];

export const getWordsByCategory = (category: VocabWord['category']): VocabWord[] =>
  VOCABULARY.filter((w) => w.category === category);

export const getWordById = (id: string): VocabWord | undefined =>
  VOCABULARY.find((w) => w.id === id);
