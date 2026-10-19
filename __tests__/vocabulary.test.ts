import { VOCABULARY, getCategories, getVocabulary, getWordById } from '../data/vocabulary';
import { LANGUAGE_LIST } from '../constants/languages';
import type { Language } from '../types';

// Language prefix, then the category letter (c = number), then 3 digits.
const ID_FORMAT = /^(es|id)-([nvadepc])(\d{3})$/;

describe('vocabulary dataset', () => {
  it('prefixes every Spanish id with es-, followed by the category letter and 3 digits', () => {
    const bad = getVocabulary('es').filter((w) => !/^es-[nvadep]\d{3}$/.test(w.id));
    expect(bad).toEqual([]);
  });

  it('prefixes every Indonesian id with id-, followed by the category letter and 3 digits', () => {
    const bad = getVocabulary('id').filter((w) => !/^id-[nvadpce]\d{3}$/.test(w.id));
    expect(bad).toEqual([]);
  });

  it('never uses the same id twice', () => {
    const ids = VOCABULARY.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(LANGUAGE_LIST)('numbers the ids of %s with no gaps, per category letter', (lang: Language) => {
    const numbers: Record<string, number[]> = {};
    for (const w of getVocabulary(lang)) {
      const [, , letter, digits] = ID_FORMAT.exec(w.id)!;
      (numbers[letter] ??= []).push(Number(digits));
    }
    for (const list of Object.values(numbers)) {
      const sorted = [...list].sort((a, b) => a - b);
      expect(sorted).toEqual(sorted.map((_, i) => i + 1));
    }
  });

  it('finds a word by its prefixed id only', () => {
    expect(getWordById('es-n001')?.target).toBe('casa');
    expect(getWordById('id-n001')?.target).toBe('rumah');
    expect(getWordById('n001')).toBeUndefined();
  });

  it('keeps each language to its own words', () => {
    expect(getVocabulary('es').every((w) => w.id.startsWith('es-'))).toBe(true);
    expect(getVocabulary('id').every((w) => w.id.startsWith('id-'))).toBe(true);
  });

  it('lists only the categories a language has words in', () => {
    expect(getCategories('es')).not.toContain('number');
    expect(getCategories('id')).toContain('number');
    expect(getCategories('es')).toContain('adverb');
  });
});

describe('Indonesian dataset', () => {
  const words = getVocabulary('id');

  // The quiz draws distractors from the same category: two entries with the same text
  // would give two correct answers.
  it.each(['french', 'target'] as const)('has unique %s texts within each category', (field) => {
    const seen = new Set<string>();
    const duplicates = words.filter((w) => {
      const key = `${w.category}|${w[field]}`;
      if (seen.has(key)) return true;
      seen.add(key);
      return false;
    });
    expect(duplicates).toEqual([]);
  });

  it('points every oppositeId to an existing Indonesian adjective', () => {
    const withOpposite = words.filter((w) => w.oppositeId);
    expect(withOpposite.length).toBeGreaterThan(0);
    for (const word of withOpposite) {
      const opposite = getWordById(word.oppositeId!);
      expect(opposite?.category).toBe('adjective');
      expect(opposite?.id.startsWith('id-')).toBe(true);
      expect(opposite?.id).not.toBe(word.id);
    }
  });
});
