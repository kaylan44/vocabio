# AGENTS.md — Vocabio

> This file is meant for AI agents working on the project.
> It describes the architecture, conventions, rules to follow and extension points.
>
> **It must stay accurate**: any PR that changes the project structure (files/folders added,
> moved or removed), the dataset (`data/*`), the core types or the business rules updates
> this file in the same PR. Outdated agent docs are worse than no docs.

---

## Overview

**Vocabio** is a mobile vocabulary quiz app for French speakers learning Spanish or
Indonesian, with user accounts and 1:1 messaging.
- React Native + Expo (SDK 55) — targets iOS, Android and web
- Expo Router (file-based routing, typed routes)
- Strict TypeScript
- Zustand (state management)
- AsyncStorage (guest flag and Supabase session only — no app data is stored on the device)
- React Native Reanimated 4 + react-native-worklets (animations)
- Supabase Auth (Google SSO — web only for now, guest mode available)
- Messaging: REST + Socket.io to `vocabio-backend` (Express, hosted on Railway)
- Quiz statistics: finished quizzes sent to `vocabio-backend` (REST), stats shown on the account screen
- Word progress: computed by `vocabio-backend` from the finished quizzes, loaded at sign-in and after each finished quiz — signed-in users only
- Articles: easy Spanish news with audio, served by `vocabio-backend` (REST) — signed-in users only, audio on web only for now
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
| expo-crypto | ~55.0.x |
| expo-audio | ~55.0.x |
| expo-asset | ~55.0.x (peer dependency of expo-audio, must be a direct dependency) |

---

## Project structure

