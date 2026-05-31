import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AnswerTile } from './AnswerTile';
import { TileState } from '../../types';
import { Spacing } from '../../constants/theme';

interface TileGridProps {
  options: string[];
  selectedAnswer: string | null;
  correctAnswer: string;
  hasAnswered: boolean;
  onSelect: (answer: string) => void;
}

export const TileGrid: React.FC<TileGridProps> = ({
  options,
  selectedAnswer,
  correctAnswer,
  hasAnswered,
  onSelect,
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
  },
  row: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
});
