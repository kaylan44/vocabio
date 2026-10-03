import React, { useEffect, useRef } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { MASCOT_CONFIG } from '../../constants/config';
import { Colors, MascotSize, Radius } from '../../constants/theme';
import { MascotSprite } from '../ui/MascotSprite';

const POP_SPRING = { damping: 10, stiffness: 180 };
const POP_START_SCALE = 0.7;
const SWAP_MS = 100;        // cross-fade between two poses
const SQUASH_MS = 80;       // each half of the squash before the sunglasses
const WIGGLE_MS = 150;
const HOP_TILT_DEG = 3;

// Home mascot: runs in from the left, settles into an idle float, and puts
// sunglasses on for a moment when tapped.
export const HomeMascot: React.FC = () => {
  const reduceMotion = useReducedMotion();

  const enterX = useSharedValue(-MascotSize.enterDistance);
  const hop = useSharedValue(0);
  const runOpacity = useSharedValue(1);
  const idleOpacity = useSharedValue(0);
  const idleScale = useSharedValue(POP_START_SCALE);
  const float = useSharedValue(0);
  const breathe = useSharedValue(0);
  const squash = useSharedValue(0);
  const coolOpacity = useSharedValue(0);
  const coolScale = useSharedValue(POP_START_SCALE);
  const coolRotate = useSharedValue(0);

  // Taps are ignored during the entrance and while the sunglasses are on.
  const isIdle = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (reduceMotion) {
      runOpacity.value = 0;
      idleOpacity.value = 1;
      idleScale.value = 1;
      isIdle.current = true;
      return;
    }

    const { enterMs, hopMs, floatMs, breatheMs } = MASCOT_CONFIG;
    // Even number of half-hops so the run ends with both feet on the ground.
    const hops = Math.ceil(enterMs / hopMs / 2) * 2;
    const loop = { easing: Easing.inOut(Easing.sin) };

    enterX.value = withTiming(0, { duration: enterMs, easing: Easing.out(Easing.cubic) });
    hop.value = withRepeat(withTiming(1, { duration: hopMs }), hops, true);
    runOpacity.value = withDelay(enterMs, withTiming(0, { duration: SWAP_MS }));
    idleOpacity.value = withDelay(enterMs, withTiming(1, { duration: SWAP_MS }));
    idleScale.value = withDelay(enterMs, withSpring(1, POP_SPRING));
    float.value = withDelay(enterMs, withRepeat(withTiming(1, { duration: floatMs, ...loop }), -1, true));
    breathe.value = withDelay(enterMs, withRepeat(withTiming(1, { duration: breatheMs, ...loop }), -1, true));

    timer.current = setTimeout(() => {
      isIdle.current = true;
    }, enterMs);

    return () => {
      if (timer.current) clearTimeout(timer.current);
      [enterX, hop, runOpacity, idleOpacity, idleScale, float, breathe, squash, coolOpacity, coolScale, coolRotate]
        .forEach(cancelAnimation);
    };
  }, [reduceMotion]);

  const handlePress = () => {
    if (!isIdle.current) return;
    isIdle.current = false;

    const swapAt = SQUASH_MS * 2;
    squash.value = withSequence(
      withTiming(1, { duration: SQUASH_MS }),
      withTiming(0, { duration: SQUASH_MS }),
    );
    idleOpacity.value = withDelay(swapAt, withTiming(0, { duration: SWAP_MS }));
    coolOpacity.value = withDelay(swapAt, withTiming(1, { duration: SWAP_MS }));
    coolScale.value = POP_START_SCALE;
    coolScale.value = withDelay(swapAt, withSpring(1, POP_SPRING));
    coolRotate.value = withDelay(
      swapAt,
      withSequence(
        withTiming(-7, { duration: WIGGLE_MS }),
        withTiming(6, { duration: WIGGLE_MS }),
        withTiming(-3, { duration: WIGGLE_MS }),
        withTiming(0, { duration: WIGGLE_MS }),
      ),
    );

    timer.current = setTimeout(() => {
      coolOpacity.value = withTiming(0, { duration: SWAP_MS });
      idleOpacity.value = withTiming(1, { duration: SWAP_MS });
      idleScale.value = withSequence(
        withTiming(POP_START_SCALE, { duration: 0 }),
        withSpring(1, POP_SPRING),
      );
      isIdle.current = true;
    }, swapAt + MASCOT_CONFIG.coolMs);
  };

  const runStyle = useAnimatedStyle(() => ({
    opacity: runOpacity.value,
    transform: [
      { translateX: enterX.value },
      { translateY: -hop.value * MascotSize.hopHeight },
      { rotate: `${(hop.value * 2 - 1) * HOP_TILT_DEG}deg` },
    ],
  }));

  const idleStyle = useAnimatedStyle(() => ({
    opacity: idleOpacity.value,
    transform: [
      { translateY: -float.value * MascotSize.floatHeight },
      { scaleX: idleScale.value * (1 + breathe.value * 0.03 + squash.value * 0.08) },
      { scaleY: idleScale.value * (1 + breathe.value * 0.02 - squash.value * 0.12) },
    ],
  }));

  const coolStyle = useAnimatedStyle(() => ({
    opacity: coolOpacity.value,
    transform: [{ scale: coolScale.value }, { rotate: `${coolRotate.value}deg` }],
  }));

  // The ground shadow shrinks as the mascot floats up, and only shows once it has landed.
  const shadowStyle = useAnimatedStyle(() => ({
    opacity: Math.max(idleOpacity.value, coolOpacity.value),
    transform: [{ scaleX: 1 - float.value * 0.18 }],
  }));

  return (
    <Pressable
      onPress={handlePress}
      style={styles.container}
      accessibilityRole="button"
      accessibilityLabel="Mascotte Vocabio"
    >
      <Animated.View style={[styles.shadow, shadowStyle]} />
      <Animated.View style={[styles.layer, runStyle]}>
        <MascotSprite pose="run" height={MascotSize.run} />
      </Animated.View>
      <Animated.View style={[styles.layer, idleStyle]}>
        <MascotSprite pose="hug" height={MascotSize.idle} />
      </Animated.View>
      <Animated.View style={[styles.layer, coolStyle]}>
        <MascotSprite pose="cool" height={MascotSize.cool} />
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: MascotSize.homeWidth,
    height: MascotSize.homeHeight,
  },
  layer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: MascotSize.shadowHeight / 2,
    alignItems: 'center',
    transformOrigin: '50% 100%',
  },
  shadow: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    width: MascotSize.shadowWidth,
    height: MascotSize.shadowHeight,
    borderRadius: Radius.full,
    backgroundColor: Colors.mascotShadow,
  },
});
