// Pure helpers for the articles feature: no React, no network.

import type { ArticleBlock, ArticleLevelFilter, ArticleSummary, GlossPosition } from '../../types';

/**
 * Appends a page to the list, skipping articles already present.
 * A new article published between two "load more" requests shifts every offset by one:
 * without the dedupe, the last article of the previous page would appear twice.
 */
export function mergeArticles(existing: ArticleSummary[], incoming: ArticleSummary[]): ArticleSummary[] {
  const known = new Set(existing.map(article => article.id));
  return [...existing, ...incoming.filter(article => !known.has(article.id))];
}

/** A full page means there may be more; a short one is the end of the list. */
export function hasMorePages(receivedCount: number, pageSize: number): boolean {
  return receivedCount >= pageSize;
}

/** 'all' is an app-only value: the API takes no `level` parameter at all in that case. */
export function levelParam(filter: ArticleLevelFilter): string {
  return filter === 'all' ? '' : `&level=${filter}`;
}

export function blockText(block: ArticleBlock): string {
  return block.segments.map(segment => segment.text).join('');
}

/** Tapping the open gloss closes it, tapping another one moves the selection. */
export function toggleGloss(current: GlossPosition | null, tapped: GlossPosition): GlossPosition | null {
  return current && current.block === tapped.block && current.segment === tapped.segment ? null : tapped;
}

/** Position inside the track (0..1) for a playback time, safe when the duration is unknown. */
export function playbackProgress(currentTime: number, duration: number): number {
  if (!Number.isFinite(duration) || duration <= 0 || !Number.isFinite(currentTime)) return 0;
  return Math.min(1, Math.max(0, currentTime / duration));
}

/**
 * Playback time for a tap at `x` on a track `width` wide, or null when it cannot be
 * computed (bar not measured, unknown duration, no usable coordinate). The caller must
 * not seek on null: a media element throws when given a non-finite time.
 */
export function seekTarget(x: number, width: number, duration: number): number | null {
  if (!Number.isFinite(x) || !Number.isFinite(width) || width <= 0) return null;
  if (!Number.isFinite(duration) || duration <= 0) return null;
  return Math.min(duration, Math.max(0, (x / width) * duration));
}
