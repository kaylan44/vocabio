import { computeMastery } from '../store/progressStore';
import { useProgressStore } from '../store/progressStore';
import { act } from '@testing-library/react-hooks';

// ─── computeMastery unit tests ────────────────────────────────────────────────

describe('computeMastery', () => {
  it('returns "new" when totalSeen is 0', () => {
    expect(computeMastery(0, 0)).toBe('new');
  });

  it('returns "seen" after first answer', () => {
    expect(computeMastery(1, 1)).toBe('seen');
    expect(computeMastery(0, 1)).toBe('seen');
  });

  it('returns "mastered" after 3 consecutive correct answers', () => {
    expect(computeMastery(3, 3)).toBe('mastered');
  });

  it('returns "mastered" for streak >= 3', () => {
    expect(computeMastery(5, 5)).toBe('mastered');
  });

  it('streak of 2 is still "seen"', () => {
    expect(computeMastery(2, 3)).toBe('seen');
  });
});

// ─── recordAnswer integration tests ──────────────────────────────────────────

describe('progressStore.recordAnswer', () => {
  beforeEach(() => {
    useProgressStore.getState().resetProgress();
  });

  it('increments totalSeen after each answer', () => {
    useProgressStore.getState().recordAnswer('n001', 'fr-es', true);
    const p = useProgressStore.getState().getWordModeProgress('n001', 'fr-es');
    expect(p?.totalSeen).toBe(1);
  });

  it('increments totalCorrect only on correct answer', () => {
    useProgressStore.getState().recordAnswer('n001', 'fr-es', true);
    useProgressStore.getState().recordAnswer('n001', 'fr-es', false);
    const p = useProgressStore.getState().getWordModeProgress('n001', 'fr-es');
    expect(p?.totalCorrect).toBe(1);
    expect(p?.totalSeen).toBe(2);
  });

  it('resets streak after a wrong answer', () => {
    useProgressStore.getState().recordAnswer('n001', 'fr-es', true);
    useProgressStore.getState().recordAnswer('n001', 'fr-es', true);
    useProgressStore.getState().recordAnswer('n001', 'fr-es', false);
    const p = useProgressStore.getState().getWordModeProgress('n001', 'fr-es');
    expect(p?.correctStreak).toBe(0);
    expect(p?.mastery).toBe('seen');
  });

  it('reaches mastered after 3 correct in a row', () => {
    useProgressStore.getState().recordAnswer('n001', 'fr-es', true);
    useProgressStore.getState().recordAnswer('n001', 'fr-es', true);
    useProgressStore.getState().recordAnswer('n001', 'fr-es', true);
    const p = useProgressStore.getState().getWordModeProgress('n001', 'fr-es');
    expect(p?.mastery).toBe('mastered');
  });

  it('fr-es and es-fr progress are independent', () => {
    useProgressStore.getState().recordAnswer('n001', 'fr-es', true);
    useProgressStore.getState().recordAnswer('n001', 'fr-es', true);
    useProgressStore.getState().recordAnswer('n001', 'fr-es', true);
    const frEs = useProgressStore.getState().getWordModeProgress('n001', 'fr-es');
    const esF = useProgressStore.getState().getWordModeProgress('n001', 'es-fr');
    expect(frEs?.mastery).toBe('mastered');
    // es-fr is initialized to defaults but never answered, so mastery stays 'new'
    expect(esF?.mastery).toBe('new');
    expect(esF?.totalSeen).toBe(0);
  });

  it('getModeProgressMap includes only words present in progress', () => {
    useProgressStore.getState().recordAnswer('n001', 'fr-es', true);
    useProgressStore.getState().recordAnswer('n002', 'es-fr', true);
    const frEsMap = useProgressStore.getState().getModeProgressMap('fr-es');
    // n001 was recorded fr-es → has actual progress
    expect(frEsMap['n001']?.totalSeen).toBe(1);
    // n002 was only recorded es-fr → frEs is default (totalSeen 0)
    expect(frEsMap['n002']?.totalSeen).toBe(0);
    // word never seen at all → not in map
    expect(frEsMap['n999']).toBeUndefined();
  });
});
