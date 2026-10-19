import { Language, QuizMode } from '../types';

// ─── Languages ────────────────────────────────────────────────────────────────
// Behaviour and copy of each language being learnt. Screens and components read this
// config instead of testing a language or a mode in their code.

export interface LanguageConfig {
  label: string;         // "Espagnol" — titles, mode labels
  tagline: string;       // Home, under the logo
  fromLabel: string;     // Mode tile, target → French: "De l'espagnol"
  toLabel: string;       // Mode tile, French → target: "vers l'espagnol"
  modes: QuizMode[];     // French → target first, then target → French
  hasArticles: boolean;  // The articles are in Spanish only
}

export const LANGUAGES: Record<Language, LanguageConfig> = {
  es: {
    label: 'Espagnol',
    tagline: "Apprends l'espagnol, une session à la fois.",
    fromLabel: "De l'espagnol",
    toLabel: "vers l'espagnol",
    modes: ['fr-es', 'es-fr'],
    hasArticles: true,
  },
  id: {
    label: 'Indonésien',
    tagline: "Apprends l'indonésien, une session à la fois.",
    fromLabel: "De l'indonésien",
    toLabel: "vers l'indonésien",
    modes: ['fr-id', 'id-fr'],
    hasArticles: false,
  },
};

// Order of the cards on the language screen.
export const LANGUAGE_LIST: Language[] = ['es', 'id'];

export function isLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (LANGUAGE_LIST as string[]).includes(value);
}

// ─── Quiz modes ───────────────────────────────────────────────────────────────

interface ModeConfig {
  language: Language;
  fromFrench: boolean;  // true: the French word is shown, the answer is in the target language
}

export const MODES: Record<QuizMode, ModeConfig> = {
  'fr-es': { language: 'es', fromFrench: true },
  'es-fr': { language: 'es', fromFrench: false },
  'fr-id': { language: 'id', fromFrench: true },
  'id-fr': { language: 'id', fromFrench: false },
};

/** "Français → Espagnol" / "Espagnol → Français" */
export function getModeLabel(mode: QuizMode): string {
  const { language, fromFrench } = MODES[mode];
  const label = LANGUAGES[language].label;
  return fromFrench ? `Français → ${label}` : `${label} → Français`;
}