```
vocabio2/
├── app/                        Screens — Expo Router (file-based)
│   ├── _layout.tsx             Root layout: AuthGate, loads the auth session, mounts the messaging connection and the progress sync
│   ├── login.tsx               Google sign-in or guest mode, then /language
│   ├── index.tsx               Redirects to /language (the language is chosen at each app start)
│   ├── language.tsx            Language screen — one large card per language
│   ├── [lang]/                 Screens of one language: /es/…, /id/…
│   │   ├── _layout.tsx         Guard: an unknown language → /language; mirrors the language in languageStore
│   │   ├── index.tsx           Home of the language — its two modes, vocabulary, articles (Spanish only), "Changer de langue"
│   │   ├── quiz.tsx            Quiz — active session
│   │   ├── result.tsx          Result — final score, replay
│   │   └── vocab.tsx           Vocabulary list of the language with per-word progress
│   ├── account.tsx             User profile, quiz statistics of the current language, sign out
│   ├── articles/
│   │   ├── _layout.tsx         Auth guard — redirects guests to /login
│   │   ├── index.tsx           Article list with level filter and "load more"
│   │   └── [id].tsx            Article reader: text, tap-to-translate, audio player at the bottom
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
│   │   ├── Flag.tsx            FR / ES / ID flag (assets/flags/)
│   │   ├── GoogleLogo.tsx      Google logo for the SSO button
│   │   └── MascotSprite.tsx    One mascot pose (run | hug | cool | happy) from assets/mascot/
│   ├── quiz/                   Quiz-specific components
│   │   ├── WordCard.tsx        Shows the word to translate + category + level
│   │   ├── AnswerTile.tsx      Answer tile with states and animations
│   │   ├── TileGrid.tsx        2x2 grid of AnswerTile
│   │   └── ResultMascot.tsx    Happy mascot head popping up above the score on the result card
│   ├── home/
│   │   ├── HomeMascot.tsx      Animated mascot: runs in, idles, sunglasses on tap
│   │   ├── ModeCard.tsx        Mode tile (two side by side): French → target in blue, target → French in orange
│   │   ├── HomeLinkRow.tsx     White row to Articles / Vocabulary (illustration, title, subtitle, chevron)
│   │   └── LanguageCard.tsx    Language screen card (flag, name, number of words)
│   ├── account/
│   │   └── StatsCard.tsx       Quiz statistics card (loading / error / empty / data)
│   ├── articles/
│   │   ├── ArticleRow.tsx      List card: level, date, title, excerpt, listening time
│   │   ├── LevelBadge.tsx      Level pill (easy / intermediate), one tint per level
│   │   ├── LevelFilter.tsx     Level pills above the list (all / easy / intermediate)
│   │   ├── ArticleBody.tsx     Article text; glossed phrases open their translation on tap
│   │   ├── ArticleAudio.tsx    "Listen" card: download states, then the expo-audio player
│   │   └── AudioPlayerView.tsx Player controls only (rewind, play / pause, progress, times)
│   └── messaging/
│       ├── ConversationRow.tsx Conversation list row
│       ├── MessageBubble.tsx   Message bubble
│       ├── ChatInput.tsx       Multiline input + send
│       ├── TypingIndicator.tsx "is typing" indicator
│       └── UserRow.tsx         User search result row
│
├── features/                   Pure logic — no UI, no store
│   ├── quiz/quizEngine.ts      Weighted selection, distractors, session building, backend payload
│   ├── articles/
│   │   ├── articleLogic.ts     Page merge, gloss toggle, playback progress and seek maths
│   │   └── format.ts           Level and source labels, durations, dates
│   └── messaging/
│       ├── messagingLogic.ts   Merge / dedupe / sort messages
│       └── format.ts           Date formatting
│
├── store/                      Zustand
│   ├── quizStore.ts            Current session state
│   ├── progressStore.ts        Per-word progress: read-only in-memory copy of what the backend computes
│   ├── authStore.ts            Auth status (loading | unauthenticated | guest | authenticated) + user
│   ├── messagingStore.ts       Conversations, message threads, typing
│   └── languageStore.ts        Last language visited, for the screens outside app/[lang]/ (memory only)
│
├── hooks/                      Screens' entry points to the stores
│   ├── useQuizSession.ts       Quiz — single entry point for the quiz/vocab screens
│   ├── useQuizStats.ts         Quiz statistics from the backend, per language (reloaded on screen focus)
│   ├── useLanguage.ts          useRouteLanguage (screens under app/[lang]/) · useCurrentLanguage (other screens)
│   ├── useProgressSync.ts      Loads the progress at sign-in, empties it at sign-out (mounted in the root _layout)
│   ├── useArticles.ts          Article list: level filter, pagination
│   ├── useArticle.ts           One article with its text
│   ├── useArticleAudio.ts      Article audio, downloaded on demand as a blob: URL (web only)
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
├── data/                       Vocabulary dataset, one folder per language, one file per category
│   ├── vocabulary.ts           Aggregates the language folders: getVocabulary(lang), VOCABULARY (all languages) + helpers
│   ├── es/                     Spanish: nouns.ts · verbs.ts · adjectives.ts · adverbs.ts · expressions.ts · pronouns.ts
│   └── id/                     Indonesian: nouns.ts · verbs.ts · adjectives.ts · adverbs.ts · numbers.ts · expressions.ts · pronouns.ts
│
├── types/index.ts              All the project's TypeScript types
│
├── constants/
│   ├── theme.ts                Design system — colors, typography, spacing, sizes, shadows
│   ├── config.ts               Business configuration — QUIZ_CONFIG, MESSAGING_CONFIG, MASCOT_CONFIG, ARTICLES_CONFIG
│   └── languages.ts            LANGUAGES (label, copy, modes, hasArticles), MODES (language, direction), getModeLabel
│
├── assets/
│   ├── flags/                  FR / ES / ID flags (flagcdn.com, 160px)
│   ├── illustrations/          Home link illustrations — article, vocab (SVG source + 3x transparent PNG, only the PNG is bundled)
│   └── mascot/                 Mascot sprites (transparent PNG) — run, hug, cool, happy
│
├── __tests__/                  Jest tests (logic, stores, hooks, components)
└── __mocks__/                  Jest mocks (Supabase, AsyncStorage, Reanimated, worklets, expo-crypto, expo-audio…)
```

---

## Core types

