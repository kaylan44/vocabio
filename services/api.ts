// REST client for vocabio-backend.
// All writes go through REST (not socket events) so every action gets a status code
// and still works while the socket is reconnecting.

import { levelParam } from '../features/articles/articleLogic';
import { supabase } from '../lib/supabase';
import type {
  Article,
  ArticleLevelFilter,
  ArticlesPage,
  ChatUser,
  Conversation,
  CreateConversationResponse,
  Message,
  MessagesPage,
  QuizSessionPayload,
  QuizStats,
  SavedQuizSession,
  WordProgressRow,
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

// Shared by the JSON and binary variants below: adds the token, turns a non-2xx into an ApiError.
async function send(path: string, init: RequestInit = {}): Promise<Response> {
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
  return res;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await send(path, init);
  return res.json() as Promise<T>;
}

// For files: the body is kept as bytes instead of being parsed as JSON.
async function requestBlob(path: string): Promise<Blob> {
  const res = await send(path);
  return res.blob();
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

export const quizApi = {
  // Idempotent on payload.id: 201 when stored, 200 when already stored, so a retry is safe.
  saveSession: (payload: QuizSessionPayload) =>
    request<SavedQuizSession>('/quiz-sessions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  getStats: () => request<QuizStats>('/quiz-sessions/stats'),

  // Computed by the backend from the finished quizzes saved with saveSession.
  getWordProgress: () => request<WordProgressRow[]>('/quiz-sessions/word-progress'),
};

export const articlesApi = {
  list: (level: ArticleLevelFilter, offset: number, limit: number) =>
    request<ArticlesPage>(`/articles?offset=${offset}&limit=${limit}${levelParam(level)}`),

  get: (articleId: string) => request<Article>(`/articles/${encodeURIComponent(articleId)}`),

  // The whole MP3 (about 2 MB). Fetched like any other call so it carries the JWT:
  // an audio element pointed at this URL could not send the Authorization header.
  getAudio: (articleId: string) => requestBlob(`/articles/${encodeURIComponent(articleId)}/audio`),
};
