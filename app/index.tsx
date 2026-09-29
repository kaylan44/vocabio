import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Image,
  LayoutChangeEvent,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { ModeCard } from '../components/home/ModeCard';
import { Button } from '../components/ui/Button';
import { Colors, ControlSize, Radius, Spacing, Typography } from '../constants/theme';
import { CounterBadge } from '../components/ui/CounterBadge';
import { useAuth } from '../hooks/useAuth';
import { useUnreadTotal } from '../hooks/useConversations';
import { useQuizSession } from '../hooks/useQuizSession';
import { QuizMode } from '../types';

const logoImage = require('../assets/vocabio-logo.png');

export default function HomeScreen() {
  const router = useRouter();
  const { start } = useQuizSession();
  const { isAuthenticated } = useAuth();
  const unreadTotal = useUnreadTotal();

  // Top bar sits outside the ScrollView so it can't be pulled down,
  // and slides out of view as the user scrolls down (back in on scroll up).
  const [topBarHeight, setTopBarHeight] = useState(0);
  const topBarHeightSv = useSharedValue(0);
  const topBarOffset = useSharedValue(0);
  const lastScrollY = useSharedValue(0);

  const handleTopBarLayout = (e: LayoutChangeEvent) => {
    const { height } = e.nativeEvent.layout;
    topBarHeightSv.value = height;
    setTopBarHeight(height);
  };

  const scrollHandler = useAnimatedScrollHandler(e => {
    const y = Math.max(0, e.contentOffset.y);
    const next = topBarOffset.value + (y - lastScrollY.value);
    topBarOffset.value = Math.min(Math.max(next, 0), topBarHeightSv.value);
    lastScrollY.value = y;
  });

  const topBarStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: -topBarOffset.value }],
  }));

  const handleModeSelect = (mode: QuizMode) => {
    start(mode);
  };

  const handleOpenVocab = () => {
    router.push('/vocab');
  };

  const handleMessagesPress = () => {
    router.push('/messages' as never);
  };

  const handleAccountPress = () => {
    router.push((isAuthenticated ? '/account' : '/login') as never);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Animated.ScrollView
          contentContainerStyle={[styles.scroll, { paddingTop: topBarHeight + Spacing.sm }]}
          showsVerticalScrollIndicator={false}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          bounces={false}
          overScrollMode="never"
        >
          <Text style={styles.tagline}>Apprenez l'espagnol, une session à la fois.</Text>

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
              icon="book-outline"
              onPress={handleOpenVocab}
            />
          </View>
        </Animated.ScrollView>

        {/* Top bar */}
        <Animated.View style={[styles.topBar, topBarStyle]} onLayout={handleTopBarLayout}>
          <View style={styles.logoContainer}>
            <Image source={logoImage} style={styles.logoIcon} />
            <Text style={styles.logoText}>
              <Text style={styles.logoV}>V</Text>ocabio
            </Text>
          </View>
          <View style={styles.headerActions}>
            {isAuthenticated ? (
              <TouchableOpacity onPress={handleMessagesPress} style={styles.iconButton} accessibilityLabel="Messages">
                <Ionicons name="paper-plane-outline" size={ControlSize.headerIcon} color={Colors.textPrimary} />
                <View style={styles.unreadBadge}>
                  <CounterBadge count={unreadTotal} />
                </View>
              </TouchableOpacity>
            ) : null}
            {isAuthenticated ? (
              <TouchableOpacity onPress={handleAccountPress} style={styles.iconButton} accessibilityLabel="Mon compte">
                <Ionicons name="settings-outline" size={ControlSize.headerIcon} color={Colors.textPrimary} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleAccountPress} style={styles.loginButton} accessibilityLabel="Se connecter">
                <Text style={styles.loginButtonText}>Se connecter</Text>
              </TouchableOpacity>
            )}
          </View>
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
    overflow: 'hidden',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.xl,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.sm,
    backgroundColor: Colors.background,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  unreadBadge: {
    position: 'absolute',
    top: -Spacing.xs,
    right: -Spacing.xs,
  },
  iconButton: {
    width: ControlSize.headerIconButton,
    height: ControlSize.headerIconButton,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  loginButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  loginButtonText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
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
});
