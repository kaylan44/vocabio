import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Radius, Shadow, Spacing, Typography } from '../../constants/theme';
import { getWordById } from '../../data/vocabulary';
import type { GrammarCategory, LoadStatus, QuizMode, QuizStats } from '../../types';

interface StatsCardProps {
  stats: QuizStats | null;
  status: LoadStatus;
  onRetry: () => void;
}

const MODE_LABELS: Record<QuizMode, string> = {
  'fr-es': 'Français → Espagnol',
  'es-fr': 'Espagnol → Français',
};

const CATEGORY_LABELS: Record<GrammarCategory, string> = {
  noun: 'Noms',
  verb: 'Verbes',
  adjective: 'Adjectifs',
  adverb: 'Adverbes',
  expression: 'Expressions',
  pronoun: 'Pronoms',
};

function formatAccuracy(accuracy: number | null): string {
  return accuracy === null ? '—' : `${Math.round(accuracy * 100)} %`;
}

function Headline({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.headline}>
      <Text style={styles.headlineValue}>{value}</Text>
      <Text style={styles.headlineLabel}>{label}</Text>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Row({ label, detail, value }: { label: string; detail?: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel} numberOfLines={1}>{label}</Text>
      {detail ? <Text style={styles.rowDetail}>{detail}</Text> : null}
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

function StatsBody({ stats }: { stats: QuizStats }) {
  if (stats.totalSessions === 0) {
    return <Text style={styles.message}>Termine un quiz pour voir tes statistiques ici.</Text>;
  }

  // A word may have been removed from the local vocabulary since it was missed.
  const missedWords = stats.mostMissedWords.flatMap(({ wordId, wrong }) => {
    const word = getWordById(wordId);
    return word ? [{ word, wrong }] : [];
  });

  return (
    <>
      <View style={styles.headlines}>
        <Headline value={String(stats.totalSessions)} label="Quiz terminés" />
        <Headline value={formatAccuracy(stats.accuracy)} label="Bonnes réponses" />
      </View>

      <Section title="Par sens">
        {stats.byMode.map(m => (
          <Row
            key={m.mode}
            label={MODE_LABELS[m.mode] ?? m.mode}
            detail={`${m.correct}/${m.answers}`}
            value={formatAccuracy(m.accuracy)}
          />
        ))}
      </Section>

      <Section title="Par catégorie">
        {stats.byCategory.map(c => (
          <Row
            key={c.category}
            label={CATEGORY_LABELS[c.category] ?? c.category}
            detail={`${c.correct}/${c.answers}`}
            value={formatAccuracy(c.accuracy)}
          />
        ))}
      </Section>

      <Section title="Par niveau">
        {stats.byLevel.map(l => (
          <Row
            key={l.level}
            label={l.level}
            detail={`${l.correct}/${l.answers}`}
            value={formatAccuracy(l.accuracy)}
          />
        ))}
      </Section>

      {missedWords.length > 0 && (
        <Section title="Mots les plus ratés">
          {missedWords.map(({ word, wrong }) => (
            <Row
              key={word.id}
              label={`${word.french} · ${word.spanish}`}
              value={`${wrong} ${wrong > 1 ? 'erreurs' : 'erreur'}`}
            />
          ))}
        </Section>
      )}
    </>
  );
}

export const StatsCard: React.FC<StatsCardProps> = ({ stats, status, onRetry }) => {
  let body: React.ReactNode;

  if (stats) {
    // Keep showing the previous numbers while a refresh is in flight or has failed.
    body = <StatsBody stats={stats} />;
  } else if (status === 'error') {
    body = (
      <View style={styles.centered}>
        <Text style={styles.message}>Impossible de charger les statistiques.</Text>
        <TouchableOpacity onPress={onRetry} accessibilityRole="button">
          <Text style={styles.retry}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  } else {
    body = (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Statistiques</Text>
      {body}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadow.card,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  centered: {
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  message: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  retry: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
  },
  headlines: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  headline: {
    flex: 1,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    gap: Spacing.xs,
  },
  headlineValue: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.extrabold,
    color: Colors.primary,
  },
  headlineLabel: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
  },
  section: {
    gap: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.semibold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rowLabel: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    color: Colors.textPrimary,
    fontWeight: Typography.weights.medium,
  },
  rowDetail: {
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
  },
  rowValue: {
    fontSize: Typography.sizes.sm,
    color: Colors.textPrimary,
    fontWeight: Typography.weights.semibold,
    textAlign: 'right',
  },
});
