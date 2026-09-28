import { useEffect } from 'react';
import { AppState } from 'react-native';
import { connectSocket, disconnectSocket } from '../services/socket';
import { useAuthStore } from '../store/authStore';
import { useMessagingStore } from '../store/messagingStore';
import type { Message, MessageReadEvent, TypingEvent } from '../types';

/**
 * Owns the socket lifecycle: connected only while authenticated (guests have no JWT).
 * Mounted once in the root layout so unread counts stay live on every screen.
 */
export function useMessagingConnection(): void {
  const status = useAuthStore(s => s.status);
  const user = useAuthStore(s => s.user);

  useEffect(() => {
    if (status !== 'authenticated' || !user) return;

    const store = useMessagingStore.getState();
    store.setMe({ id: user.id, username: user.fullName ?? user.email ?? '', avatarUrl: user.avatarUrl });

    // Socket.io does not replay events missed while offline: resync on every
    // (re)connection. The first connect also covers the initial load, and any
    // authenticated call registers the user backend-side, making them searchable.
    const resync = () => {
      const { loadConversations, loadLatestMessages, openConversationId } = useMessagingStore.getState();
      void loadConversations();
      if (openConversationId) void loadLatestMessages(openConversationId);
    };

    const socket = connectSocket();
    socket.on('connect', resync);
    socket.on('new_message', (m: Message) => useMessagingStore.getState().receiveMessage(m));
    socket.on('message_read', (e: MessageReadEvent) => useMessagingStore.getState().receiveReadReceipt(e));
    socket.on('user_typing', (e: TypingEvent) => useMessagingStore.getState().receiveTyping(e));

    // Browsers throttle background tabs and mobile OSes suspend sockets: refresh on return.
    const appState = AppState.addEventListener('change', next => {
      if (next === 'active') resync();
    });

    return () => {
      appState.remove();
      disconnectSocket();
      useMessagingStore.getState().reset();
    };
  }, [status, user?.id]);
}
