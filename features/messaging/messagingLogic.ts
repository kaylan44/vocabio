// Pure messaging logic — no UI, no store, no network.
// Messages arrive from three sources (REST pages, REST send response, socket events)
// in any order, so every merge here must be idempotent.

import type { Conversation, CreateConversationResponse, Message } from '../../types';

const LOCAL_ID_PREFIX = 'local-';

export function createLocalId(): string {
  return `${LOCAL_ID_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function isLocalMessage(message: Message): boolean {
  return message.id.startsWith(LOCAL_ID_PREFIX);
}

function byNewestFirst(a: { createdAt: string }, b: { createdAt: string }): number {
  return a.createdAt < b.createdAt ? 1 : a.createdAt > b.createdAt ? -1 : 0;
}

/**
 * Merges incoming server messages into a newest-first list, deduplicated by id.
 * Optimistic messages keep their position: they sit at the top until confirmed.
 */
export function mergeMessages(existing: Message[], incoming: Message[]): Message[] {
  const byId = new Map<string, Message>();
  for (const m of existing) byId.set(m.id, m);
  for (const m of incoming) byId.set(m.id, m);

  const all = [...byId.values()];
  const local = all.filter(isLocalMessage);
  const confirmed = all.filter(m => !isLocalMessage(m)).sort(byNewestFirst);
  return [...local.sort(byNewestFirst), ...confirmed];
}

/**
 * The API paginates by offset. Counting only server-confirmed messages we hold
 * (including those received live) keeps the offset aligned with the server even
 * when new messages shift the list while the user scrolls back.
 */
export function nextPageOffset(messages: Message[]): number {
  return messages.filter(m => !isLocalMessage(m)).length;
}

/**
 * After a reconnection the first page may not overlap what we have (more than a
 * page was missed). Merging would leave a silent gap, so we start over instead.
 */
export function overlapsExisting(existing: Message[], page: Message[]): boolean {
  if (existing.length === 0 || page.length === 0) return true;
  const ids = new Set(existing.map(m => m.id));
  return page.some(m => ids.has(m.id));
}

/**
 * Replaces an optimistic message by its confirmed version.
 * Used both for the REST response (we know the local id) and for the socket echo
 * (we don't: match the oldest pending message with the same content).
 * Whichever arrives second finds nothing to replace and is deduplicated by id.
 */
export function confirmMessage(messages: Message[], confirmed: Message, localId?: string): Message[] {
  const alreadyThere = messages.some(m => m.id === confirmed.id);

  let targetId = localId;
  if (!targetId) {
    const pending = messages
      .filter(m => isLocalMessage(m) && m.deliveryState === 'sending' && m.content === confirmed.content)
      .sort(byNewestFirst);
    targetId = pending[pending.length - 1]?.id;
  }

  const withoutTarget = targetId ? messages.filter(m => m.id !== targetId) : messages;
  return alreadyThere ? withoutTarget : mergeMessages(withoutTarget, [confirmed]);
}

export function setDeliveryState(
  messages: Message[],
  localId: string,
  deliveryState: Message['deliveryState'],
): Message[] {
  return messages.map(m => (m.id === localId ? { ...m, deliveryState } : m));
}

/** Applies a new message to the conversation summary shown in the list. */
export function applyMessageToConversation(
  conversation: Conversation,
  message: Message,
  myUserId: string,
  isOpen: boolean,
): Conversation {
  const isNewer = !conversation.lastMessage || conversation.lastMessage.createdAt <= message.createdAt;
  const countsAsUnread = message.senderId !== myUserId && !isOpen;

  return {
    ...conversation,
    lastMessage: isNewer
      ? { id: message.id, content: message.content, createdAt: message.createdAt, senderId: message.senderId }
      : conversation.lastMessage,
    unreadCount: countsAsUnread ? conversation.unreadCount + 1 : conversation.unreadCount,
  };
}

/** Marks my own messages as read once the other participant has read the conversation. */
export function applyReadReceipt(messages: Message[], myUserId: string, readAt: string): Message[] {
  return messages.map(m =>
    m.senderId === myUserId && !m.readAt && !isLocalMessage(m) && m.createdAt <= readAt
      ? { ...m, readAt }
      : m,
  );
}

/**
 * Conversations without messages are hidden: POST /conversations creates one as soon
 * as a user is picked in search, even if nothing is ever sent.
 */
export function sortConversations(conversations: Conversation[]): Conversation[] {
  return conversations
    .filter(c => c.lastMessage !== null)
    .sort((a, b) => byNewestFirst(a.lastMessage!, b.lastMessage!));
}

export function totalUnread(conversations: Conversation[]): number {
  return conversations.reduce((sum, c) => sum + c.unreadCount, 0);
}

export function toConversation(raw: CreateConversationResponse, myUserId: string): Conversation {
  const other = raw.participants.find(p => p.userId !== myUserId);
  return {
    id: raw.id,
    createdAt: raw.createdAt,
    otherParticipant: other?.user ?? null,
    lastMessage: null,
    unreadCount: 0,
  };
}
