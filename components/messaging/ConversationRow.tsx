import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, Spacing, Typography } from '../../constants/theme';
import { formatConversationDate } from '../../features/messaging/format';
import type { Conversation } from '../../types';
import { Avatar } from '../ui/Avatar';
import { CounterBadge } from '../ui/CounterBadge';

interface ConversationRowProps {
  conversation: Conversation;
  myUserId: string | null;
  onPress: (conversationId: string) => void;
}

export const ConversationRow: React.FC<ConversationRowProps> = React.memo(({ conversation, myUserId, onPress }) => {
  const { otherParticipant, lastMessage, unreadCount } = conversation;
  const name = otherParticipant?.username ?? 'Utilisateur supprimé';
  const unread = unreadCount > 0;
  const preview = lastMessage
    ? `${lastMessage.senderId === myUserId ? 'Vous : ' : ''}${lastMessage.content}`
    : '';

  return (
    <TouchableOpacity style={styles.row} onPress={() => onPress(conversation.id)} activeOpacity={0.7}>
      <Avatar uri={otherParticipant?.avatarUrl ?? null} name={name} />
      <View style={styles.body}>
        <View style={styles.line}>
          <Text style={[styles.name, unread && styles.bold]} numberOfLines={1}>{name}</Text>
          {lastMessage ? (
            <Text style={[styles.date, unread && styles.dateUnread]}>
              {formatConversationDate(lastMessage.createdAt)}
            </Text>
          ) : null}
        </View>
        <View style={styles.line}>
          <Text style={[styles.preview, unread && styles.previewUnread]} numberOfLines={1}>{preview}</Text>
          <CounterBadge count={unreadCount} />
        </View>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.surface,
  },
  body: {
    flex: 1,
    gap: Spacing.xs,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  name: {
    flex: 1,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
  },
  bold: {
    fontWeight: Typography.weights.extrabold,
  },
  date: {
    fontSize: Typography.sizes.xs,
    color: Colors.textTertiary,
  },
  dateUnread: {
    color: Colors.primary,
    fontWeight: Typography.weights.semibold,
  },
  preview: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  previewUnread: {
    color: Colors.textPrimary,
    fontWeight: Typography.weights.medium,
  },
});
