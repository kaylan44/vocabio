import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { StatsCard } from '../components/account/StatsCard';
import { getWordById } from '../data/vocabulary';
import type { QuizStats } from '../types';

const EMPTY: QuizStats = {
  totalSessions: 0,
  totalAnswers: 0,
  totalCorrect: 0,
  accuracy: null,
  lastSessionAt: null,
  byMode: [],
  byCategory: [],
  byLevel: [],
  mostMissedWords: [],
};

const STATS: QuizStats = {
  totalSessions: 12,
  totalAnswers: 120,
  totalCorrect: 93,
  accuracy: 0.775,
  lastSessionAt: '2026-10-01T10:00:00.000Z',
  byMode: [{ mode: 'fr-es', sessions: 7, answers: 70, correct: 55, accuracy: 0.786 }],
  byCategory: [{ category: 'pronoun', answers: 40, correct: 33, accuracy: 0.825 }],
  byLevel: [{ level: 'A1', answers: 80, correct: 70, accuracy: 0.875 }],
  mostMissedWords: [
    { wordId: 'v042', wrong: 4 },
    { wordId: 'zzz999', wrong: 3 },
    { wordId: 'n001', wrong: 1 },
  ],
};

describe('StatsCard', () => {
  it('shows a spinner and no numbers while the first load is running', async () => {
    await render(<StatsCard stats={null} status="loading" onRetry={jest.fn()} />);
    expect(screen.getByText('Statistiques')).toBeTruthy();
    expect(screen.queryByText('Quiz terminés')).toBeNull();
    expect(screen.queryByText('Réessayer')).toBeNull();
  });

  it('offers a retry when the first load failed', async () => {
    const onRetry = jest.fn();
    await render(<StatsCard stats={null} status="error" onRetry={onRetry} />);
    fireEvent.press(screen.getByText('Réessayer'));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('shows the empty state when no quiz was finished', async () => {
    await render(<StatsCard stats={EMPTY} status="ready" onRetry={jest.fn()} />);
    expect(screen.getByText(/Termine un quiz/)).toBeTruthy();
    expect(screen.queryByText('Quiz terminés')).toBeNull();
  });

  it('shows totals and the accuracy breakdowns', async () => {
    await render(<StatsCard stats={STATS} status="ready" onRetry={jest.fn()} />);
    expect(screen.getByText('12')).toBeTruthy();
    expect(screen.getByText('78 %')).toBeTruthy();
    expect(screen.getByText('Français → Espagnol')).toBeTruthy();
    expect(screen.getByText('55/70')).toBeTruthy();
    expect(screen.getByText('79 %')).toBeTruthy();
    expect(screen.getByText('Pronoms')).toBeTruthy();
    expect(screen.getByText('83 %')).toBeTruthy();
    expect(screen.getByText('A1')).toBeTruthy();
    expect(screen.getByText('88 %')).toBeTruthy();
  });

  it('resolves missed words from the vocabulary and skips unknown ids', async () => {
    await render(<StatsCard stats={STATS} status="ready" onRetry={jest.fn()} />);
    const verb = getWordById('v042')!;
    const noun = getWordById('n001')!;
    expect(screen.getByText(`${verb.french} · ${verb.spanish}`)).toBeTruthy();
    expect(screen.getByText('4 erreurs')).toBeTruthy();
    expect(screen.getByText(`${noun.french} · ${noun.spanish}`)).toBeTruthy();
    expect(screen.getByText('1 erreur')).toBeTruthy();
    expect(screen.queryByText('3 erreurs')).toBeNull();
  });

  it('keeps the previous numbers when a refresh fails', async () => {
    await render(<StatsCard stats={STATS} status="error" onRetry={jest.fn()} />);
    expect(screen.getByText('12')).toBeTruthy();
    expect(screen.queryByText('Réessayer')).toBeNull();
  });
});
