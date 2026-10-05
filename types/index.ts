// ─── Core vocabulary types ───────────────────────────────────────────────────

export type GrammarCategory = 'noun' | 'verb' | 'adjective' | 'adverb' | 'expression' | 'pronoun';

export type WordLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export interface VocabWord {
  id: string;
  french: string;
  spanish: string;
  category: GrammarCategory;
  level: WordLevel;
  // Future: audio, example sentences, tags
}

// ─── Quiz types ───────────────────────────────────────────────────────────────

export type QuizMode = 'fr-es' | 'es-fr';

export interface QuizQuestion {
  wordId: string;
  targetWord: string;      // The word displayed to the user
  correctAnswer: string;   // The correct translation
  options: string[];       // 4 shuffled options
  category: GrammarCategory;
  level: WordLevel;
}

export type TileState = 'idle' | 'selected-correct' | 'selected-wrong' | 'revealed-correct' | 'disabled';

export interface QuizSession {
  id: string;                    // UUID — idempotency key when the result is sent to the backend
  mode: QuizMode;
  questions: QuizQuestion[];
  currentIndex: number;
  score: number;
  answers: (boolean | null)[];  // null = not answered yet
  usedWordIds: string[];         // Prevent repeats within session
}

// ─── Progress types ───────────────────────────────────────────────────────────

export type MasteryLevel = 'new' | 'seen' | 'mastered';

export interface WordProgress {
  wordId: string;
  // Per-mode stats — FR→ES and ES→FR tracked independently
  frEs: WordModeProgress;
  esF: WordModeProgress;
}

export interface WordModeProgress {
  mastery: MasteryLevel;
  correctStreak: number;
  totalSeen: number;
  totalCorrect: number;
  lastSeen: number;  // timestamp
}

// Shape mirrors the vocabio-backend API (/quiz-sessions/word-progress): one row per word
// and per mode. The backend sends no mastery level, it is derived from the counters.
export interface WordProgressRow {
  wordId: string;
  mode: QuizMode;
  correctStreak: number;
  totalSeen: number;
  totalCorrect: number;
  lastSeenAt: string;  // ISO date
}

// ─── Result types ─────────────────────────────────────────────────────────────

export interface SessionResult {
  score: number;
  total: number;
  mode: QuizMode;
}

// ─── Quiz statistics types ────────────────────────────────────────────────────
// Shapes mirror the vocabio-backend API (/quiz-sessions).

export interface QuizAnswerPayload {
  wordId: string;
  category: GrammarCategory;
  level: WordLevel;
  isCorrect: boolean;
}

export interface QuizSessionPayload {
  id: string;
  mode: QuizMode;
  answers: QuizAnswerPayload[];  // in quiz order
}

// The score is computed by the server.
export interface SavedQuizSession {
  id: string;
  mode: QuizMode;
  score: number;
  total: number;
  createdAt: string;
}

export interface QuizStats {
  totalSessions: number;
  totalAnswers: number;
  totalCorrect: number;
  accuracy: number | null;        // 0..1, null when there is no data
  lastSessionAt: string | null;
  byMode: { mode: QuizMode; sessions: number; answers: number; correct: number; accuracy: number }[];
  byCategory: { category: GrammarCategory; answers: number; correct: number; accuracy: number }[];
  byLevel: { level: WordLevel; answers: number; correct: number; accuracy: number }[];
  mostMissedWords: { wordId: string; wrong: number }[];  // top 10, ids only
}

// ─── Auth types ───────────────────────────────────────────────────────────────

export interface AuthUser {
  id: string;
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  provider: string | null;
  createdAt: string | null;
}

export type AuthStatus = 'loading' | 'authenticated' | 'guest' | 'unauthenticated';

// ─── Messaging types ──────────────────────────────────────────────────────────
// Shapes mirror the vocabio-backend API. Dates are ISO strings (JSON-serialized).

export interface ChatUser {
  id: string;
  username: string;
  avatarUrl: string | null;
}

export interface LastMessage {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
}

export interface Conversation {
  id: string;
  createdAt: string;
  otherParticipant: ChatUser | null;
  lastMessage: LastMessage | null;
  unreadCount: number;
}

// Local-only state for optimistic messages. Absent = confirmed by the server.
export type DeliveryState = 'sending' | 'failed';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  readAt: string | null;
  sender: ChatUser;
  deliveryState?: DeliveryState;
}

export interface MessagesPage {
  messages: Message[];
  pagination: { offset: number; limit: number; count: number };
}

// POST /conversations returns the raw Prisma shape, not a Conversation.
export interface CreateConversationResponse {
  id: string;
  createdAt: string;
  participants: { conversationId: string; userId: string; user: ChatUser }[];
}

export interface MessageReadEvent {
  conversationId: string;
  readAt: string;
  readByUserId: string;
}

export interface TypingEvent {
  conversationId: string;
  userId: string;
  username: string;
}

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

// Messages are stored newest-first, matching the API order and the inverted chat list.
export interface ChatThread {
  messages: Message[];
  status: LoadStatus;
  hasMore: boolean;
  loadingOlder: boolean;
}

// ─── Article types ────────────────────────────────────────────────────────────
// Shapes mirror the vocabio-backend API (/articles). Dates are ISO strings.

export type ArticleLevel = 'easy' | 'intermediate';

// 'all' only exists in the app: it means "no level filter" on the list screen.
export type ArticleLevelFilter = ArticleLevel | 'all';

// A piece of a paragraph. `gloss` is the source's explanation of the phrase, in English.
export interface ArticleSegment {
  text: string;
  gloss?: string;
}

export interface ArticleBlock {
  type: 'paragraph';
  segments: ArticleSegment[];
}

export interface ArticleSummary {
  id: string;
  source: string;
  lang: string;
  level: ArticleLevel | null;
  title: string;
  excerpt: string;
  url: string;                      // original article, shown as attribution
  publishedAt: string;
  audioDurationSec: number | null;
  hasAudio: boolean;                // false: the audio route answers 404
}

export interface Article extends ArticleSummary {
  content: ArticleBlock[];          // plain text, never HTML
}

export interface ArticlesPage {
  articles: ArticleSummary[];
  pagination: { offset: number; limit: number; count: number };
}

// Position of a glossed phrase inside an article: paragraph index, then segment index.
export interface GlossPosition {
  block: number;
  segment: number;
}
