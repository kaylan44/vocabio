import { create } from 'zustand';
import { MESSAGING_CONFIG } from '../constants/theme';
import {
  applyMessageToConversation,
  applyReadReceipt,
  confirmMessage,
  createLocalId,
  mergeMessages,
  nextPageOffset,
  overlapsExisting,
  setDeliveryState,
  toConversation,
} from '../features/messaging/messagingLogic';
import { messagingApi } from '../services/api';
import type {
  ChatThread,
  ChatUser,
  Conversation,
  LoadStatus,
  Message,
  MessageReadEvent,
  TypingEvent,
} from '../types';

const EMPTY_THREAD: ChatThread = { messages: [], status: 'idle', hasMore: true, loadingOlder: false };

// Timers live outside the store: they are not state, and must survive set() calls.
const typingTimers = new Map<string, ReturnType<typeof setTimeout>>();

interface MessagingState {
  me: ChatUser | null;
  conversations: Record<string, Conversation>;
  conversationsStatus: LoadStatus;
  threads: Record<string, ChatThread>;
  // Username of whoever is typing, per conversation
  typing: Record<string, string>;
  openConversationId: string | null;

  setMe: (me: ChatUser | null) => void;
  reset: () => void;

  loadConversations: () => Promise<void>;
  openConversationWith: (user: ChatUser) => Promise<string>;
  setOpenConversation: (conversationId: string | null) => void;

  loadLatestMessages: (conversationId: string) => Promise<void>;
  loadOlderMessages: (conversationId: string) => Promise<void>;
  sendMessage: (conversationId: string, content: string) => Promise<void>;
  retryMessage: (conversationId: string, localId: string) => Promise<void>;
  markRead: (conversationId: string) => Promise<void>;

  // Socket event handlers
  receiveMessage: (message: Message) => void;
  receiveReadReceipt: (event: MessageReadEvent) => void;
  receiveTyping: (event: TypingEvent) => void;
}

const initialState = {
  me: null,
  conversations: {},
  conversationsStatus: 'idle' as LoadStatus,
  threads: {},
  typing: {},
  openConversationId: null,
};

