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
import { Button } from '../components/ui/Button';
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
      <Text style={styles.wordLevel}>{item.level}</Text>
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
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Vocabulaire</Text>
          <Text style={styles.subtitle}>Consultez les mots par catégorie.</Text>
        </View>
        <Button label="Retour" variant="ghost" onPress={() => router.push('/')} />
      </View>

      <View style={styles.categoryBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
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
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
  },
  subtitle: {
    marginTop: Spacing.xs,
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
  },
  categoryBar: {
    paddingLeft: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  categoryScroll: {
    gap: Spacing.sm,
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
  wordLevel: {
    marginTop: Spacing.xs,
    fontSize: Typography.sizes.xs,
    color: Colors.textTertiary,
  },
  wordSpanish: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.primary,
    textAlign: 'right',
    minWidth: 100,
  },
});
