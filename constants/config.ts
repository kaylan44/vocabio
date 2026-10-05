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

// ─── Mascot ───────────────────────────────────────────────────────────────────

export const MASCOT_CONFIG = {
  enterMs: 1400,        // Home: run in from the left
  hopMs: 190,           // one half-hop (up or down) while running
  floatMs: 1600,        // idle: one way up or down
  breatheMs: 2200,      // idle: one breath in or out
  coolMs: 2000,         // how long the sunglasses stay on after a tap
  resultDelayMs: 600,   // Result: wait for the card entrance before popping up
  resultRiseMs: 400,    // Result: head is up, start the wiggle
} as const;

// ─── Articles ─────────────────────────────────────────────────────────────────

export const ARTICLES_CONFIG = {
  pageSize: 20,         // articles per request (the backend accepts up to 50)
  rewindSeconds: 10,    // jump of the "back" button of the audio player
  excerptLines: 3,      // lines of excerpt shown on a list card
} as const;
