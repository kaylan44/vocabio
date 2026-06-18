import { useRouter } from 'expo-router';
import { useCallback, useMemo } from 'react';
import {
  SectionList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, Radius, Shadow, Spacing, Typography } from '../constants/theme';
import { getWordsByCategory } from '../data/vocabulary';
import { useQuizSession } from '../hooks/useQuizSession';
import { GrammarCategory, VocabWord, WordLevel } from '../types';
import { useState } from 'react';

const CATEGORY_OPTIONS: { key: GrammarCategory; label: string }[] = [
  { key: 'noun', label: 'Noms' },
  { key: 'verb', label: 'Verbes' },
  { key: 'adjective', label: 'Adjectifs' },
  { key: 'adverb', label: 'Adverbes' },
  { key: 'expression', label: 'Expressions' },
  { key: 'pronoun', label: 'Pronoms' },
];

const LEVEL_ORDER: WordLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

function getCombinedBadgeColor(totalCorrect: number, totalSeen: number): string {
  if (totalSeen === 0) return Colors.textTertiary;
  const ratio = totalCorrect / totalSeen;
  if (ratio >= 2 / 3) return Colors.success;
  if (ratio >= 1 / 3) return Colors.textSecondary;
  return Colors.error;
}

export default function VocabularyScreen() {
  const router = useRouter();
  const [category, setCategory] = useState<GrammarCategory>('noun');
  const { getWordCombinedProgress } = useQuizSession();

  const sections = useMemo(() => {
    const words = getWordsByCategory(category);
    const grouped: Record<string, VocabWord[]> = {};
    for (const level of LEVEL_ORDER) {
      grouped[level] = [];
    }
    for (const word of words) {
      if (grouped[word.level]) {
        grouped[word.level].push(word);
      }
    }
    return LEVEL_ORDER
      .filter((level) => grouped[level].length > 0)
      .map((level) => ({
        title: level,
        data: grouped[level].sort((a, b) => a.french.localeCompare(b.french)),
      }));
  }, [category]);

  const renderItem = useCallback(({ item }: { item: VocabWord }) => {
    const combined = getWordCombinedProgress(item.id);
    const showCounter = combined.totalSeen > 0;
    return (
      <View style={styles.wordRow}>
        <View style={styles.wordCellLeft}>
          <Text style={styles.wordFrench}>{item.french}</Text>
        </View>
        <View style={styles.counterCell}>
          {showCounter && (
            <Text style={[styles.counterText, { color: getCombinedBadgeColor(combined.totalCorrect, combined.totalSeen) }]}>
              {combined.totalCorrect}/{combined.totalSeen}
            </Text>
          )}
          {combined.isMastered && <Text style={styles.medalIcon}>🏅</Text>}
        </View>
        <View style={styles.wordCellRight}>
          <Text style={styles.wordSpanish}>{item.spanish}</Text>
        </View>
      </View>
    );
  }, [getWordCombinedProgress]);

  const renderSectionHeader = useCallback(({ section }: { section: { title: string } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
    </View>
  ), []);

  const totalWords = sections.reduce((sum, s) => sum + s.data.length, 0);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>
            <Text style={styles.titleV}>V</Text>ocabulaire
          </Text>
          <Text style={styles.subtitle}>Consultez les mots par catégorie.</Text>
        </View>
      </View>

      {/* Category grid 2×3 */}
      <View style={styles.categoryGrid}>
        {CATEGORY_OPTIONS.map((option) => {
          const isActive = option.key === category;
          return (
            <TouchableOpacity
              key={option.key}
              onPress={() => setCategory(option.key)}
              style={[styles.categoryButton, isActive && styles.categoryButtonActive]}
            >
              <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>
          {CATEGORY_OPTIONS.find((o) => o.key === category)?.label}
        </Text>
        <Text style={styles.listCount}>{totalWords} mots</Text>
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.md,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
    marginLeft: Spacing.lg,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
  },
  titleV: {
    color: Colors.success,
    fontWeight: Typography.weights.extrabold,
  },
  subtitle: {
    marginTop: Spacing.xs,
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backIcon: {
    fontSize: Typography.sizes.lg,
    color: Colors.textPrimary,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  categoryButton: {
    width: '30.5%',
    paddingVertical: Spacing.sm,
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  categoryText: {
    color: Colors.textPrimary,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
  },
  categoryTextActive: {
    color: Colors.textOnPrimary,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  listTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  listCount: {
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
    fontWeight: Typography.weights.medium,
  },
  sectionHeader: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
    backgroundColor: Colors.borderLight,
    borderRadius: Radius.sm,
    alignSelf: 'flex-start',
  },
  sectionTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
    color: Colors.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.sm,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    ...Shadow.card,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  wordCellLeft: {
    flex: 1,
  },
  counterCell: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    width: 72,
  },
  counterText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
  },
  wordCellRight: {
    flex: 1,
    alignItems: 'flex-end',
  },
  medalIcon: {
    fontSize: 15,
  },
  wordFrench: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  wordSpanish: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.primary,
    textAlign: 'right',
  },
});
