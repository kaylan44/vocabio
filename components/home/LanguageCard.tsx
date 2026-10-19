import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Colors, ControlSize, Radius, Spacing, Typography } from '../../constants/theme';
import { LANGUAGES } from '../../constants/languages';
import { Language } from '../../types';
import { Flag } from '../ui/Flag';

interface LanguageCardProps {
  language: Language;
  wordCount: number;
  onPress: (language: Language) => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

/** Large card of the language screen: flag, name, number of words. */
export const LanguageCard: React.FC<LanguageCardProps> = ({ language, wordCount, onPress }) => {
  const scale = useSharedValue(1);
  const { label } = LANGUAGES[language];

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedTouchable
      onPress={() => onPress(language)}
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 15 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
      activeOpacity={1}
      style={[styles.card, animatedStyle]}
      accessibilityRole="button"
      accessibilityLabel={`Apprendre l'${label.toLowerCase()}`}
    >
      <Flag country={language} height={ControlSize.flagLarge} />
      <View style={styles.texts}>
        <Text style={styles.title}>{label}</Text>
        <Text style={styles.subtitle}>{wordCount} mots</Text>
      </View>
      <Ionicons name="chevron-forward" size={ControlSize.buttonIcon} color={Colors.textSecondary} />
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: Radius.xl,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  texts: {
    flex: 1,
    gap: Spacing.xs,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
});
