import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { ARTICLES_CONFIG } from '../../constants/config';
import { Colors, ControlSize, Radius, Shadow, Spacing, Typography } from '../../constants/theme';
import { formatArticleDate, formatListenTime } from '../../features/articles/format';
import type { ArticleSummary } from '../../types';
import { LevelBadge } from './LevelBadge';

interface ArticleRowProps {
  article: ArticleSummary;
  onPress: (articleId: string) => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

/** Card of the article list: level, date, title, excerpt and listening time. */
export const ArticleRow: React.FC<ArticleRowProps> = ({ article, onPress }) => {
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedTouchable
      onPress={() => onPress(article.id)}
      onPressIn={() => { scale.value = withSpring(0.98, { damping: 15, stiffness: 300 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
      activeOpacity={0.9}
      accessibilityRole="button"
      accessibilityLabel={`Lire l'article : ${article.title}`}
      style={[styles.card, animatedStyle]}
    >
      <View style={styles.meta}>
        <LevelBadge level={article.level} />
        <Text style={styles.date}>{formatArticleDate(article.publishedAt)}</Text>
      </View>

      <Text style={styles.title}>{article.title}</Text>
      <Text style={styles.excerpt} numberOfLines={ARTICLES_CONFIG.excerptLines}>{article.excerpt}</Text>

      <View style={styles.footer}>
        {article.hasAudio ? (
          <View style={styles.audio}>
            <Ionicons name="headset-outline" size={ControlSize.buttonIcon} color={Colors.textSecondary} />
            <Text style={styles.audioLabel}>
              {article.audioDurationSec ? formatListenTime(article.audioDurationSec) : 'Audio'}
            </Text>
          </View>
        ) : (
          <View />
        )}
        <View style={styles.read}>
          <Text style={styles.readLabel}>Lire</Text>
          <Ionicons name="arrow-forward" size={ControlSize.buttonIcon} color={Colors.primary} />
        </View>
      </View>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.sm,
    ...Shadow.card,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  date: {
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
  },
  title: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  excerpt: {
    fontSize: Typography.sizes.md,
    lineHeight: Typography.lineHeights.body,
    color: Colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  audio: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  audioLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
  },
  read: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  readLabel: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary,
  },
});
