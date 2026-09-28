import { useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChatInput } from '../../components/messaging/ChatInput';
import { MessageBubble } from '../../components/messaging/MessageBubble';
import { TypingIndicator } from '../../components/messaging/TypingIndicator';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Colors, Radius, Spacing, Typography } from '../../constants/theme';
import { formatDayLabel, isDifferentDay } from '../../features/messaging/format';
import { useChat } from '../../hooks/useChat';
import type { Message } from '../../types';

export default function ChatScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    conversation,
    notFound,
    messages,
    status,
    hasMore,
    loadingOlder,
    typingUsername,
    myUserId,
    send,
    retry,
    loadOlder,
    reload,
    notifyTyping,
  } = useChat(id);

  const other = conversation?.otherParticipant ?? null;

  // The list is inverted: index 0 is the newest message, drawn at the bottom.
  // "Older neighbour" is therefore index + 1.
  const renderItem = useCallback(
    ({ item, index }: { item: Message; index: number }) => {
      const older = messages[index + 1];
      const startsDay = !older || isDifferentDay(older.createdAt, item.createdAt);
      const isFirstOfGroup = startsDay || older.senderId !== item.senderId;
      return (
        <View>
          {startsDay ? <Text style={styles.day}>{formatDayLabel(item.createdAt)}</Text> : null}
          <MessageBubble
            message={item}
            isMine={item.senderId === myUserId}
            isFirstOfGroup={isFirstOfGroup}
            onRetry={retry}
          />
        </View>
      );
    },
    [messages, myUserId, retry],
  );

  const renderBody = () => {
    if (notFound) {
      return (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Cette conversation n'existe pas.</Text>
          <Button label="Retour aux messages" variant="secondary" onPress={() => router.replace('/messages' as never)} />
        </View>
      );
    }
    if (status === 'error' && messages.length === 0) {
      return (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Impossible de charger les messages.</Text>
          <Button label="Réessayer" variant="secondary" onPress={reload} />
        </View>
      );
    }
    if ((status === 'idle' || status === 'loading') && messages.length === 0) {
      return <ActivityIndicator style={styles.centered} color={Colors.primary} />;
    }
    return (
      <FlatList
        inverted
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        onEndReached={hasMore ? loadOlder : undefined}
        onEndReachedThreshold={0.3}
        // Inverted: the header sits at the bottom (under the newest message), the footer at the top.
        ListHeaderComponent={typingUsername ? <TypingIndicator username={typingUsername} /> : null}
        ListFooterComponent={loadingOlder ? <ActivityIndicator style={styles.olderLoader} color={Colors.primary} /> : null}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <Text style={styles.emptyText}>
              Dites bonjour à {other?.username ?? 'votre correspondant'} 👋
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
      />
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title={other?.username ?? ''}
        onBack={() => (router.canGoBack() ? router.back() : router.replace('/messages' as never))}
        leading={other ? <Avatar uri={other.avatarUrl} name={other.username} size="sm" /> : null}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {renderBody()}
        {!notFound ? <ChatInput onSend={send} onTyping={notifyTyping} /> : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  flex: {
    flex: 1,
  },
  listContent: {
    paddingVertical: Spacing.sm,
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.xl,
  },
  emptyChat: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    // Content is flipped in an inverted list; flip the empty state back upright.
    transform: [{ scaleY: -1 }],
  },
  emptyText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  day: {
    alignSelf: 'center',
    marginVertical: Spacing.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: Radius.full,
    backgroundColor: Colors.borderLight,
    fontSize: Typography.sizes.xs,
    color: Colors.textSecondary,
    overflow: 'hidden',
  },
  olderLoader: {
    paddingVertical: Spacing.md,
  },
});
