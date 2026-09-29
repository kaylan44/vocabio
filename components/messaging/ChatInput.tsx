import React, { useState } from 'react';
import { Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, ControlSize, Radius, Spacing, Typography } from '../../constants/theme';

interface ChatInputProps {
  onSend: (content: string) => void;
  onTyping: () => void;
}

export const ChatInput: React.FC<ChatInputProps> = ({ onSend, onTyping }) => {
  const [text, setText] = useState('');
  const canSend = text.trim().length > 0;

  const submit = () => {
    if (!canSend) return;
    onSend(text);
    setText('');
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={value => {
          setText(value);
          if (value.length > 0) onTyping();
        }}
        placeholder="Écrire un message…"
        placeholderTextColor={Colors.textTertiary}
        multiline
        // Web: Enter sends, Shift+Enter inserts a newline (desktop chat convention).
        // Native keeps the return key for newlines and relies on the send button.
        onKeyPress={e => {
          const event = e.nativeEvent as { key: string; shiftKey?: boolean };
          if (Platform.OS === 'web' && event.key === 'Enter' && !event.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
        accessibilityLabel="Message"
      />
      <TouchableOpacity
        style={[styles.send, !canSend && styles.sendDisabled]}
        onPress={submit}
        disabled={!canSend}
        accessibilityLabel="Envoyer"
      >
        <Ionicons name="send" size={ControlSize.buttonIcon} color={Colors.textOnPrimary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    backgroundColor: Colors.background,
  },
  input: {
    flex: 1,
    minHeight: ControlSize.iconButton,
    maxHeight: ControlSize.inputMaxHeight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + Spacing.xs / 2,
    borderRadius: Radius.xl,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    fontSize: Typography.sizes.input,
    color: Colors.textPrimary,
  },
  send: {
    width: ControlSize.iconButton,
    height: ControlSize.iconButton,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    backgroundColor: Colors.border,
  },
});
