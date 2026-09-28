import { useMemo } from 'react';
import { sortConversations, totalUnread } from '../features/messaging/messagingLogic';
import { useMessagingStore } from '../store/messagingStore';

export function useConversations() {
  const conversationsById = useMessagingStore(s => s.conversations);
  const status = useMessagingStore(s => s.conversationsStatus);
  const refresh = useMessagingStore(s => s.loadConversations);

  const conversations = useMemo(
    () => sortConversations(Object.values(conversationsById)),
    [conversationsById],
  );

  return { conversations, status, refresh };
}

/** Lightweight selector for the home header badge. */
export function useUnreadTotal(): number {
  return useMessagingStore(s => totalUnread(Object.values(s.conversations)));
}
