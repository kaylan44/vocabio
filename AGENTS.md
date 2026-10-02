# AGENTS.md — Vocabio

> This file is meant for AI agents working on the project.
> It describes the architecture, conventions, rules to follow and extension points.
>
> **It must stay accurate**: any PR that changes the project structure (files/folders added,
> moved or removed), the dataset (`data/*`), the core types or the business rules updates
> this file in the same PR. Outdated agent docs are worse than no docs.

---

## Overview

**Vocabio** is a mobile vocabulary quiz app for Spanish ↔ French, with user accounts and
1:1 messaging.
- React Native + Expo (SDK 55) — targets iOS, Android and web
- Expo Router (file-based routing, typed routes)
- Strict TypeScript
- Zustand (state management)
- AsyncStorage (local progress persistence)
- React Native Reanimated 4 + react-native-worklets (animations)
- Supabase Auth (Google SSO — web only for now, guest mode available)
- Messaging: REST + Socket.io to `vocabio-backend` (Express, hosted on Railway)
- Tests: Jest + jest-expo + React Native Testing Library

---

## Stack and versions

| Package | Stable version to use |
|---|---|
| react | 19.2.0 |
| react-native | 0.83.6 |
| expo | ^55.0.0 |
| expo-router | ~55.0.16 |
| zustand | ^5.x |
| react-native-reanimated | 4.2.1 |
| react-native-worklets | 0.7.4 |
| @react-native-async-storage/async-storage | 2.2.0 |
| @supabase/supabase-js | ^2.x |
| socket.io-client | ^4.8.x |

---

## Project structure

```
vocabio2/
├── app/                        Screens — Expo Router (file-based)
│   ├── _layout.tsx             Root layout: AuthGate, loads progress + auth session, mounts the messaging connection
│   ├── login.tsx               Google sign-in or guest mode
│   ├── index.tsx               Home — pick FR→ES / ES→FR
│   ├── quiz.tsx                Quiz — active session
│   ├── result.tsx              Result — final score, replay
│   ├── vocab.tsx               Vocabulary list with per-word progress
│   ├── account.tsx             User profile, sign out
│   └── messages/
│       ├── _layout.tsx         Auth guard — redirects guests to /login
│       ├── index.tsx           Conversation list
│       ├── [id].tsx            Chat thread
│       └── new.tsx             User search / new conversation
│
├── components/
│   ├── ui/                     Generic reusable components
│   │   ├── Button.tsx          Animated button — variants: primary | secondary | ghost
│   │   ├── Badge.tsx           Colored text badge
│   │   ├── CounterBadge.tsx    Counter pill (unread)
│   │   ├── ProgressBar.tsx     Animated progress bar
│   │   ├── ScreenHeader.tsx    Screen header (back, title, leading/trailing slots)
│   │   ├── Avatar.tsx          User avatar (image or initials)
│   │   ├── Flag.tsx            FR / ES flag (assets/flags/)
│   │   ├── GoogleLogo.tsx      Google logo for the SSO button
│   │   └── MascotSprite.tsx    One mascot pose (run | hug | cool | happy) from assets/mascot/
│   ├── quiz/                   Quiz-specific components
│   │   ├── WordCard.tsx        Shows the word to translate + category + level
│   │   ├── AnswerTile.tsx      Answer tile with states and animations
│   │   ├── TileGrid.tsx        2x2 grid of AnswerTile
│   │   └── ResultMascot.tsx    Happy mascot head popping up above the score on the result card
│   ├── home/
│   │   ├── ModeCard.tsx        FR→ES or ES→FR mode selection card
│   │   └── HomeMascot.tsx      Animated mascot: runs in, idles, sunglasses on tap
│   └── messaging/
│       ├── ConversationRow.tsx Conversation list row
│       ├── MessageBubble.tsx   Message bubble
│       ├── ChatInput.tsx       Multiline input + send
│       ├── TypingIndicator.tsx "is typing" indicator
│       └── UserRow.tsx         User search result row
│
├── features/                   Pure logic — no UI, no store
│   ├── quiz/quizEngine.ts      Weighted selection, distractors, session building
│   └── messaging/
│       ├── messagingLogic.ts   Merge / dedupe / sort messages
│       └── format.ts           Date formatting
│
├── store/                      Zustand
│   ├── quizStore.ts            Current session state
│   ├── progressStore.ts        Persistent progress (AsyncStorage)
│   ├── authStore.ts            Auth status (loading | unauthenticated | guest | authenticated) + user
│   └── messagingStore.ts       Conversations, message threads, typing
│
├── hooks/                      Screens' entry points to the stores
│   ├── useQuizSession.ts       Quiz — single entry point for the quiz/vocab screens
│   ├── useAuth.ts              Auth
│   ├── useMessagingConnection.ts  Socket lifecycle (mounted in the root _layout)
│   ├── useConversations.ts     Conversation list
│   ├── useChat.ts              Chat thread + sending + typing
│   └── useUserSearch.ts        User search (debounced)
│
├── services/
│   ├── api.ts                  vocabio-backend REST client (Supabase JWT read on every call)
│   └── socket.ts               socket.io singleton (never connected at import time)
│
├── lib/
│   ├── supabase.ts             Supabase client (AsyncStorage on native, localStorage on web)
│   └── auth.ts                 Google Sign-In flow (web done, native to do)
│
├── data/                       Vocabulary dataset, one file per category
│   ├── vocabulary.ts           Aggregates the files below into VOCABULARY + helpers
│   ├── nouns.ts · verbs.ts · adjectives.ts · adverbs.ts · expressions.ts · pronouns.ts
│
├── types/index.ts              All the project's TypeScript types
│
├── constants/
│   ├── theme.ts                Design system — colors, typography, spacing, sizes, shadows
│   └── config.ts               Business configuration — QUIZ_CONFIG, MESSAGING_CONFIG, MASCOT_CONFIG
│
├── assets/
│   ├── flags/                  FR / ES flags
│   └── mascot/                 Mascot sprites (transparent PNG) — run, hug, cool, happy
│
├── __tests__/                  Jest tests (logic, stores, hooks, components)
└── __mocks__/                  Jest mocks (Supabase, AsyncStorage, Reanimated, worklets…)
```

