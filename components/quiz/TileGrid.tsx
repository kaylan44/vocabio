import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AnswerTile } from './AnswerTile';
import { QuizMode, TileState } from '../../types';
import { Spacing } from '../../constants/theme';
import { VOCABULARY } from '../../data/vocabulary';

interface TileGridProps {
  options: string[];
  selectedAnswer: string | null;
  correctAnswer: string;
  hasAnswered: boolean;
  onSelect: (answer: string) => void;
  mode: QuizMode;
}

function getWrongAnswerHint(option: string, mode: QuizMode): string | undefined {
  // option is a translation — find the word and return the reverse translation
  const word = mode === 'fr-es'
    ? VOCABULARY.find(w => w.spanish === option)
    : VOCABULARY.find(w => w.french === option);
  if (!word) return undefined;
  return mode === 'fr-es' ? word.french : word.spanish;
}

export const TileGrid: React.FC<TileGridProps> = ({
  options,
  selectedAnswer,
  correctAnswer,
  hasAnswered,
  onSelect,
  mode,
}) => {
  const getTileState = (option: string): TileState => {
    if (!hasAnswered) return 'idle';

    if (option === correctAnswer) {
      // Always reveal correct answer after response
      return selectedAnswer === option ? 'selected-correct' : 'revealed-correct';
    }

    if (option === selectedAnswer) return 'selected-wrong';

    return 'disabled';
  };

  // Split into 2 rows of 2
  const rows = [options.slice(0, 2), options.slice(2, 4)];

  return (
    <View style={styles.grid}>
      {rows.map((row, rowIdx) => (
        <View key={rowIdx} style={styles.row}>
          {row.map((option) => (
            <AnswerTile
              key={option}
              label={option}
              state={getTileState(option)}
              onPress={() => onSelect(option)}
              hint={option === selectedAnswer && option !== correctAnswer ? getWrongAnswerHint(option, mode) : undefined}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    gap: Spacing.sm,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'stretch',
  },
});
