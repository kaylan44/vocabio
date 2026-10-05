import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../../constants/theme';
import { LEVEL_FILTER_LABELS } from '../../features/articles/format';
import type { ArticleLevelFilter } from '../../types';

interface LevelFilterProps {
  value: ArticleLevelFilter;
  onChange: (level: ArticleLevelFilter) => void;
}

const OPTIONS: ArticleLevelFilter[] = ['all', 'easy', 'intermediate'];

/** Level pills above the article list. */
export const LevelFilter: React.FC<LevelFilterProps> = ({ value, onChange }) => (
  <View style={styles.row} accessibilityRole="tablist">
    {OPTIONS.map(option => {
      const selected = option === value;
      return (
        <TouchableOpacity
          key={option}
          onPress={() => onChange(option)}
          activeOpacity={0.8}
          accessibilityRole="tab"
          accessibilityState={{ selected }}
          style={[styles.pill, selected && styles.pillSelected]}
        >
          <Text style={[styles.label, selected && styles.labelSelected]}>
            {LEVEL_FILTER_LABELS[option]}
          </Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  label: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textSecondary,
  },
  labelSelected: {
    color: Colors.textOnPrimary,
  },
});