---

## Core types

```typescript
type GrammarCategory = 'noun' | 'verb' | 'adjective' | 'adverb' | 'expression' | 'pronoun';
type WordLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

interface VocabWord {
  id: string;
  french: string;
  spanish: string;
  category: GrammarCategory;
  level: WordLevel;
}

type QuizMode = 'fr-es' | 'es-fr';

interface QuizQuestion {
  wordId: string;
  targetWord: string;
  correctAnswer: string;
  options: string[];
  category: GrammarCategory;
  level: WordLevel;
}

type TileState = 'idle' | 'selected-correct' | 'selected-wrong' | 'revealed-correct' | 'disabled';

type MasteryLevel = 'new' | 'seen' | 'mastered';
```

Auth and messaging types (`AuthUser`, `AuthStatus`, `ChatUser`, `Conversation`, `Message`…): see `types/index.ts`.

---

## Data flow

```
useQuizSession (hook)
    quizStore       active session state (questions, index, score, answer)
    progressStore   progress persisted per word and per mode
    navigation      Expo Router (push/replace)

Screens -> hooks only (never the stores directly)
Exception: app/_layout.tsx initialises progressStore and authStore at startup.
```

---

## Quiz logic rules

The numbers below are defined in `QUIZ_CONFIG` (`constants/config.ts`).

Session generation (quizEngine.ts):
- 10 questions per session
- Weighted selection: new (weight 10) > seen (weight 5) > mastered (weight 1)
- A word appears only once per session
- 3 distractors drawn from the same grammatical category as the target word

Progress (progressStore.ts):
- FR→ES and ES→FR have independent counters (keys `frEs` and `esF` — `esF` is a historical typo, do not rename it without a storage migration)
- mastered = 3 correct answers in a row (correctStreak >= 3)
- Progress is persisted right after each answer via AsyncStorage
- AsyncStorage key: @vocabio_progress_v1
- Progress is local to the device, including for signed-in users (not synced yet)

Session (quizStore.ts):
- selectAnswer is idempotent — ignores calls when hasAnswered === true
- nextQuestion advances the index; the screen navigates to /result on the last question
- resetSession fully clears the store — call it before each new session

---

## Authentication

- `authStore.init()` restores the Supabase session, then subscribes to `onAuthStateChange`.
- Guest mode: `@vocabio_guest` flag in AsyncStorage, cleared as soon as a Supabase session exists.
- `AuthGate` (`app/_layout.tsx`) redirects `unauthenticated` users to `/login`.
- Google Sign-In: implemented on web (OAuth redirect). On native, `performGoogleSignIn` returns
  an error until the PKCE flow (expo-auth-session + dev build) is in place.
- Environment variables: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`
  (public anon key, never the service_role key).

---

## 1:1 messaging

Backend: `vocabio-backend` (Express + Socket.io, Railway). URL via `EXPO_PUBLIC_API_URL` (default: Railway prod).
Restricted to authenticated users — `app/messages/_layout.tsx` redirects guests to `/login`.

Rules:
- Writes (send, mark read) go through REST only; the socket is for receiving (`new_message`, `message_read`, `user_typing`) and emitting `join_conversation` / `typing`.
- Every socket joins `user:<id>` on the server: the list receives messages without `join_conversation`.
- Messages are stored newest first (API order, `inverted` FlatList).
- Optimistic send with a `local-*` id, replaced by the REST response or the socket echo (whichever comes first) — see `confirmMessage`.
- Pagination by offset = number of confirmed messages in memory (includes those received live).
- On every (re)connection and return to foreground: reload the list and the open thread.
- Delays, page size and throttling: `MESSAGING_CONFIG` (`constants/config.ts`).

---

## Design system (constants/theme.ts)

Always use the theme tokens, never hardcoded values.
`theme.ts` only holds visual values; behaviour constants go in `constants/config.ts`.

```typescript
Colors.primary          #4A7CF7 — main blue
Colors.success          #4DB87A — correct answer green
Colors.error            #F26B5E — wrong answer red
Colors.background       #F8F9FC — app background
Colors.surface          #FFFFFF — cards and tiles
Colors.textPrimary      #1A1D2E
Colors.textSecondary    #6B7280
Colors.textTertiary     #9CA3AF

