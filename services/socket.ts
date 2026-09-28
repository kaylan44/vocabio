// Socket.io singleton. Receive-only for messages (writes go through services/api.ts);
// emits only room joins and typing, which are fire-and-forget by nature.
//
// Never connect at import time: web uses static rendering, and the socket must
// only exist while a user is authenticated.

import { io, Socket } from 'socket.io-client';
import { MESSAGING_CONFIG } from '../constants/theme';
import { API_URL, getAccessToken } from './api';

let socket: Socket | null = null;
let retryTimer: ReturnType<typeof setTimeout> | null = null;

// Rooms are per connection: a reconnect lands on a fresh server-side socket that
// has joined nothing, so we replay the joins of the conversations still open.
const joinedConversations = new Set<string>();

export function connectSocket(): Socket {
  if (socket) return socket;

  socket = io(API_URL, {
    // Skip long-polling: avoids sticky-session requirements if the backend scales out.
    transports: ['websocket'],
    // A function, not a static object, so each reconnection sends a fresh token.
    auth: cb => {
      getAccessToken().then(token => cb({ token }));
    },
  });

  socket.on('connect', () => {
    joinedConversations.forEach(conversationId => socket?.emit('join_conversation', { conversationId }));
  });

  socket.on('connect_error', () => {
    // A rejection by the auth middleware (e.g. expired token) disables automatic
    // reconnection; network errors keep socket.active true and retry on their own.
    if (socket && !socket.active && !retryTimer) {
      retryTimer = setTimeout(() => {
        retryTimer = null;
        socket?.connect();
      }, MESSAGING_CONFIG.reconnectDelayMs);
    }
  });

  return socket;
}

export function disconnectSocket(): void {
  if (retryTimer) clearTimeout(retryTimer);
  retryTimer = null;
  joinedConversations.clear();
  socket?.removeAllListeners();
  socket?.disconnect();
  socket = null;
}

export function getSocket(): Socket | null {
  return socket;
}

export function joinConversation(conversationId: string): void {
  joinedConversations.add(conversationId);
  if (socket?.connected) socket.emit('join_conversation', { conversationId });
}

/**
 * The server has no "leave" event, so the socket stays in the room; forgetting it
 * here only stops re-joining it after a reconnect.
 */
export function forgetConversation(conversationId: string): void {
  joinedConversations.delete(conversationId);
}

export function emitTyping(conversationId: string): void {
  if (socket?.connected) socket.emit('typing', { conversationId });
}
