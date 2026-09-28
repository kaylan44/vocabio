import {
  applyMessageToConversation,
  applyReadReceipt,
  confirmMessage,
  createLocalId,
  isLocalMessage,
  mergeMessages,
  nextPageOffset,
  overlapsExisting,
  sortConversations,
  toConversation,
  totalUnread,
} from '../features/messaging/messagingLogic';
import type { Conversation, Message } from '../types';

const ME = 'me';
const OTHER = 'other';

function msg(id: string, minute: number, overrides: Partial<Message> = {}): Message {
  return {
    id,
    conversationId: 'c1',
    senderId: OTHER,
    content: `content ${id}`,
    createdAt: `2026-09-28T10:${String(minute).padStart(2, '0')}:00.000Z`,
    readAt: null,
    sender: { id: OTHER, username: 'Other', avatarUrl: null },
    ...overrides,
  };
}

function conv(id: string, lastMinute: number | null, unreadCount = 0): Conversation {
  return {
    id,
    createdAt: '2026-09-28T09:00:00.000Z',
    otherParticipant: { id: OTHER, username: 'Other', avatarUrl: null },
    lastMessage: lastMinute === null ? null : { id: `m-${id}`, content: 'x', createdAt: msg('x', lastMinute).createdAt, senderId: OTHER },
    unreadCount,
  };
}

describe('mergeMessages', () => {
  it('deduplicates by id and sorts newest first', () => {
    const result = mergeMessages([msg('a', 1), msg('b', 2)], [msg('b', 2), msg('c', 3)]);
    expect(result.map(m => m.id)).toEqual(['c', 'b', 'a']);
  });

  it('keeps optimistic messages on top of confirmed ones', () => {
    const local = msg(createLocalId(), 0, { deliveryState: 'sending' });
    const result = mergeMessages([local], [msg('a', 5)]);
    expect(result[0].id).toBe(local.id);
  });
});

describe('nextPageOffset', () => {
  it('counts only server-confirmed messages', () => {
    const local = msg(createLocalId(), 9, { deliveryState: 'sending' });
    expect(nextPageOffset([local, msg('a', 1), msg('b', 2)])).toBe(2);
  });
});

describe('overlapsExisting', () => {
  it('is true when the page shares an id with the thread', () => {
    expect(overlapsExisting([msg('a', 1)], [msg('b', 2), msg('a', 1)])).toBe(true);
  });

  it('is false when a whole page was missed', () => {
    expect(overlapsExisting([msg('a', 1)], [msg('z', 50)])).toBe(false);
  });

  it('is true when either side is empty (nothing to lose)', () => {
    expect(overlapsExisting([], [msg('a', 1)])).toBe(true);
  });
});

describe('confirmMessage', () => {
  const localId = 'local-1';
  const pending = msg(localId, 5, { senderId: ME, content: 'hola', deliveryState: 'sending' });
  const confirmed = msg('real-1', 5, { senderId: ME, content: 'hola' });

  it('replaces the optimistic message by local id (REST response)', () => {
    const result = confirmMessage([pending], confirmed, localId);
    expect(result).toEqual([confirmed]);
  });

  it('replaces by matching content when the socket echo arrives first', () => {
    const result = confirmMessage([pending], confirmed);
    expect(result).toEqual([confirmed]);
  });

  it('drops the optimistic copy without duplicating when both arrive', () => {
    const afterEcho = confirmMessage([pending], confirmed);
    const afterRest = confirmMessage(afterEcho, confirmed, localId);
    expect(afterRest).toEqual([confirmed]);
  });

  it('matches the oldest pending message when the same text is sent twice', () => {
    const first = msg('local-a', 1, { senderId: ME, content: 'hola', deliveryState: 'sending' });
    const second = msg('local-b', 2, { senderId: ME, content: 'hola', deliveryState: 'sending' });
    const result = confirmMessage([second, first], confirmed);
    expect(result.map(m => m.id)).toEqual(['local-b', 'real-1']);
  });

  it('does not match failed messages', () => {
    const failed = { ...pending, deliveryState: 'failed' as const };
    const result = confirmMessage([failed], confirmed);
    expect(result.map(m => m.id)).toEqual([localId, 'real-1']);
  });
});

describe('applyMessageToConversation', () => {
  it('updates lastMessage and increments unread for a message from the other user', () => {
    const result = applyMessageToConversation(conv('c1', 1), msg('n', 10), ME, false);
    expect(result.lastMessage?.id).toBe('n');
    expect(result.unreadCount).toBe(1);
  });

  it('does not increment unread when the conversation is open', () => {
    expect(applyMessageToConversation(conv('c1', 1), msg('n', 10), ME, true).unreadCount).toBe(0);
  });

  it('does not increment unread for my own messages', () => {
    const mine = msg('n', 10, { senderId: ME });
    expect(applyMessageToConversation(conv('c1', 1), mine, ME, false).unreadCount).toBe(0);
  });

  it('keeps a newer lastMessage when an older message arrives late', () => {
    const result = applyMessageToConversation(conv('c1', 30), msg('old', 10), ME, true);
    expect(result.lastMessage?.id).toBe('m-c1');
  });
});

describe('applyReadReceipt', () => {
  it('marks my confirmed messages sent before readAt as read', () => {
    const mine = msg('a', 1, { senderId: ME });
    const later = msg('b', 20, { senderId: ME });
    const theirs = msg('c', 2);
    const readAt = msg('x', 10).createdAt;
    const result = applyReadReceipt([later, theirs, mine], ME, readAt);
    expect(result.find(m => m.id === 'a')?.readAt).toBe(readAt);
    expect(result.find(m => m.id === 'b')?.readAt).toBeNull();
    expect(result.find(m => m.id === 'c')?.readAt).toBeNull();
  });
});

describe('conversation list helpers', () => {
  it('sorts by last message and hides empty conversations', () => {
    const result = sortConversations([conv('old', 1), conv('empty', null), conv('new', 30)]);
    expect(result.map(c => c.id)).toEqual(['new', 'old']);
  });

  it('sums unread counts', () => {
    expect(totalUnread([conv('a', 1, 2), conv('b', 2, 3)])).toBe(5);
  });

  it('maps the raw POST /conversations response', () => {
    const other = { id: OTHER, username: 'Other', avatarUrl: null };
    const result = toConversation(
      {
        id: 'c1',
        createdAt: '2026-09-28T09:00:00.000Z',
        participants: [
          { conversationId: 'c1', userId: ME, user: { id: ME, username: 'Me', avatarUrl: null } },
          { conversationId: 'c1', userId: OTHER, user: other },
        ],
      },
      ME,
    );
    expect(result).toEqual({
      id: 'c1',
      createdAt: '2026-09-28T09:00:00.000Z',
      otherParticipant: other,
      lastMessage: null,
      unreadCount: 0,
    });
  });
});

describe('local ids', () => {
  it('are recognisable and unique', () => {
    const a = createLocalId();
    const b = createLocalId();
    expect(a).not.toBe(b);
    expect(isLocalMessage(msg(a, 1))).toBe(true);
    expect(isLocalMessage(msg('uuid', 1))).toBe(false);
  });
});
