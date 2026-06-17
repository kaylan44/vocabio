import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import { Colors, Radius, Shadow, Spacing, Typography } from '../../constants/theme';
import { TileState } from '../../types';

interface AnswerTileProps {
  label: string;
  state: TileState;
  onPress: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const AnswerTile: React.FC<AnswerTileProps> = ({ label, state, onPress }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // ─── Feedback animation on state change ────────────────────────────────────
  useEffect(() => {
    if (state === 'selected-correct') {
      // Bounce effect
      scale.value = withSequence(
        withSpring(1.04, { damping: 8 }),
        withSpring(1, { damping: 12 })
      );
    } else if (state === 'selected-wrong') {
      // Shake effect (horizontal)
      scale.value = withSequence(
        withSpring(0.97, { damping: 8 }),
        withSpring(1, { damping: 10 })
      );
    } else if (state === 'disabled') {
      opacity.value = withTiming(0.5, { duration: 200 });
    }
  }, [state]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    if (state !== 'idle') return;
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };
  const handlePressOut = () => {
    if (state !== 'idle') return;
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const containerStyle = [
    styles.tile,
    state === 'selected-correct' && styles.correct,
    state === 'revealed-correct' && styles.correct,
    state === 'selected-wrong' && styles.wrong,
    state === 'disabled' && styles.disabledTile,
  ];

  const textStyle = [
    styles.label,
    (state === 'selected-correct' || state === 'revealed-correct') && styles.labelCorrect,
    state === 'selected-wrong' && styles.labelWrong,
  ];

  return (
    <AnimatedTouchable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={state !== 'idle'}
      activeOpacity={1}
      style={[animatedStyle, { flex: 1 }]}
    >
      <View style={containerStyle}>
        {/* Correct indicator dot */}
        {(state === 'selected-correct' || state === 'revealed-correct') && (
          <View style={styles.indicatorDot} />
        )}
        <Text style={textStyle} numberOfLines={2} adjustsFontSizeToFit>
          {label}
        </Text>
      </View>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  tile: {
    width: '100%',
    minHeight: 72,
    backgroundColor: Colors.tileIdle,
    borderRadius: Radius.lg,
    borderWidth: 1.5,
    borderColor: Colors.tileIdleBorder,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    ...Shadow.tile,
    position: 'relative',
  },
  correct: {
    backgroundColor: '#D1F0E3',
    borderColor: Colors.success,
  },
  wrong: {
    backgroundColor: '#FCC9BD',
    borderColor: Colors.error,
  },
  disabledTile: {
    backgroundColor: Colors.background,
    borderColor: Colors.borderLight,
  },
  indicatorDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.success,
  },
  label: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  labelCorrect: {
    color: Colors.success,
  },
  labelWrong: {
    color: Colors.error,
  },
});
