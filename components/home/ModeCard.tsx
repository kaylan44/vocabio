import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Colors, Radius, Shadow, Spacing, Typography } from '../../constants/theme';
import { QuizMode } from '../../types';

interface ModeCardProps {
  mode: QuizMode;
  onPress: (mode: QuizMode) => void;
}

const MODE_CONFIG = {
  'fr-es': {
    from: '🇫🇷',
    to: '🇪🇸',
    description: "Apprends le français",
  },
  'es-fr': {
    from: '🇪🇸',
    to: '🇫🇷',
    description: "Apprends l'espagnol",
  },
};

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const ModeCard: React.FC<ModeCardProps> = ({ mode, onPress }) => {
  const scale = useSharedValue(1);
  const config = MODE_CONFIG[mode];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      onPress={() => onPress(mode)}
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 15 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
      activeOpacity={1}
      style={[animatedStyle]}
    >
      <View style={styles.card}>
        {/* Flag row */}
        <View style={styles.flagRow}>
          <Text style={styles.flag}>{config.from}</Text>
          <View style={styles.arrowContainer}>
            <Text style={styles.arrow}>→</Text>
          </View>
          <Text style={styles.flag}>{config.to}</Text>
        </View>

        {/* Description */}
        <Text style={styles.description}>{config.description}</Text>

        {/* CTA */}
        <View style={styles.cta}>
          <Text style={styles.ctaText}>Commencer →</Text>
        </View>
      </View>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    borderWidth: 1.5,
    borderColor: Colors.borderLight,
    ...Shadow.card,
    gap: Spacing.sm,
  },
  flagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xs,
  },
  flag: {
    fontSize: 36,
  },
  arrowContainer: {
    flex: 1,
    alignItems: 'center',
  },
  arrow: {
    fontSize: Typography.sizes.lg,
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  description: {
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
    fontWeight: Typography.weights.semibold,
    marginTop: Spacing.xs,
  },
  cta: {
    marginTop: Spacing.sm,
  },
  ctaText: {
    fontSize: Typography.sizes.sm,
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
  },
});
