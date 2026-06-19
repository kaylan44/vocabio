import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { WordCard } from '../components/quiz/WordCard';

describe('WordCard', () => {
  it('renders the word', async () => {
    await render(<WordCard word="maison" category="noun" language="fr" level="A1" />);
    expect(screen.getByText('maison')).toBeTruthy();
  });

  it('shows "Nom" for noun category', async () => {
    await render(<WordCard word="maison" category="noun" language="fr" level="A1" />);
    expect(screen.getByText('Nom')).toBeTruthy();
  });

  it('shows the level badge', async () => {
    await render(<WordCard word="maison" category="noun" language="fr" level="A1" />);
    expect(screen.getByText('A1')).toBeTruthy();
  });

  it('shows French flag for fr language', async () => {
    await render(<WordCard word="maison" category="noun" language="fr" level="A1" />);
    expect(screen.getByText(/Français/)).toBeTruthy();
  });

  it('shows Spanish flag for es language', async () => {
    await render(<WordCard word="casa" category="noun" language="es" level="A1" />);
    expect(screen.getByText(/Espagnol/)).toBeTruthy();
  });

  it('renders each category label correctly', async () => {
    const cases: Array<[import('../types').GrammarCategory, string]> = [
      ['verb', 'Verbe'],
      ['adjective', 'Adjectif'],
      ['adverb', 'Adverbe'],
      ['expression', 'Expression'],
      ['pronoun', 'Pronom'],
    ];
    for (const [category, label] of cases) {
      const { unmount } = await render(
        <WordCard word="test" category={category} language="fr" level="A1" />
      );
      expect(screen.getByText(label)).toBeTruthy();
      await unmount();
    }
  });
});
