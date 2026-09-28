import { useCallback, useEffect, useRef } from 'react';
import { MESSAGING_CONFIG } from '../constants/theme';
import { emitTyping, forgetConversation, joinConversation } from '../services/socket';
import { useMessagingStore } from '../store/messagingStore';
import type { ChatThread } from '../types';

const EMPTY_THREAD: ChatThread = { messages: [], status: 'idle', hasMore: true, loadingOlder: false };

export function useChat(conversationId: string) {
  const conversation = useMessagingStore(s => s.conversations[conversationId] ?? null);
  const conversationsStatus = useMessagingStore(s => s.conversationsStatus);
  const thread = useMessagingStore(s => s.threads[conversationId] ?? EMPTY_THREAD);
  const typingUsername = useMessagingStore(s => s.typing[conversationId] ?? null);
  const myUserId = useMessagingStore(s => s.me?.id ?? null);
  const lastTypingSentAt = useRef(0);

  useEffect(() => {
    const store = useMessagingStore.getState();
    store.setOpenConversation(conversationId);
    joinConversation(conversationId);
    void store.loadLatestMessages(conversationId);
    void store.markRead(conversationId);
    // Direct URL access on web (/messages/<id>): the header needs the conversation summary.
    if (!store.conversations[conversationId]) void store.loadConversations();

    return () => {
      forgetConversation(conversationId);
      if (useMessagingStore.getState().openConversationId === conversationId) {
        useMessagingStore.getState().setOpenConversation(null);
      }
    };
  }, [conversationId]);

  const send = useCallback(
    (content: string) => {
      lastTypingSentAt.current = 0;
      void useMessagingStore.getState().sendMessage(conversationId, content);
    },
    [conversationId],
  );

  const retry = useCallback(
    (localId: string) => void useMessagingStore.getState().retryMessage(conversationId, localId),
    [conversationId],
  );

  const loadOlder = useCallback(
    () => void useMessagingStore.getState().loadOlderMessages(conversationId),
    [conversationId],
  );

  const reload = useCallback(
    () => void useMessagingStore.getState().loadLatestMessages(conversationId),
    [conversationId],
  );

  // Throttled: onChangeText fires on every keystroke, the receiver only needs a heartbeat.
  const notifyTyping = useCallback(() => {
    const now = Date.now();
    if (now - lastTypingSentAt.current < MESSAGING_CONFIG.typingThrottleMs) return;
    lastTypingSentAt.current = now;
    emitTyping(conversationId);
  }, [conversationId]);

  return {
    conversation,
    // The conversation is unknown to us (or not ours) once the list has loaded without it
    notFound: !conversation && conversationsStatus === 'ready',
    messages: thread.messages,
    status: thread.status,
    hasMore: thread.hasMore,
    loadingOlder: thread.loadingOlder,
    typingUsername,
    myUserId,
    send,
    retry,
    loadOlder,
    reload,
    notifyTyping,
  };
}
