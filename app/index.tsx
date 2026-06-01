import { useRouter } from 'expo-router';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ModeCard } from '../components/home/ModeCard';
import { Button } from '../components/ui/Button';
import { Colors, Spacing, Typography } from '../constants/theme';
import { useQuizSession } from '../hooks/useQuizSession';
import { QuizMode } from '../types';

const logoImage = require('../assets/vocabio-logo.png');

export default function HomeScreen() {
  const router = useRouter();
  const { start } = useQuizSession();

  const handleModeSelect = (mode: QuizMode) => {
    start(mode);
  };

  const handleOpenVocab = () => {
    router.push('/vocab');
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image source={logoImage} style={styles.logoIcon} />
            <Text style={styles.logoText}>
              <Text style={styles.logoV}>V</Text>ocabio
            </Text>
          </View>
          <Text style={styles.tagline}>Apprenez l'espagnol, une session à la fois.</Text>
        </View>

        {/* Mode selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choisissez un mode</Text>
          <View style={styles.cards}>
            <ModeCard mode="fr-es" onPress={handleModeSelect} />
            <ModeCard mode="es-fr" onPress={handleModeSelect} />
          </View>
        </View>

        {/* Vocabulary access */}
        <View style={styles.vocabSection}>
          <Text style={styles.sectionTitle}>Parcourir le vocabulaire</Text>
          <Button
            label="Voir le vocabulaire"
            variant="secondary"
            onPress={handleOpenVocab}
          />
        </View>

        {/* Footer hint */}
        <Text style={styles.hint}>10 questions · ~5 minutes</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.xl,
  },
  header: {
    gap: Spacing.sm,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoIcon: {
    width: 50,
    height: 50,
    resizeMode: 'contain',
  },
  logoText: {
    fontSize: Typography.sizes.display,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  logoV: {
    color: Colors.success,
    fontWeight: Typography.weights.extrabold,
  },
  tagline: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.regular,
    lineHeight: 22,
  },
  section: {
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  cards: {
    gap: Spacing.md,
  },
  vocabSection: {
    gap: Spacing.sm,
  },
  hint: {
    textAlign: 'center',
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
    fontWeight: Typography.weights.medium,
  },
});