export const useMessagingStore = create<MessagingState>((set, get) => {
  const updateThread = (conversationId: string, update: (thread: ChatThread) => ChatThread) =>
    set(state => ({
      threads: {
        ...state.threads,
        [conversationId]: update(state.threads[conversationId] ?? EMPTY_THREAD),
      },
    }));

  const updateConversation = (conversationId: string, update: (c: Conversation) => Conversation) =>
    set(state => {
      const current = state.conversations[conversationId];
      if (!current) return state;
      return { conversations: { ...state.conversations, [conversationId]: update(current) } };
    });

  const clearTyping = (conversationId: string) => {
    const timer = typingTimers.get(conversationId);
    if (timer) clearTimeout(timer);
    typingTimers.delete(conversationId);
    set(state => {
      if (!(conversationId in state.typing)) return state;
      const { [conversationId]: _removed, ...rest } = state.typing;
      return { typing: rest };
    });
  };

  const deliver = async (conversationId: string, localId: string, content: string) => {
    try {
      const confirmed = await messagingApi.sendMessage(conversationId, content);
      updateThread(conversationId, t => ({ ...t, messages: confirmMessage(t.messages, confirmed, localId) }));
      updateConversation(conversationId, c =>
        applyMessageToConversation(c, confirmed, get().me?.id ?? '', true),
      );
    } catch {
      updateThread(conversationId, t => ({ ...t, messages: setDeliveryState(t.messages, localId, 'failed') }));
    }
  };

  return {
    ...initialState,

    setMe: me => set({ me }),

    reset: () => {
      typingTimers.forEach(clearTimeout);
      typingTimers.clear();
      set(initialState);
    },

    loadConversations: async () => {
      // Keep showing the previous list during background refreshes (reconnect, app focus)
      if (get().conversationsStatus !== 'ready') set({ conversationsStatus: 'loading' });
      try {
        const list = await messagingApi.listConversations();
        const openId = get().openConversationId;
        const conversations: Record<string, Conversation> = {};
        for (const c of list) {
          // The open conversation is being read: the server count may lag behind our markRead.
          conversations[c.id] = c.id === openId ? { ...c, unreadCount: 0 } : c;
        }
        set({ conversations, conversationsStatus: 'ready' });
      } catch {
        if (get().conversationsStatus !== 'ready') set({ conversationsStatus: 'error' });
      }
    },

    openConversationWith: async user => {
      const raw = await messagingApi.openConversation(user.id);
      const conversation = toConversation(raw, get().me?.id ?? '');
      // An existing conversation keeps its lastMessage/unreadCount
      set(state => ({
        conversations: state.conversations[conversation.id]
          ? state.conversations
          : { ...state.conversations, [conversation.id]: conversation },
      }));
      return conversation.id;
    },

    setOpenConversation: conversationId => set({ openConversationId: conversationId }),

    loadLatestMessages: async conversationId => {
      const thread = get().threads[conversationId] ?? EMPTY_THREAD;
      if (thread.status === 'idle') updateThread(conversationId, t => ({ ...t, status: 'loading' }));

      try {
        const { messages } = await messagingApi.getMessages(conversationId, 0, MESSAGING_CONFIG.pageSize);
        updateThread(conversationId, t => {
          // No overlap: more than a page was missed while offline. Restart from this page
          // (keeping unsent optimistic messages) rather than leaving a silent gap.
          const restart = !overlapsExisting(t.messages, messages);
          const kept = restart ? t.messages.filter(m => m.deliveryState) : t.messages;
          const isFirstPage = restart || t.status !== 'ready';
          return {
            ...t,
            status: 'ready',
            messages: mergeMessages(kept, messages),
            hasMore: isFirstPage ? messages.length === MESSAGING_CONFIG.pageSize : t.hasMore,
          };
        });
      } catch {
        updateThread(conversationId, t => ({ ...t, status: t.status === 'ready' ? 'ready' : 'error' }));
      }
    },

    loadOlderMessages: async conversationId => {
      const thread = get().threads[conversationId];
      if (!thread || thread.status !== 'ready' || thread.loadingOlder || !thread.hasMore) return;

      updateThread(conversationId, t => ({ ...t, loadingOlder: true }));
      try {
        const { messages } = await messagingApi.getMessages(
          conversationId,
          nextPageOffset(thread.messages),
          MESSAGING_CONFIG.pageSize,
        );
        updateThread(conversationId, t => ({
          ...t,
          loadingOlder: false,
          messages: mergeMessages(t.messages, messages),
          hasMore: messages.length === MESSAGING_CONFIG.pageSize,
        }));
      } catch {
        updateThread(conversationId, t => ({ ...t, loadingOlder: false }));
      }
    },

    sendMessage: async (conversationId, content) => {
      const me = get().me;
      const text = content.trim();
      if (!me || !text) return;

      const localId = createLocalId();
      const optimistic: Message = {
        id: localId,
        conversationId,
        senderId: me.id,
        content: text,
        createdAt: new Date().toISOString(),
        readAt: null,
        sender: me,
        deliveryState: 'sending',
      };
      updateThread(conversationId, t => ({ ...t, messages: mergeMessages(t.messages, [optimistic]) }));
      await deliver(conversationId, localId, text);
    },

    retryMessage: async (conversationId, localId) => {
      const message = get().threads[conversationId]?.messages.find(m => m.id === localId);
      if (!message || message.deliveryState !== 'failed') return;
      updateThread(conversationId, t => ({ ...t, messages: setDeliveryState(t.messages, localId, 'sending') }));
      await deliver(conversationId, localId, message.content);
    },

    markRead: async conversationId => {
      updateConversation(conversationId, c => ({ ...c, unreadCount: 0 }));
      try {
        await messagingApi.markRead(conversationId);
      } catch {
        // Non-critical: the next conversations refresh restores the server count.
      }
    },

    receiveMessage: message => {
      const { me, openConversationId, conversations, threads } = get();
      if (!me) return;
      const conversationId = message.conversationId;
      const isOpen = openConversationId === conversationId;

      if (threads[conversationId]) {
        updateThread(conversationId, t => ({
          ...t,
          messages: message.senderId === me.id ? confirmMessage(t.messages, message) : mergeMessages(t.messages, [message]),
        }));
      }

      if (message.senderId !== me.id) clearTyping(conversationId);

      if (conversations[conversationId]) {
        // Skip duplicates (echo of a message the REST response already applied)
        if (conversations[conversationId].lastMessage?.id !== message.id) {
          updateConversation(conversationId, c => applyMessageToConversation(c, message, me.id, isOpen));
        }
      } else {
        // First message of a conversation someone else started: we lack otherParticipant.
        void get().loadConversations();
      }

      if (isOpen && message.senderId !== me.id) void get().markRead(conversationId);
    },

    receiveReadReceipt: ({ conversationId, readAt, readByUserId }) => {
      const me = get().me;
      if (!me) return;
      if (readByUserId === me.id) {
        // Read on another device
        updateConversation(conversationId, c => ({ ...c, unreadCount: 0 }));
      } else if (get().threads[conversationId]) {
        updateThread(conversationId, t => ({ ...t, messages: applyReadReceipt(t.messages, me.id, readAt) }));
      }
    },

    receiveTyping: ({ conversationId, userId, username }) => {
      if (userId === get().me?.id) return;
      const previous = typingTimers.get(conversationId);
      if (previous) clearTimeout(previous);
      typingTimers.set(
        conversationId,
        setTimeout(() => clearTyping(conversationId), MESSAGING_CONFIG.typingTimeoutMs),
      );
      set(state => ({ typing: { ...state.typing, [conversationId]: username } }));
    },
  };
});
