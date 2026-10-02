import { useCallback, useEffect, useState } from 'react';
import { MESSAGING_CONFIG } from '../constants/config';
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

    // Ignore responses that arrive after the query changed (out-of-order network replies)
    let stale = false;
    setStatus('loading');
    // Empty query lists everyone right away; typing narrows it server-side (the
    // full list is capped, so filtering it locally could miss users).
    const timer = setTimeout(async () => {
      try {
        const users = q ? await messagingApi.searchUsers(q) : await messagingApi.listUsers();
        if (!stale) {
          setResults(users);
          setStatus('ready');
        }
      } catch {
        if (!stale) setStatus('error');
      }
    }, q ? MESSAGING_CONFIG.searchDebounceMs : 0);

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
