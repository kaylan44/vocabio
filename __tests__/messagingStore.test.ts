jest.mock('../services/api', () => ({
  messagingApi: {
    listConversations: jest.fn(),
    openConversation: jest.fn(),
    getMessages: jest.fn(),
    sendMessage: jest.fn(),
    markRead: jest.fn(),
    searchUsers: jest.fn(),
  },
}));

import { MESSAGING_CONFIG } from '../constants/theme';
import { messagingApi } from '../services/api';
import { useMessagingStore } from '../store/messagingStore';
import type { Conversation, Message } from '../types';

const api = messagingApi as jest.Mocked<typeof messagingApi>;
const ME = { id: 'me', username: 'Moi', avatarUrl: null };
const OTHER = { id: 'other', username: 'Ana', avatarUrl: null };

function msg(id: string, minute: number, overrides: Partial<Message> = {}): Message {
  return {
    id,
    conversationId: 'c1',
    senderId: OTHER.id,
    content: `content ${id}`,
    createdAt: new Date(Date.UTC(2026, 8, 28, 10, minute)).toISOString(),
    readAt: null,
    sender: OTHER,
    ...overrides,
  };
}

function page(messages: Message[]) {
  return { messages, pagination: { offset: 0, limit: MESSAGING_CONFIG.pageSize, count: messages.length } };
}

const conversation: Conversation = {
  id: 'c1',
  createdAt: '2026-09-28T09:00:00.000Z',
  otherParticipant: OTHER,
  lastMessage: null,
  unreadCount: 0,
};

const store = () => useMessagingStore.getState();

beforeEach(() => {
  jest.clearAllMocks();
  store().reset();
  store().setMe(ME);
  useMessagingStore.setState({ conversations: { c1: conversation }, conversationsStatus: 'ready' });
  api.markRead.mockResolvedValue({ markedAsRead: 0 });
});

describe('sendMessage', () => {
  it('shows the message optimistically, then replaces it with the server version', async () => {
    let resolve!: (m: Message) => void;
    api.sendMessage.mockReturnValue(new Promise(r => { resolve = r; }));

    const sending = store().sendMessage('c1', '  hola  ');
    const optimistic = store().threads.c1.messages[0];
    expect(optimistic).toMatchObject({ content: 'hola', deliveryState: 'sending', senderId: ME.id });

    resolve(msg('real', 5, { senderId: ME.id, sender: ME, content: 'hola' }));
    await sending;

    expect(store().threads.c1.messages.map(m => m.id)).toEqual(['real']);
    expect(store().conversations.c1.lastMessage?.id).toBe('real');
  });

  it('does not duplicate when the socket echo arrives before the REST response', async () => {
    const confirmed = msg('real', 5, { senderId: ME.id, sender: ME, content: 'hola' });
    let resolve!: (m: Message) => void;
    api.sendMessage.mockReturnValue(new Promise(r => { resolve = r; }));

    const sending = store().sendMessage('c1', 'hola');
    store().receiveMessage(confirmed);
    resolve(confirmed);
    await sending;

    expect(store().threads.c1.messages.map(m => m.id)).toEqual(['real']);
  });

  it('marks the message as failed, and retry delivers it', async () => {
    api.sendMessage.mockRejectedValueOnce(new Error('offline'));
    await store().sendMessage('c1', 'hola');

    const failed = store().threads.c1.messages[0];
    expect(failed.deliveryState).toBe('failed');

    api.sendMessage.mockResolvedValueOnce(msg('real', 5, { senderId: ME.id, sender: ME, content: 'hola' }));
    await store().retryMessage('c1', failed.id);

    expect(store().threads.c1.messages.map(m => m.id)).toEqual(['real']);
  });

  it('ignores blank messages', async () => {
    await store().sendMessage('c1', '   ');
    expect(api.sendMessage).not.toHaveBeenCalled();
  });
});

