import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, Radius, Shadow, Spacing, Typography } from '../../constants/theme';
import { GrammarCategory } from '../../types';

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
}

export const WordCard: React.FC<WordCardProps> = ({ word, category, language }) => (
  <View style={styles.container}>
    <Text style={styles.languageHint}>
      {language === 'fr' ? '🇫🇷' : '🇪🇸'} {language === 'fr' ? 'Français' : 'Espagnol'}
    </Text>
    <Text style={styles.word}>{word}</Text>
    <View style={styles.categoryBadge}>
      <Text style={styles.categoryText}>{CATEGORY_LABELS[category]}</Text>
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
});