```typescript
type Language = 'es' | 'id';   // language being learnt — also the data/ folder, the id prefix and the URL segment
type FlagCountry = 'fr' | Language;
type GrammarCategory = 'noun' | 'verb' | 'adjective' | 'adverb' | 'expression' | 'pronoun' | 'number';
type WordLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

interface VocabWord {
  id: string;           // 'es-n001': language prefix, category letter, 3 digits
  french: string;
  target: string;       // word in the language being learnt (no language field: see the id)
  category: GrammarCategory;
  level: WordLevel;
  oppositeId?: string;  // adjectives: id of the opposite adjective, same language
}

type QuizMode = 'fr-es' | 'es-fr' | 'fr-id' | 'id-fr';

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

Auth, messaging, quiz statistics, word progress and article types (`AuthUser`, `AuthStatus`,
`ChatUser`, `Conversation`, `Message`, `QuizSessionPayload`, `QuizStats`, `WordProgressRow`,
`ArticleSummary`, `Article`, `ArticleBlock`…): see `types/index.ts`.

---

## Data flow

```
useQuizSession (hook)
    quizStore       active session state (questions, index, score, answer)
    progressStore   progress per word and per mode (read-only copy of what the backend computes)
    authStore       auth status — decides whether the finished session is sent
    quizApi         POST /quiz-sessions when a signed-in user finishes a quiz,
                    then progressStore.loadProgress() to read the updated progress
    navigation      Expo Router (push/replace)

useProgressSync (hook, mounted in app/_layout.tsx)
    authStore       authenticated -> progressStore.loadProgress() (GET /quiz-sessions/word-progress)
                    sign-out or user change -> progressStore.clearProgress()

useRouteLanguage (hook, screens under app/[lang]/)
    URL             the [lang] segment, validated by app/[lang]/_layout.tsx

useCurrentLanguage (hook, account, messages, app/[lang]/_layout.tsx)
    languageStore   last language visited (set by the [lang] layout), null after a direct load