describe('pagination', () => {
  it('requests older pages at an offset that includes messages received live', async () => {
    const firstPage = Array.from({ length: MESSAGING_CONFIG.pageSize }, (_, i) => msg(`m${i}`, 59 - i));
    api.getMessages.mockResolvedValueOnce(page(firstPage));
    await store().loadLatestMessages('c1');
    expect(store().threads.c1.hasMore).toBe(true);

    store().receiveMessage(msg('live', 59));

    api.getMessages.mockResolvedValueOnce(page([msg('older', 0)]));
    await store().loadOlderMessages('c1');

    expect(api.getMessages).toHaveBeenLastCalledWith('c1', MESSAGING_CONFIG.pageSize + 1, MESSAGING_CONFIG.pageSize);
    expect(store().threads.c1.hasMore).toBe(false);
    expect(store().threads.c1.messages.at(-1)?.id).toBe('older');
  });

  it('restarts the thread when a reconnect page does not overlap (missed messages)', async () => {
    api.getMessages.mockResolvedValueOnce(page([msg('a', 1)]));
    await store().loadLatestMessages('c1');

    api.getMessages.mockResolvedValueOnce(page([msg('z', 50)]));
    await store().loadLatestMessages('c1');

    expect(store().threads.c1.messages.map(m => m.id)).toEqual(['z']);
  });
});

describe('receiving', () => {
  it('increments unread for a closed conversation', () => {
    store().receiveMessage(msg('n', 1));
    expect(store().conversations.c1.unreadCount).toBe(1);
    expect(api.markRead).not.toHaveBeenCalled();
  });

  it('marks as read immediately when the conversation is open', () => {
    store().setOpenConversation('c1');
    store().receiveMessage(msg('n', 1));
    expect(store().conversations.c1.unreadCount).toBe(0);
    expect(api.markRead).toHaveBeenCalledWith('c1');
  });

  it('reloads the list for a conversation it does not know yet', () => {
    api.listConversations.mockResolvedValue([]);
    store().receiveMessage(msg('n', 1, { conversationId: 'unknown' }));
    expect(api.listConversations).toHaveBeenCalled();
  });

  it('resets unread when I read the conversation on another device', () => {
    useMessagingStore.setState({ conversations: { c1: { ...conversation, unreadCount: 4 } } });
    store().receiveReadReceipt({ conversationId: 'c1', readAt: new Date().toISOString(), readByUserId: ME.id });
    expect(store().conversations.c1.unreadCount).toBe(0);
  });
});

describe('typing', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('shows the indicator and hides it after the timeout', () => {
    store().receiveTyping({ conversationId: 'c1', userId: OTHER.id, username: 'Ana' });
    expect(store().typing.c1).toBe('Ana');

    jest.advanceTimersByTime(MESSAGING_CONFIG.typingTimeoutMs);
    expect(store().typing.c1).toBeUndefined();
  });

  it('hides the indicator as soon as the message arrives', () => {
    store().receiveTyping({ conversationId: 'c1', userId: OTHER.id, username: 'Ana' });
    store().receiveMessage(msg('n', 1));
    expect(store().typing.c1).toBeUndefined();
  });

  it('ignores my own typing events', () => {
    store().receiveTyping({ conversationId: 'c1', userId: ME.id, username: 'Moi' });
    expect(store().typing.c1).toBeUndefined();
  });
});

describe('loadConversations', () => {
  it('keeps the open conversation at zero unread', async () => {
    store().setOpenConversation('c1');
    api.listConversations.mockResolvedValue([{ ...conversation, unreadCount: 2 }]);
    await store().loadConversations();
    expect(store().conversations.c1.unreadCount).toBe(0);
  });

  it('keeps the previous list if a background refresh fails', async () => {
    api.listConversations.mockRejectedValue(new Error('offline'));
    await store().loadConversations();
    expect(store().conversationsStatus).toBe('ready');
    expect(store().conversations.c1).toBeDefined();
  });
});
