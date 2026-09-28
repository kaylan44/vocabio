import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors, Spacing, Typography } from '../../constants/theme';
import type { ChatUser } from '../../types';
import { Avatar } from '../ui/Avatar';

interface UserRowProps {
  user: ChatUser;
  loading: boolean;
  disabled: boolean;
  onPress: (user: ChatUser) => void;
}

export const UserRow: React.FC<UserRowProps> = ({ user, loading, disabled, onPress }) => (
  <TouchableOpacity
    style={styles.row}
    onPress={() => onPress(user)}
    disabled={disabled}
    activeOpacity={0.7}
  >
    <Avatar uri={user.avatarUrl} name={user.username} />
    <Text style={styles.name} numberOfLines={1}>{user.username}</Text>
    {loading ? <ActivityIndicator color={Colors.primary} /> : null}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
  },
  name: {
    flex: 1,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
});
