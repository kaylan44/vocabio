import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors, ControlSize, Radius, Spacing, Typography } from '../../constants/theme';
import { formatTime } from '../../features/messaging/format';
import type { Message } from '../../types';

interface MessageBubbleProps {
  message: Message;
  isMine: boolean;
  // Consecutive messages from the same sender are visually grouped
  isFirstOfGroup: boolean;
  onRetry?: (localId: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = React.memo(({ message, isMine, isFirstOfGroup, onRetry }) => {
  const failed = message.deliveryState === 'failed';
  const sending = message.deliveryState === 'sending';

  const bubble = (
    <View
      style={[
        styles.bubble,
        isMine ? styles.mine : styles.theirs,
        isMine && isFirstOfGroup && styles.mineFirst,
        !isMine && isFirstOfGroup && styles.theirsFirst,
        sending && styles.sending,
        failed && styles.failed,
      ]}
    >
      <Text style={[styles.content, isMine && styles.contentMine]}>{message.content}</Text>
      <Text style={[styles.meta, isMine && styles.metaMine]}>
        {sending ? 'Envoi…' : formatTime(message.createdAt)}
      </Text>
    </View>
  );

  return (
    <View style={[styles.row, isMine ? styles.rowMine : styles.rowTheirs, isFirstOfGroup && styles.groupGap]}>
      {failed && onRetry ? (
        <TouchableOpacity onPress={() => onRetry(message.id)} accessibilityLabel="Renvoyer le message">
          {bubble}
          <Text style={styles.retry}>Échec de l'envoi · Toucher pour réessayer</Text>
        </TouchableOpacity>
      ) : (
        bubble
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.xs / 2,
    flexDirection: 'row',
  },
  rowMine: {
    justifyContent: 'flex-end',
  },
  rowTheirs: {
    justifyContent: 'flex-start',
  },
  groupGap: {
    marginTop: Spacing.sm,
  },
  bubble: {
    maxWidth: ControlSize.bubbleMaxWidth,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.lg,
  },
  mine: {
    backgroundColor: Colors.primary,
  },
  mineFirst: {
    borderTopRightRadius: Radius.sm / 2,
  },
  theirs: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  theirsFirst: {
    borderTopLeftRadius: Radius.sm / 2,
  },
  sending: {
    opacity: 0.6,
  },
  failed: {
    backgroundColor: Colors.error,
  },
  content: {
    fontSize: Typography.sizes.md,
    color: Colors.textPrimary,
  },
  contentMine: {
    color: Colors.textOnPrimary,
  },
  meta: {
    marginTop: Spacing.xs / 2,
    alignSelf: 'flex-end',
    fontSize: Typography.sizes.xs,
    color: Colors.textTertiary,
  },
  metaMine: {
    color: Colors.primaryLight,
  },
  retry: {
    marginTop: Spacing.xs,
    alignSelf: 'flex-end',
    fontSize: Typography.sizes.xs,
    color: Colors.error,
  },
});
