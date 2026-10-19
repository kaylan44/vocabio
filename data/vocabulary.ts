import { Language, VocabWord } from '../types';
import ES_ADJECTIVE from './es/adjectives';
import ES_ADVERB from './es/adverbs';
import ES_EXPRESSION from './es/expressions';
import ES_NOUN from './es/nouns';
import ES_PRONOUN from './es/pronouns';
import ES_VERB from './es/verbs';

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
};

// Every language together: lookups by id only (ids are unique across languages).
export const VOCABULARY: VocabWord[] = Object.values(VOCABULARY_BY_LANGUAGE).flat();

export const getVocabulary = (lang: Language): VocabWord[] => VOCABULARY_BY_LANGUAGE[lang];

export const getWordsByCategory = (category: VocabWord['category']): VocabWord[] =>
  VOCABULARY.filter((w) => w.category === category);

export const getWordById = (id: string): VocabWord | undefined =>
  VOCABULARY.find((w) => w.id === id);
