import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Spacing, Typography } from '../../constants/theme';
import { LEVEL_LABELS } from '../../features/articles/format';
import type { ArticleLevel } from '../../types';

interface LevelBadgeProps {
  level: ArticleLevel | null;
}

// One tint per level, like the mode tiles on Home.
const LEVEL_COLORS: Record<ArticleLevel, { background: string; text: string }> = {
  easy: { background: Colors.successLight, text: Colors.successDark },
  intermediate: { background: Colors.accentLight, text: Colors.accentDark },
};

/** Level pill of an article. Renders nothing when the source gave no level. */
export const LevelBadge: React.FC<LevelBadgeProps> = ({ level }) => {
  if (!level) return null;

  const colors = LEVEL_COLORS[level];
  return (
    <View style={[styles.pill, { backgroundColor: colors.background }]}>
      <Text style={[styles.label, { color: colors.text }]}>{LEVEL_LABELS[level]}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  label: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
});
