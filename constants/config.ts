// ─── App configuration ────────────────────────────────────────────────────────
// Business and behaviour constants. Visual tokens (colors, spacing, sizes) live
// in constants/theme.ts.

// ─── Quiz ─────────────────────────────────────────────────────────────────────

export const QUIZ_CONFIG = {
  questionsPerSession: 10,
  optionsPerQuestion: 4,
  masteryThreshold: 3,   // correct streak to reach "mastered"
} as const;

// ─── Messaging ────────────────────────────────────────────────────────────────

export const MESSAGING_CONFIG = {
  pageSize: 30,
  typingThrottleMs: 2000,  // min delay between two outgoing "typing" events
  typingTimeoutMs: 4000,   // hide the indicator if no event received for this long
  searchDebounceMs: 300,
  reconnectDelayMs: 3000,  // retry after an auth rejection (socket.io won't retry by itself)
} as const;
