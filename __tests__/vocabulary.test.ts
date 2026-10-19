import { VOCABULARY, getVocabulary, getWordById } from '../data/vocabulary';

describe('vocabulary dataset', () => {
  it('prefixes every Spanish id with es-, followed by the category letter and 3 digits', () => {
    const bad = getVocabulary('es').filter((w) => !/^es-[nvadep]\d{3}$/.test(w.id));
    expect(bad).toEqual([]);
  });

  it('never uses the same id twice', () => {
    const ids = VOCABULARY.map((w) => w.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('finds a word by its prefixed id only', () => {
    expect(getWordById('es-n001')?.target).toBe('casa');
    expect(getWordById('n001')).toBeUndefined();
  });
});
