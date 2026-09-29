import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { Colors, ControlSize, Radius, Shadow, Spacing, Typography } from '../../constants/theme';
import { QuizMode } from '../../types';
import { Flag, FlagCountry } from '../ui/Flag';

interface ModeCardProps {
  mode: QuizMode;
  onPress: (mode: QuizMode) => void;
}

const MODE_CONFIG: Record<QuizMode, { from: FlagCountry; to: FlagCountry; description: string }> = {
  'fr-es': {
    from: 'fr',
    to: 'es',
    description: "Français vers Espagnol",
  },
  'es-fr': {
    from: 'es',
    to: 'fr',
    description: "Espagnol vers Français",
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
          <Flag country={config.from} />
          <View style={styles.arrowContainer}>
            <Ionicons name="arrow-forward" size={ControlSize.buttonIcon} color={Colors.primary} />
          </View>
          <Flag country={config.to} />
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
  arrowContainer: {
    flex: 1,
    alignItems: 'center',
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
