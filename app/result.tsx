import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Button } from '../components/ui/Button';
import { Colors, Radius, Shadow, Spacing, Typography } from '../constants/theme';
import { useQuizSession } from '../hooks/useQuizSession';

// ─── Motivational messages by score ──────────────────────────────────────────
function getResultMessage(score: number, total: number): { emoji: string; title: string; sub: string } {
  const pct = score / total;
  if (pct === 1)    return { emoji: '🏆', title: 'Parfait !',        sub: 'Score parfait. Tu maîtrises ces mots !' };
  if (pct >= 0.8)   return { emoji: '🌟', title: 'Excellent !',      sub: 'Presque la perfection. Continue ainsi !' };
  if (pct >= 0.6)   return { emoji: '👍', title: 'Bien joué !',      sub: 'Bonne progression. Encore un effort !' };
  if (pct >= 0.4)   return { emoji: '💪', title: 'Pas mal !',        sub: 'Tu progresses. Rejoue pour consolider !' };
  return             { emoji: '📚', title: 'Continue !',             sub: 'La pratique mène à la maîtrise.' };
}

export default function ResultScreen() {
  const router = useRouter();
  const { session, replay, goHome } = useQuizSession();

  // Animation values
  const cardScale = useSharedValue(0.8);
  const cardOpacity = useSharedValue(0);
  const buttonsOpacity = useSharedValue(0);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  const buttonsStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
  }));

  useEffect(() => {
    if (!session) {
      router.replace('/');
      return;
    }
    // Entrance animations
    cardScale.value = withSpring(1, { damping: 14, stiffness: 200 });
    cardOpacity.value = withTiming(1, { duration: 300 });
    buttonsOpacity.value = withDelay(400, withTiming(1, { duration: 300 }));
  }, [session]);

  if (!session) return null;

  const { score, questions, mode } = session;
  const total = questions.length;
  const result = getResultMessage(score, total);

  const modeLabel = mode === 'fr-es' ? 'Français → Espagnol' : 'Espagnol → Français';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Result card */}
        <Animated.View style={[styles.card, cardStyle]}>
          <Text style={styles.emoji}>{result.emoji}</Text>
          <Text style={styles.title}>{result.title}</Text>
          <Text style={styles.sub}>{result.sub}</Text>

          {/* Score display */}
          <View style={styles.scoreBig}>
            <Text style={styles.scoreNumber}>{score}</Text>
            <Text style={styles.scoreTotal}>/{total}</Text>
          </View>

          {/* Mode tag */}
          <View style={styles.modeTag}>
            <Text style={styles.modeLabel}>{modeLabel}</Text>
          </View>
        </Animated.View>

        {/* Answer breakdown (dots) */}
        <Animated.View style={[styles.dots, buttonsStyle]}>
          {session.answers.map((correct, i) => (
            <View
              key={i}
              style={[
                styles.dot,
                correct === true && styles.dotCorrect,
                correct === false && styles.dotWrong,
              ]}
            />
          ))}
        </Animated.View>

        {/* Actions */}
        <Animated.View style={[styles.actions, buttonsStyle]}>
          <Button label="Rejouer" onPress={replay} />
          <Button label="Changer de mode" onPress={goHome} variant="secondary" />
        </Animated.View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl,
    justifyContent: 'center',
    gap: Spacing.xl,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadow.card,
    borderWidth: 1,
    borderColor: Colors.borderLight,
  },
  emoji: {
    fontSize: 56,
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  sub: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  scoreBig: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: Spacing.md,
  },
  scoreNumber: {
    fontSize: 72,
    fontWeight: Typography.weights.extrabold,
    color: Colors.primary,
    lineHeight: 80,
    letterSpacing: -2,
  },
  scoreTotal: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textTertiary,
    paddingBottom: 12,
    marginLeft: 4,
  },
  modeTag: {
    backgroundColor: Colors.borderLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  modeLabel: {
    fontSize: Typography.sizes.xs,
    color: Colors.textTertiary,
    fontWeight: Typography.weights.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.border,
  },
  dotCorrect: {
    backgroundColor: Colors.success,
  },
  dotWrong: {
    backgroundColor: Colors.error,
  },
  actions: {
    gap: Spacing.sm,
  },
});
