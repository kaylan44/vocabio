import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { TileGrid } from '../components/quiz/TileGrid';
import { WordCard } from '../components/quiz/WordCard';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Colors, Radius, Spacing, Typography } from '../constants/theme';
import { useQuizSession } from '../hooks/useQuizSession';

export default function QuizScreen() {
  const router = useRouter();
  const {
    session,
    currentQuestion,
    currentIndex,
    totalQuestions,
    score,
    selectedAnswer,
    hasAnswered,
    selectAnswer,
    nextQuestion,
    goHome,
  } = useQuizSession();

  // Guard: if no session, go back home
  useEffect(() => {
    if (!session) {
      router.replace('/');
    }
  }, [session]);

  if (!session || !currentQuestion) return null;

  const questionLanguage = session.mode === 'fr-es' ? 'fr' : 'es';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>

        {/* Top bar: back + score */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={goHome} style={styles.backBtn}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>

          <View style={styles.scoreChip}>
            <Text style={styles.scoreText}>Score </Text>
            <Text style={styles.scoreValue}>{score}</Text>
          </View>
        </View>

        {/* Progress */}
        <View style={styles.progressSection}>
          <ProgressBar current={currentIndex} total={totalQuestions} />
          <Text style={styles.progressLabel}>
            {currentIndex + 1} / {totalQuestions}
          </Text>
        </View>

        {/* Spacer */}
        <View style={styles.content}>

          {/* Word to translate */}
          <View style={styles.wordSection}>
            <Text style={styles.instruction}>Comment dit-on…</Text>
            <WordCard
              word={currentQuestion.targetWord}
              category={currentQuestion.category}
              language={questionLanguage}
              level={currentQuestion.level}
            />
          </View>

          {/* Answer tiles */}
          <TileGrid
            options={currentQuestion.options}
            selectedAnswer={selectedAnswer}
            correctAnswer={currentQuestion.correctAnswer}
            hasAnswered={hasAnswered}
            onSelect={selectAnswer}
            mode={session.mode}
          />

        </View>

        {/* Next button */}
        <View style={styles.footer}>
          <Button
            label={currentIndex >= totalQuestions - 1 ? 'Voir les résultats' : 'Suivant →'}
            onPress={nextQuestion}
            disabled={!hasAnswered}
          />
        </View>

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
    paddingTop: Spacing.md,
    paddingBottom: Spacing.lg,
    gap: Spacing.md,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  scoreChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
  },
  scoreText: {
    fontSize: Typography.sizes.lg,
    color: Colors.primary,
    fontWeight: Typography.weights.medium,
  },
  scoreValue: {
    fontSize: Typography.sizes.lg,
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  progressSection: {
    gap: Spacing.xs,
  },
  progressLabel: {
    fontSize: Typography.sizes.md,
    color: Colors.textTertiary,
    textAlign: 'right',
    fontWeight: Typography.weights.bold,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    gap: Spacing.md,
  },
  wordSection: {
    gap: Spacing.sm,
  },
  instruction: {
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
    fontWeight: Typography.weights.medium,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  footer: {
    paddingTop: Spacing.sm,
  },
});
