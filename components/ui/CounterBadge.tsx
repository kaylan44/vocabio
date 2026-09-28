import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Colors, ControlSize, Radius, Spacing, Typography } from '../../constants/theme';

interface CounterBadgeProps {
  count: number;
  max?: number;
}

/** Small red pill for unread counts. Renders nothing at zero. */
export const CounterBadge: React.FC<CounterBadgeProps> = ({ count, max = 99 }) => {
  if (count <= 0) return null;
  return (
    <View style={styles.badge} accessibilityLabel={`${count} non lu${count > 1 ? 's' : ''}`}>
      <Text style={styles.text}>{count > max ? `${max}+` : count}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    minWidth: ControlSize.badgeMin,
    height: ControlSize.badgeMin,
    paddingHorizontal: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: Colors.textOnPrimary,
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.bold,
  },
});
