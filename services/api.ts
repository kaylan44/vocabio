// REST client for vocabio-backend.
// All writes go through REST (not socket events) so every action gets a status code
// and still works while the socket is reconnecting.

import { supabase } from '../lib/supabase';
import type {
  ChatUser,
  Conversation,
  CreateConversationResponse,
  Message,
  MessagesPage,
} from '../types';

export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? 'https://vocabio-backend-production.up.railway.app';

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Reads the token on every call rather than caching it: getSession() returns a
 * refreshed token once Supabase has rotated it (access tokens expire after ~1h).
 */
export async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = await getAccessToken();
  if (!token) throw new ApiError(401, 'Non authentifié');

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...init.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(res.status, body?.error ?? `Erreur ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const messagingApi = {
  listConversations: () => request<Conversation[]>('/conversations'),

  openConversation: (recipientId: string) =>
    request<CreateConversationResponse>('/conversations', {
      method: 'POST',
      body: JSON.stringify({ recipientId }),
    }),

  getMessages: (conversationId: string, offset: number, limit: number) =>
    request<MessagesPage>(
      `/conversations/${encodeURIComponent(conversationId)}/messages?offset=${offset}&limit=${limit}`,
    ),

  sendMessage: (conversationId: string, content: string) =>
    request<Message>(`/conversations/${encodeURIComponent(conversationId)}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  markRead: (conversationId: string) =>
    request<{ markedAsRead: number }>(`/conversations/${encodeURIComponent(conversationId)}/read`, {
      method: 'PATCH',
    }),

  listUsers: () => request<ChatUser[]>('/users'),

  searchUsers: (query: string) =>
    request<ChatUser[]>(`/users/search?q=${encodeURIComponent(query)}`),
};
