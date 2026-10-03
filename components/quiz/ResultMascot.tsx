import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { MASCOT_CONFIG } from '../../constants/config';
import { MascotSize } from '../../constants/theme';
import { MascotSprite } from '../ui/MascotSprite';

const RISE_SPRING = { damping: 11, stiffness: 160 };
const WIGGLE_MS = 180;

// Happy mascot head that pops up above the score in the result card and wiggles.
// The clipping box hides the head until it rises.
export const ResultMascot: React.FC = () => {
  const reduceMotion = useReducedMotion();

  // 1 = fully hidden below the clipping box, 0 = fully up.
  const hidden = useSharedValue(1);
  const tilt = useSharedValue(0);

  useEffect(() => {
    if (reduceMotion) {
      hidden.value = 0;
      return;
    }

    const { resultDelayMs, resultRiseMs } = MASCOT_CONFIG;
    hidden.value = withDelay(resultDelayMs, withSpring(0, RISE_SPRING));
    tilt.value = withDelay(
      resultDelayMs + resultRiseMs,
      withSequence(
        withTiming(-5, { duration: WIGGLE_MS }),
        withTiming(5, { duration: WIGGLE_MS }),
        withTiming(-3, { duration: WIGGLE_MS }),
        withTiming(0, { duration: WIGGLE_MS }),
      ),
    );

    return () => {
      cancelAnimation(hidden);
      cancelAnimation(tilt);
    };
  }, [reduceMotion]);

  const headStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: hidden.value * MascotSize.result },
      { rotate: `${tilt.value}deg` },
    ],
  }));

  return (
    <View style={styles.clip}>
      <Animated.View style={[styles.head, headStyle]}>
        <MascotSprite pose="happy" height={MascotSize.result} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  clip: {
    height: MascotSize.result,
    alignItems: 'center',
    overflow: 'hidden',
  },
  head: {
    transformOrigin: '50% 100%',
  },
});
