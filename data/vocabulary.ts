import { GrammarCategory, Language, VocabWord } from '../types';
import ES_ADJECTIVE from './es/adjectives';
import ES_ADVERB from './es/adverbs';
import ES_EXPRESSION from './es/expressions';
import ES_NOUN from './es/nouns';
import ES_PRONOUN from './es/pronouns';
import ES_VERB from './es/verbs';
import ID_ADJECTIVE from './id/adjectives';
import ID_ADVERB from './id/adverbs';
import ID_EXPRESSION from './id/expressions';
import ID_NOUN from './id/nouns';
import ID_NUMBER from './id/numbers';
import ID_PRONOUN from './id/pronouns';
import ID_VERB from './id/verbs';

// ─── Vocabulary dataset ───────────────────────────────────────────────────────
// One folder per language (data/es/…), one file per grammatical category.
// Word ids carry their language as a prefix ('es-n001'), so they are unique across languages.

const VOCABULARY_BY_LANGUAGE: Record<Language, VocabWord[]> = {
  es: [
    ...ES_NOUN,
    ...ES_VERB,
    ...ES_ADJECTIVE,
    ...ES_ADVERB,
    ...ES_EXPRESSION,
    ...ES_PRONOUN,
  ],
  id: [
    ...ID_NOUN,
    ...ID_VERB,
    ...ID_ADJECTIVE,
    ...ID_ADVERB,
    ...ID_NUMBER,
    ...ID_EXPRESSION,
    ...ID_PRONOUN,
  ],
};

// Every language together: lookups by id only (ids are unique across languages).
export const VOCABULARY: VocabWord[] = Object.values(VOCABULARY_BY_LANGUAGE).flat();

export const getVocabulary = (lang: Language): VocabWord[] => VOCABULARY_BY_LANGUAGE[lang];

export const getWordsByCategory = (lang: Language, category: GrammarCategory): VocabWord[] =>
  getVocabulary(lang).filter((w) => w.category === category);

const CATEGORY_ORDER: GrammarCategory[] = [
  'noun', 'verb', 'adjective', 'adverb', 'number', 'expression', 'pronoun',
];

/** Categories that have words in this language, in a fixed display order. */
export const getCategories = (lang: Language): GrammarCategory[] => {
  const present = new Set(getVocabulary(lang).map((w) => w.category));
  return CATEGORY_ORDER.filter((c) => present.has(c));
};

export const getWordById = (id: string): VocabWord | undefined =>
  VOCABULARY.find((w) => w.id === id);
