import { useCallback, useEffect, useState } from 'react';
import { MESSAGING_CONFIG } from '../constants/theme';
import { messagingApi } from '../services/api';
import { useMessagingStore } from '../store/messagingStore';
import type { ChatUser, LoadStatus } from '../types';

export function useUserSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ChatUser[]>([]);
  const [status, setStatus] = useState<LoadStatus>('idle');
  const [openingUserId, setOpeningUserId] = useState<string | null>(null);

  useEffect(() => {
    const q = query.trim();
    if (q.length < MESSAGING_CONFIG.searchMinLength) {
      setResults([]);
      setStatus('idle');
      return;
    }

    // Ignore responses that arrive after the query changed (out-of-order network replies)
    let stale = false;
    setStatus('loading');
    const timer = setTimeout(async () => {
      try {
        const users = await messagingApi.searchUsers(q);
        if (!stale) {
          setResults(users);
          setStatus('ready');
        }
      } catch {
        if (!stale) setStatus('error');
      }
    }, MESSAGING_CONFIG.searchDebounceMs);

    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [query]);

  /** Returns the conversation id, or null if it could not be created. */
  const startConversation = useCallback(async (user: ChatUser): Promise<string | null> => {
    setOpeningUserId(user.id);
    try {
      return await useMessagingStore.getState().openConversationWith(user);
    } catch {
      return null;
    } finally {
      setOpeningUserId(null);
    }
  }, []);

  return { query, setQuery, results, status, openingUserId, startConversation };
}
