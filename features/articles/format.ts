// Labels for the articles UI (French locale).

import type { ArticleLevel, ArticleLevelFilter } from '../../types';

export const LEVEL_LABELS: Record<ArticleLevel, string> = {
  easy: 'Facile',
  intermediate: 'Intermédiaire',
};

export const LEVEL_FILTER_LABELS: Record<ArticleLevelFilter, string> = {
  all: 'Tous',
  ...LEVEL_LABELS,
};

/** "3:52" — position and length in the audio player. */
export function formatClock(seconds: number): string {
  const total = Number.isFinite(seconds) && seconds > 0 ? Math.floor(seconds) : 0;
  const minutes = Math.floor(total / 60);
  return `${minutes}:${String(total % 60).padStart(2, '0')}`;
}

/** "4 min" — listening time on a card. Never "0 min": a 20-second audio is "1 min". */
export function formatListenTime(seconds: number): string {
  return `${Math.max(1, Math.round(seconds / 60))} min`;
}

/** "3 octobre" this year, "3 octobre 2025" otherwise. */
export function formatArticleDate(iso: string, now: Date = new Date()): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    ...(date.getFullYear() === now.getFullYear() ? {} : { year: 'numeric' }),
  });
}

// Display names of the article sources. An unknown source falls back to its raw key.
const SOURCE_LABELS: Record<string, string> = {
  holaquepasa: 'Hola Qué Pasa',
};

export function formatSource(source: string): string {
  return SOURCE_LABELS[source] ?? source;
}
