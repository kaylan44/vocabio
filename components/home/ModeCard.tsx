import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Colors, ControlSize, Radius, Spacing, Typography } from '../../constants/theme';
import { QuizMode } from '../../types';
import { Flag, FlagCountry } from '../ui/Flag';

interface ModeCardProps {
  mode: QuizMode;
  onPress: (mode: QuizMode) => void;
  // Roomier tile for tablet / web widths.
  large?: boolean;
}

interface ModeConfig {
  from: FlagCountry;
  to: FlagCountry;
  fromLabel: string;
  toLabel: string;
  accessibilityLabel: string;
  // Each mode has its own tint: tile background + matching button colour.
  tint: string;
  accent: string;
}

const MODE_CONFIG: Record<QuizMode, ModeConfig> = {
  'fr-es': {
    from: 'fr',
    to: 'es',
    fromLabel: 'Du français',
    toLabel: "vers l'espagnol",
    accessibilityLabel: 'Quiz français vers espagnol',
    tint: Colors.primaryLight,
    accent: Colors.primary,
  },
  'es-fr': {
    from: 'es',
    to: 'fr',
    fromLabel: "De l'espagnol",
    toLabel: 'vers le français',
    accessibilityLabel: 'Quiz espagnol vers français',
    tint: Colors.accentLight,
    accent: Colors.accent,
  },
};

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const ModeCard: React.FC<ModeCardProps> = ({ mode, onPress, large = false }) => {
  const scale = useSharedValue(1);
  const config = MODE_CONFIG[mode];
  const flagHeight = large ? ControlSize.flag : ControlSize.flagMedium;

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      onPress={() => onPress(mode)}
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 15 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
      activeOpacity={1}
      style={[styles.touchable, animatedStyle]}
      accessibilityRole="button"
      accessibilityLabel={config.accessibilityLabel}
    >
      <View style={[styles.tile, large && styles.tileLarge, { backgroundColor: config.tint }]}>
        {/* Flag pair: source language in front, target language behind */}
        <View style={[styles.flagPair, large && styles.flagPairLarge]}>
          <View style={styles.flagBack}>
            <Flag country={config.to} height={flagHeight} />
          </View>
          {/* The ring in the tile colour separates the two flags */}
          <View style={[styles.flagFront, { backgroundColor: config.tint }]}>
            <Flag country={config.from} height={flagHeight} />
          </View>
        </View>

        <View>
          <Text style={[styles.fromLabel, large && styles.fromLabelLarge]}>{config.fromLabel}</Text>
          <Text style={[styles.toLabel, large && styles.toLabelLarge]}>{config.toLabel}</Text>
        </View>

        <View style={[styles.cta, large && styles.ctaLarge, { backgroundColor: config.accent }]}>
          <Text style={[styles.ctaText, large && styles.ctaTextLarge]}>Jouer</Text>
        </View>
      </View>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  touchable: {
    flex: 1,
  },
  tile: {
    flex: 1,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    paddingTop: Spacing.lg,
    gap: Spacing.md,
  },
  tileLarge: {
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  flagPair: {
    width: ControlSize.flagPairWidth,
    height: ControlSize.flagPairHeight,
  },
  flagPairLarge: {
    width: ControlSize.flagPairLargeWidth,
    height: ControlSize.flagPairLargeHeight,
  },
  fromLabelLarge: {
    fontSize: Typography.sizes.md,
  },
  toLabelLarge: {
    fontSize: Typography.sizes.xl,
  },
  ctaLarge: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + Spacing.xs,
  },
  ctaTextLarge: {
    fontSize: Typography.sizes.md,
  },
  flagBack: {
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
  flagFront: {
    position: 'absolute',
    left: -ControlSize.flagRing,
    top: -ControlSize.flagRing,
    padding: ControlSize.flagRing,
    borderRadius: Radius.sm,
  },
  fromLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  toLabel: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  cta: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  ctaText: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.textOnPrimary,
  },
});
