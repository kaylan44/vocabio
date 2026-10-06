import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Colors, ControlSize, Radius, Spacing, Typography } from '../../constants/theme';

export type HomeLinkIllustration = 'article' | 'vocab';

// Illustrations are drawn in assets/illustrations/*.svg and exported as 3x PNG.
const ILLUSTRATIONS: Record<HomeLinkIllustration, ImageSourcePropType> = {
  article: require('../../assets/illustrations/article.png'),
  vocab: require('../../assets/illustrations/vocab.png'),
};

// Both illustrations share the same 72:64 canvas.
const ASPECT_RATIO = 72 / 64;

interface HomeLinkRowProps {
  illustration: HomeLinkIllustration;
  title: string;
  subtitle: string;
  onPress: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const HomeLinkRow: React.FC<HomeLinkRowProps> = ({ illustration, title, subtitle, onPress }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 15 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
      activeOpacity={1}
      style={[styles.row, animatedStyle]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <Image source={ILLUSTRATIONS[illustration]} style={styles.illustration} />
      <View style={styles.texts}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={ControlSize.buttonIcon} color={Colors.textSecondary} />
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  illustration: {
    height: ControlSize.rowIllustration,
    width: ControlSize.rowIllustration * ASPECT_RATIO,
    resizeMode: 'contain',
  },
  texts: {
    flex: 1,
    gap: Spacing.xs,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
});
