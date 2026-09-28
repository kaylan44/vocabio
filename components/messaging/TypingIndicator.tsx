import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Colors, Radius, Spacing, Typography } from '../../constants/theme';

const DOT_SIZE = Spacing.sm;
const BOUNCE_MS = 300;

function Dot({ delay }: { delay: number }) {
  const offset = useSharedValue(0);

  useEffect(() => {
    offset.value = withDelay(
      delay,
      withRepeat(withSequence(withTiming(-DOT_SIZE / 2, { duration: BOUNCE_MS }), withTiming(0, { duration: BOUNCE_MS })), -1),
    );
  }, []);

  const style = useAnimatedStyle(() => ({ transform: [{ translateY: offset.value }] }));
  return <Animated.View style={[styles.dot, style]} />;
}

export const TypingIndicator: React.FC<{ username: string }> = ({ username }) => (
  <View style={styles.row} accessibilityLiveRegion="polite">
    <View style={styles.bubble}>
      <Dot delay={0} />
      <Dot delay={BOUNCE_MS / 2} />
      <Dot delay={BOUNCE_MS} />
    </View>
    <Text style={styles.label} numberOfLines={1}>{username} écrit…</Text>
  </View>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  bubble: {
    flexDirection: 'row',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + Spacing.xs,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: Radius.full,
    backgroundColor: Colors.textTertiary,
  },
  label: {
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
  },
});
