import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Shadow, Spacing, Typography } from '../../constants/theme';
import { GrammarCategory, WordLevel } from '../../types';

const CATEGORY_LABELS: Record<GrammarCategory, string> = {
  noun: 'Nom',
  verb: 'Verbe',
  adjective: 'Adjectif',
  adverb: 'Adverbe',
  expression: 'Expression',
  pronoun: 'Pronom',
};

interface WordCardProps {
  word: string;
  category: GrammarCategory;
  language: 'fr' | 'es';
  level: WordLevel;
}

export const WordCard: React.FC<WordCardProps> = ({ word, category, language, level }) => (
  <View style={styles.container}>
    <Text style={styles.languageHint}>
      {language === 'fr' ? '🇫🇷' : '🇪🇸'} {language === 'fr' ? 'Français' : 'Espagnol'}
    </Text>
    <Text style={styles.word}>{word}</Text>
    <View style={styles.badgeRow}>
      <View style={styles.categoryBadge}>
        <Text style={styles.categoryText}>{CATEGORY_LABELS[category]}</Text>
      </View>
      <View style={styles.levelBadge}>
        <Text style={styles.levelText}>{level}</Text>
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadow.card,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  languageHint: {
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
    marginBottom: Spacing.sm,
    fontWeight: Typography.weights.medium,
  },
  word: {
    fontSize: Typography.sizes.display,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: Spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: Spacing.xs,
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: Colors.borderLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: 99,
  },
  categoryText: {
    fontSize: Typography.sizes.xs,
    color: Colors.textTertiary,
    fontWeight: Typography.weights.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  levelBadge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: 99,
  },
  levelText: {
    fontSize: Typography.sizes.xs,
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
    letterSpacing: 0.8,
  },
});