Spacing.xs / sm / md / lg / xl / xxl   4 / 8 / 16 / 24 / 32 / 48
Radius.sm / md / lg / xl / full        8 / 12 / 16 / 24 / 999
Typography.sizes.xs -> display          11 -> 36
Typography.weights.regular -> extrabold '400' -> '800'
Shadow.* · AvatarSize.* · ControlSize.*  shadows, avatars, icons, flags, max widths…
MascotSize.*                             mascot sprite heights and motion distances
```

---

## Mascot

Sprites live in `assets/mascot/` and are only rendered through `MascotSprite` (`components/ui/`).

- Home (`HomeMascot`): runs in from the left on mount, then floats and breathes in a loop.
  A tap swaps to the sunglasses pose for `MASCOT_CONFIG.coolMs`, then back to idle.
- Result (`ResultMascot`): inside the result card, right above the score. The happy head rises
  after the card entrance, wiggles once and stays. Shown for every score.
- Timings are in `MASCOT_CONFIG` (`constants/config.ts`), sizes and distances in `MascotSize`
  (`constants/theme.ts`).
- Both components honour the system "reduce motion" setting (`useReducedMotion`): the final
  pose is shown without the entrance.
- Replacing a sprite: keep the file name, and update its `ratio` in `MascotSprite.tsx` if the
  image dimensions change.

---

## Code conventions

- Components: function components only, no class components
- Styles: StyleSheet.create() in each file, never inline styles except in exceptional cases
- Animations: react-native-reanimated only — no Animated from React Native core
- Navigation: only via Expo Router's useRouter() — never navigate from the stores
- Store access: only from hooks (`hooks/`) or `app/_layout.tsx` — screens never touch the stores directly
- Pure logic (testable without React) goes in `features/`
- Types: all in types/index.ts — no inline types in components except local prop interfaces
- Word IDs: category prefix + 3 digits, continuous sequence with no gaps (see table below)

---

## Vocabulary dataset

630 words split across `data/*.ts`, aggregated by `data/vocabulary.ts`:

| Category | File | IDs | A1 | A2 | B1 | Total |
|---|---|---|---|---|---|---|
| noun | nouns.ts | n001–n200 | 80 | 70 | 50 | 200 |
| verb | verbs.ts | v001–v100 | 50 | 50 | — | 100 |
| adjective | adjectives.ts | a001–a150 | 75 | 75 | — | 150 |
| adverb | adverbs.ts | d001–d100 | 50 | 50 | — | 100 |
| expression | expressions.ts | e001–e050 | 50 | — | — | 50 |
| pronoun | pronouns.ts | p001–p030 | 30 | — | — | 30 |
| **Total** | | | **335** | **245** | **50** | **630** |

To add words: add them to the category file, continue the ID sequence
(e.g. the next noun is `n201`) and **update this table**.
Never renumber an existing ID: persisted progress refers to it.

---

## Planned extension points

| Feature | Target file | Notes |
|---|---|---|
| Dark mode | constants/theme.ts | Add DarkColors, useTheme() hook |
| Sounds / pronunciation | features/audio/ | expo-speech (TTS) or expo-audio |
| Streaks | store/progressStore.ts | Add currentStreak, bestStreak to UserProgress |
| Spaced repetition (SM-2) | features/quiz/quizEngine.ts | Replace the weight system with the SM-2 algorithm |
| Level filter | app/index.tsx + quizEngine.ts | Pass the chosen level to buildQuizSession() |
| Native Google Sign-In | lib/auth.ts | expo-auth-session (PKCE) + dev build |
| Progress sync | store/progressStore.ts + backend | Sync with Supabase for signed-in users |
| More languages | types/index.ts + data/ | Add a language field to VocabWord |

---

## Known errors and fixes

| Error | Cause | Fix |
|---|---|---|
| Cannot find module react-native-worklets/plugin | react-native-worklets not installed | npm install react-native-worklets@0.7.4 |
| ERESOLVE peer deps | Version conflict | npm install --legacy-peer-deps |
| libnspr4.so cannot open shared object file | React Native DevTools missing on Linux | Safe to ignore, or sudo apt-get install libnspr4 |
| "Google Sign-In not yet configured for native." | Native flow not implemented | Test sign-in on web, or use guest mode |

---

## Useful commands

```bash
npx expo start --clear
npx expo start --ios
npx expo start --android
npx tsc --noEmit
npm test
rm -rf node_modules package-lock.json && npm install --legacy-peer-deps
```
