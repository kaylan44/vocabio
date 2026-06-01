import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import {
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Colors, Radius, Shadow, Spacing, Typography } from '../constants/theme';
import { getWordsByCategory } from '../data/vocabulary';
import { GrammarCategory, VocabWord } from '../types';

const CATEGORY_OPTIONS: { key: GrammarCategory; label: string }[] = [
  { key: 'noun', label: 'Noms' },
  { key: 'verb', label: 'Verbes' },
  { key: 'adjective', label: 'Adjectifs' },
  { key: 'adverb', label: 'Adverbes' },
  { key: 'expression', label: 'Expressions' },
  { key: 'pronoun', label: 'Pronoms' },
];

const renderWord = ({ item }: { item: VocabWord }) => (
  <View style={styles.wordRow}>
    <View style={styles.wordCell}>
      <Text style={styles.wordFrench}>{item.french}</Text>
    </View>
    <Text style={styles.wordSpanish}>{item.spanish}</Text>
  </View>
);

export default function VocabularyScreen() {
  const router = useRouter();
  const [category, setCategory] = useState<GrammarCategory>('noun');

  const words = useMemo(() => getWordsByCategory(category), [category]);

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

      <View style={styles.categoryBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
          style={styles.categoryScrollView}
        >
          {CATEGORY_OPTIONS.map((option) => {
            const isActive = option.key === category;
            return (
              <TouchableOpacity
                key={option.key}
                onPress={() => setCategory(option.key)}
                style={[styles.categoryButton, isActive && styles.categoryButtonActive]}
              >
                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>{option.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>{CATEGORY_OPTIONS.find((option) => option.key === category)?.label}</Text>
        <Text style={styles.listCount}>{words.length} mots</Text>
      </View>

      <View style={styles.flagsRow}>
        <Text style={styles.flag}>🇫🇷</Text>
        <Text style={styles.flag}>🇪🇸</Text>
      </View>

      <FlatList
        data={words}
        keyExtractor={(item) => item.id}
        renderItem={renderWord}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    gap: Spacing.md,
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
  categoryBar: {
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.md,
  },
  categoryScrollView: {
    width: '100%',
  },
  categoryScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingRight: Spacing.lg,
  },
  categoryButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderLight,
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
  flagsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  flag: {
    fontSize: 30,
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
  wordCell: {
    flex: 1,
    paddingRight: Spacing.sm,
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
    minWidth: 100,
  },
});
