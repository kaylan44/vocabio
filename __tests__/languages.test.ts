import { LANGUAGES, LANGUAGE_LIST, MODES, getModeLabel, isLanguage } from '../constants/languages';
import type { QuizMode } from '../types';

describe('language config', () => {
  it('recognises only the languages being learnt', () => {
    expect(isLanguage('es')).toBe(true);
    expect(isLanguage('id')).toBe(true);
    expect(isLanguage('fr')).toBe(false);
    expect(isLanguage(undefined)).toBe(false);
    expect(isLanguage(['es'])).toBe(false);
  });

  it('gives each language its two modes, French → target first', () => {
    for (const lang of LANGUAGE_LIST) {
      const [toTarget, fromTarget] = LANGUAGES[lang].modes;
      expect(MODES[toTarget]).toEqual({ language: lang, fromFrench: true });
      expect(MODES[fromTarget]).toEqual({ language: lang, fromFrench: false });
    }
  });

  it('keeps the articles to Spanish', () => {
    expect(LANGUAGES.es.hasArticles).toBe(true);
    expect(LANGUAGES.id.hasArticles).toBe(false);
  });

  it.each<[QuizMode, string]>([
    ['fr-es', 'Français → Espagnol'],
    ['es-fr', 'Espagnol → Français'],
    ['fr-id', 'Français → Indonésien'],
    ['id-fr', 'Indonésien → Français'],
  ])('labels %s as "%s"', (mode, label) => {
    expect(getModeLabel(mode)).toBe(label);
  });
});
