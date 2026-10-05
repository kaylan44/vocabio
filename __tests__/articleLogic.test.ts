import {
  blockText,
  hasMorePages,
  levelParam,
  mergeArticles,
  playbackProgress,
  seekTarget,
  toggleGloss,
} from '../features/articles/articleLogic';
import {
  formatArticleDate,
  formatClock,
  formatListenTime,
  formatSource,
} from '../features/articles/format';
import type { ArticleSummary } from '../types';

const article = (id: string): ArticleSummary => ({
  id,
  source: 'holaquepasa',
  lang: 'es',
  level: 'easy',
  title: `Artículo ${id}`,
  excerpt: 'Texto.',
  url: 'https://holaquepasa.com/a/',
  publishedAt: '2026-10-03T12:00:00.000Z',
  audioDurationSec: 232,
  hasAudio: true,
});

describe('articleLogic', () => {
  describe('mergeArticles', () => {
    it('appends the new page after the articles already shown', () => {
      const merged = mergeArticles([article('a'), article('b')], [article('c')]);
      expect(merged.map(a => a.id)).toEqual(['a', 'b', 'c']);
    });

    it('drops an article that is already in the list', () => {
      // A new article was published between two pages: 'b' is sent again.
      const merged = mergeArticles([article('a'), article('b')], [article('b'), article('c')]);
      expect(merged.map(a => a.id)).toEqual(['a', 'b', 'c']);
    });

    it('does not modify the list it was given', () => {
      const existing = [article('a')];
      mergeArticles(existing, [article('b')]);
      expect(existing).toHaveLength(1);
    });
  });

  it('hasMorePages is true only for a full page', () => {
    expect(hasMorePages(20, 20)).toBe(true);
    expect(hasMorePages(19, 20)).toBe(false);
    expect(hasMorePages(0, 20)).toBe(false);
  });

  it('levelParam sends no level for "all"', () => {
    expect(levelParam('all')).toBe('');
    expect(levelParam('easy')).toBe('&level=easy');
    expect(levelParam('intermediate')).toBe('&level=intermediate');
  });

  it('blockText joins the segments without adding anything', () => {
    const block = {
      type: 'paragraph' as const,
      segments: [{ text: 'Vive en ' }, { text: 'una casa', gloss: 'a house' }, { text: '.' }],
    };
    expect(blockText(block)).toBe('Vive en una casa.');
  });

  describe('toggleGloss', () => {
    const first = { block: 0, segment: 1 };

    it('opens a gloss when none is open', () => {
      expect(toggleGloss(null, first)).toEqual(first);
    });

    it('closes the gloss that is tapped again', () => {
      expect(toggleGloss(first, { block: 0, segment: 1 })).toBeNull();
    });

    it('moves to another gloss, including the same segment index in another paragraph', () => {
      expect(toggleGloss(first, { block: 0, segment: 3 })).toEqual({ block: 0, segment: 3 });
      expect(toggleGloss(first, { block: 2, segment: 1 })).toEqual({ block: 2, segment: 1 });
    });
  });

  describe('playbackProgress', () => {
    it('is the played fraction of the track', () => {
      expect(playbackProgress(58, 232)).toBe(0.25);
    });

    it('stays between 0 and 1', () => {
      expect(playbackProgress(-3, 232)).toBe(0);
      expect(playbackProgress(500, 232)).toBe(1);
    });

    it('is 0 while the duration is unknown', () => {
      expect(playbackProgress(10, 0)).toBe(0);
      expect(playbackProgress(10, NaN)).toBe(0);
      expect(playbackProgress(NaN, 232)).toBe(0);
    });
  });

  describe('seekTarget', () => {
    it('maps a tap on the bar to a time', () => {
      expect(seekTarget(150, 300, 200)).toBe(100);
    });

    it('stays inside the track', () => {
      expect(seekTarget(-10, 300, 200)).toBe(0);
      expect(seekTarget(999, 300, 200)).toBe(200);
    });

    it('is 0 before the bar is measured or the duration is known', () => {
      expect(seekTarget(150, 0, 200)).toBe(0);
      expect(seekTarget(150, 300, 0)).toBe(0);
    });
  });
});

describe('article formats', () => {
  it('formatClock pads the seconds and floors partial ones', () => {
    expect(formatClock(232)).toBe('3:52');
    expect(formatClock(5.9)).toBe('0:05');
    expect(formatClock(600)).toBe('10:00');
  });

  it('formatClock shows 0:00 for a missing or invalid time', () => {
    expect(formatClock(0)).toBe('0:00');
    expect(formatClock(-4)).toBe('0:00');
    expect(formatClock(NaN)).toBe('0:00');
  });

  it('formatListenTime rounds to minutes and never shows 0', () => {
    expect(formatListenTime(232)).toBe('4 min');
    expect(formatListenTime(345)).toBe('6 min');
    expect(formatListenTime(20)).toBe('1 min');
  });

  it('formatArticleDate hides the year only for the current year', () => {
    const now = new Date('2026-10-05T12:00:00.000Z');
    expect(formatArticleDate('2026-10-03T12:00:00.000Z', now)).toBe('3 octobre');
    expect(formatArticleDate('2025-12-24T12:00:00.000Z', now)).toBe('24 décembre 2025');
  });

  it('formatArticleDate returns an empty label for an unreadable date', () => {
    expect(formatArticleDate('not a date')).toBe('');
  });

  it('formatSource names known sources and falls back to the raw key', () => {
    expect(formatSource('holaquepasa')).toBe('Hola Qué Pasa');
    expect(formatSource('other')).toBe('other');
  });
});