Screens -> hooks only (never the stores directly)
Exception: app/_layout.tsx initialises authStore at startup.
```

---

## Languages

The languages being learnt are described in `constants/languages.ts`; screens and
components read it instead of testing a language or a mode in their code.

| Language | Modes | Articles | Data | IDs |
|---|---|---|---|---|
| es — Espagnol | fr-es, es-fr | yes | data/es/ | es-… |
| id — Indonésien | fr-id, id-fr | no | data/id/ | id-… |

Rules:
- **The current language is carried by the URL** (`/es/…`, `/id/…`). `/` and the end of the
  sign-in or guest choice lead to `/language`, at each app start: the choice is never
  stored on the device. "Changer de langue" on the home screen goes back to `/language`.
- `app/[lang]/_layout.tsx` redirects any other segment to `/language` before a screen
  mounts, and mirrors the language into `languageStore`.
- Shared screens (account, messages) read the last language visited through
  `useCurrentLanguage`: the account shows the statistics of that language, and "back" goes
  to its home. After a direct load of one of them it is `null`: statistics of every
  language together, back to `/language`.
- The language of a word is given by its folder and its id prefix — there is no
  `language` field. The language of a quiz is given by its mode (`MODES[mode].language`).
- Articles are Spanish only (`hasArticles`): the row is shown on the Spanish home only.
- New routes are not in the generated typed routes until `expo start` runs: they are
  passed as `'/es/quiz' as never`, like the other routes added after the last generation.

---

## Quiz logic rules

The numbers below are defined in `QUIZ_CONFIG` (`constants/config.ts`).

Session generation (quizEngine.ts):
- 10 questions per session
- Words drawn from the vocabulary of the mode's language only (`getVocabulary(MODES[mode].language)`)
- Weighted selection: new (weight 10) > seen (weight 5) > mastered (weight 1)
- A word appears only once per session
- 3 distractors drawn from the same language and grammatical category as the target word
  — so two entries of a category must never share a French or target text (two correct answers)

Progress (progressStore.ts):
- Each mode has independent counters: `WordProgress.byMode[mode]`, no entry for a mode the word was never played in
- mastered = 3 correct answers in a row (correctStreak >= 3)
- The vocabulary list counts a word as mastered when it is mastered in both modes of its
  language (`getWordCombinedProgress(wordId, lang)`)
- Storage and sync: see "Word progress" below

Session (quizStore.ts):
- selectAnswer is idempotent — ignores calls when hasAnswered === true
- nextQuestion advances the index; the screen navigates to /result on the last question
- resetSession fully clears the store — call it before each new session
- startSession gives the session a UUID (`expo-crypto`, with a Math.random fallback where `crypto.randomUUID` is missing, e.g. web over plain http); `buildQuizSession` itself stays pure

---

## Quiz statistics

Backend: `vocabio-backend`, same REST client and JWT as messaging (`quizApi` in `services/api.ts`).

- `POST /quiz-sessions` — sent by `useQuizSession.nextQuestion` when leaving the last question,
  just before navigating to `/result`. Body built by `buildSessionPayload` (quizEngine.ts):
  `{ id, mode, answers: [{ wordId, category, level, isCorrect }] }`. The server computes the score.
  Every `wordId` must carry the prefix of the mode's language (`es-` for fr-es / es-fr, `id-`
  for fr-id / id-fr), otherwise the backend answers 400 and the quiz is lost.
- `GET /quiz-sessions/stats?lang=es|id` — read by `useQuizStats(lang)`, displayed by
  `StatsCard` on the account screen for the current language. Without `lang`: every language
  together (direct load of /account).

Rules:
- Only signed-in users send results. Guests have no JWT: nothing is sent, nothing is queued.
- Only finished quizzes are sent. Closing a quiz midway sends nothing.
- The session `id` is the idempotency key: the backend answers `200` to a repeated `id`, so a
  double tap or a retry never creates a duplicate.
- Sending is fire-and-forget: a failure is logged (`console.warn`) and never blocks the result
  screen. There is no offline retry queue yet.
- Statistics are computed by the backend only, and so is the per-word progress, from the same
  stored answers (see "Word progress" below).
- `mostMissedWords` contains ids only; the card resolves them with `getWordById` and skips ids
  that are no longer in the local vocabulary.

---

## Word progress

There is no separate progress system: the backend computes the progress from the finished
quizzes it already receives through `POST /quiz-sessions` (see "Quiz statistics" above).
`progressStore` is a read-only, in-memory copy: nothing is written to AsyncStorage /
localStorage, and the app never computes counters itself.

- `GET /quiz-sessions/word-progress` (`quizApi.getWordProgress`) — `WordProgressRow[]`, one row
  per word and per mode, every language at once (not filtered by language: each row carries
  its mode, and the ids are unique across languages). Called by `progressStore.loadProgress`;
  `rowsToWords` groups the rows by word.

`loadProgress` runs at two moments:
- when the user becomes authenticated (`useProgressSync`, mounted in the root layout);
- right after a finished quiz was saved (`useQuizSession.nextQuestion`, once `saveSession`
  has succeeded).

Rules:
- Only finished quizzes count. Answering a question changes nothing in `progressStore`; a
  quiz closed midway leaves no trace, in progress as in statistics.
- Guests have no progress at all: nothing is sent, nothing is loaded. Every word counts as new
  in their quizzes and the vocabulary screen shows no counter.
- If saving the quiz fails (offline, or the backend's 10-second rate limit between two
  quizzes), its answers are lost for the progress too. There is no offline queue.
- The reload after a quiz is asynchronous: a replay started immediately can still be built
  from the previous progress.
- The backend sends counters only. The mastery level is derived in the app by `computeMastery`
  (threshold in `QUIZ_CONFIG.masteryThreshold`).
- If a load fails, the store keeps what it already had (empty on a first load) with status
  `error`; the next finished quiz or sign-in loads it again.
- The store is emptied on sign-out and reloaded when another user signs in.
- `useQuizSession` exposes `getWordModeProgress` / `getWordCombinedProgress` with a new identity
  each time the progress changes: keep them in the dependencies of a `renderItem` so the rows
  refresh once the progress has arrived from the network.
- `useProgressSync` also deletes the old `@vocabio_progress_v1` AsyncStorage key left by
  previous versions (the old local progress is not imported). Removable later.

---

## Articles

Backend: `vocabio-backend`, same REST client and JWT as the rest (`articlesApi` in `services/api.ts`).
The backend copies short news articles in easy Spanish from an external site; the app only reads them.

- `GET /articles?level=&offset=&limit=` — list, read by `useArticles`.
- `GET /articles/:id` — one article with its text, read by `useArticle`.
- `GET /articles/:id/audio` — the whole MP3, read by `useArticleAudio`.

Rules:
- Signed-in users only. `app/articles/_layout.tsx` redirects guests to `/login`, and the Home
  section is hidden for them.
- Spanish only: the row is shown on the Spanish home only (`LANGUAGES.es.hasArticles`), and
  "back" after a direct load goes to `/es`.
- No store: like the quiz statistics, the three hooks keep local state. Nothing is cached
  between two visits.
- The list is loaded on mount and when the level changes, **not** on every focus: coming back
  from an article keeps the pages already loaded. "Load more" asks from offset = number of
  articles shown, and `mergeArticles` drops duplicates.
- The text is `ArticleBlock[]`: paragraphs made of segments. It is plain text, never HTML:
  render it with `Text`, never with an HTML renderer.
- A segment with a `gloss` is a phrase explained by the source, **in English**. `ArticleBody`
  underlines it; a tap opens the translation under the paragraph, one at a time.
- Audio is downloaded only on the first press on play, never when the article opens. The
  route needs the JWT, so the file is fetched by the API client as a `Blob` and handed to
  `expo-audio` as a `blob:` URL, revoked when the screen closes. An audio element pointed at
  the backend URL would not work: it cannot send the `Authorization` header.
- Audio is **web only** for now (`isArticleAudioSupported`). On native the card says so; the
  text is readable everywhere.
- No image: the backend sends none.
- The original article is credited at the bottom of the reader (link to `article.url`).
- Page size and player settings: `ARTICLES_CONFIG` (`constants/config.ts`).

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
Colors.accent           #D0801C — warm orange, ES→FR mode tile (accentLight for its background)
Colors.successDark / accentDark    text on successLight / accentLight (article level pills)

Spacing.xs / sm / md / lg / xl / xxl   4 / 8 / 16 / 24 / 32 / 48
Radius.sm / md / lg / xl / full        8 / 12 / 16 / 24 / 999
Typography.sizes.xs -> display          11 -> 36
Typography.weights.regular -> extrabold '400' -> '800'
Typography.lineHeights.body / reading / title   22 / 30 / 34 — running text, article text, article title
Shadow.* · AvatarSize.* · ControlSize.*  shadows, avatars, icons, flags, max widths…
MascotSize.*                             mascot sprite heights and motion distances
Layout.tabletBreakpoint / contentMaxWidth  768 / 720 — responsive breakpoint and centred content column (Home, article list)
Layout.readingMaxWidth                     640 — narrower column of the article reader
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
- Store access: only from hooks (`hooks/`), plus `authStore` in `app/_layout.tsx` — screens never touch the stores directly
- Pure logic (testable without React) goes in `features/`
- Types: all in types/index.ts — no inline types in components except local prop interfaces
- Word IDs: language prefix + category letter + 3 digits (`es-n001`), continuous sequence with no gaps (see table below)
- UI copy: French, always addressing the user with "tu" ("Choisis un mode", "Réessaie") — never "vous"

---

## Vocabulary dataset

630 Spanish words split across `data/es/*.ts`, aggregated by `data/vocabulary.ts`:

| Category | File | IDs | A1 | A2 | B1 | Total |
|---|---|---|---|---|---|---|
| noun | es/nouns.ts | es-n001–es-n200 | 80 | 70 | 50 | 200 |
| verb | es/verbs.ts | es-v001–es-v100 | 50 | 50 | — | 100 |
| adjective | es/adjectives.ts | es-a001–es-a150 | 75 | 75 | — | 150 |
| adverb | es/adverbs.ts | es-d001–es-d100 | 50 | 50 | — | 100 |
| expression | es/expressions.ts | es-e001–es-e050 | 50 | — | — | 50 |
| pronoun | es/pronouns.ts | es-p001–es-p030 | 30 | — | — | 30 |
| **Total** | | | **335** | **245** | **50** | **630** |

224 Indonesian entries split across `data/id/*.ts`, all A1:

| Category | File | IDs | A1 | Notes |
|---|---|---|---|---|
| noun | id/nouns.ts | id-n001–id-n060 | 60 | id-n031–id-n046: family, id-n047–id-n050: durations, id-n051–id-n060: food (warung) |
| verb | id/verbs.ts | id-v001–id-v028 | 28 | id-v026–id-v028: warung |
| adjective | id/adjectives.ts | id-a001–id-a033 | 33 | id-a001–id-a030: pairs of opposites (`oppositeId`), ganteng and bagus point to jelek, which points back to cantik; id-a031–id-a033: food, no opposite |
| adverb | id/adverbs.ts | id-d001–id-d011 | 11 | time: today, tomorrow, already, not yet… |
| number | id/numbers.ts | id-c001–id-c026 | 26 | 0–20, 50, 100, 1 000, a million, a billion |
| expression | id/expressions.ts | id-e001–id-e057 | 57 | id-e001–id-e018: questions, id-e019–id-e041: statements, id-e042–id-e048: time of day, id-e049–id-e057: warung |
| pronoun | id/pronouns.ts | id-p001–id-p009 | 9 | |
| **Total** | | | **224** | |

Indonesian has no articles. Its French side says "tu" (questions use
`kamu`), and translations that would collide in a category get a precision in brackets
("je (poli)" / "je (familier)", "femme (courant)" / "femme (soutenu)").

To add words: add them to the category file of their language, continue the ID sequence
(e.g. the next Spanish noun is `es-n201`, the next Indonesian one `id-n061`) and **update
this table**. `__tests__/vocabulary.test.ts` checks the id format, gaps, duplicates, and
for Indonesian the unique texts per category and the `oppositeId` links.
Never renumber an existing ID: the progress and quiz results stored on the backend refer to it.
The language prefix keeps ids unique across languages; the backend migrated the old
unprefixed Spanish ids (`n001` → `es-n001`) when it introduced the prefix.

---

## Planned extension points

| Feature | Target file | Notes |
|---|---|---|
| Dark mode | constants/theme.ts | Add DarkColors, useTheme() hook |
| Sounds / pronunciation | features/audio/ | expo-speech (TTS) or expo-audio |
| Article audio on native | hooks/useArticleAudio.ts | Download to the cache directory (expo-file-system), then play the local file |
| Article glosses in French | vocabio-backend | The source only provides English explanations |
| Streaks | vocabio-backend + store/progressStore.ts | Add currentStreak, bestStreak (stored by the backend) |
| Spaced repetition (SM-2) | features/quiz/quizEngine.ts | Replace the weight system with the SM-2 algorithm |
| Level filter | app/[lang]/index.tsx + quizEngine.ts | Pass the chosen level to buildQuizSession() |
| Native Google Sign-In | lib/auth.ts | expo-auth-session (PKCE) + dev build |
| Offline quizzes | hooks/useQuizSession.ts | Queue finished sessions that could not be sent; safe to retry, the session id is an idempotency key |
| Another language | types/index.ts + constants/languages.ts + data/<lang>/ | Add it to `Language` and `QuizMode`, to LANGUAGES / MODES / LANGUAGE_LIST, its flag to Flag.tsx; the backend must accept its modes first |
| Remember the language | — | Out of scope for now: it would need device storage (see CLAUDE.md) |

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
