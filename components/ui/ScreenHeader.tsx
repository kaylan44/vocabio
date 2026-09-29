import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, ControlSize, Radius, Spacing, Typography } from '../../constants/theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string | null;
  onBack: () => void;
  leading?: React.ReactNode;   // e.g. an avatar next to the title
  trailing?: React.ReactNode;  // e.g. an action button
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title, subtitle, onBack, leading, trailing }) => (
  <View style={styles.bar}>
    <TouchableOpacity onPress={onBack} style={styles.iconButton} accessibilityLabel="Retour">
      <Ionicons name="arrow-back" size={ControlSize.buttonIcon} color={Colors.textPrimary} />
    </TouchableOpacity>
    {leading}
    <View style={styles.titles}>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
    </View>
    {trailing}
  </View>
);

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  iconButton: {
    width: ControlSize.iconButton,
    height: ControlSize.iconButton,
    borderRadius: Radius.full,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  titles: {
    flex: 1,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
  },
  subtitle: {
    marginTop: Spacing.xs / 2,
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
});
