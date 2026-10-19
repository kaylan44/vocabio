# Vocabio 🇫🇷 ↔ 🇪🇸 🇮🇩

Mobile vocabulary quiz app for French speakers learning Spanish or Indonesian, with user accounts and 1:1 messaging.
Stack: React Native · Expo SDK 55 · TypeScript · Expo Router · Zustand · Reanimated · Supabase · Socket.io

---

## Features

- **Two languages** — Spanish and Indonesian, picked on a language screen at each app start; a "Changer de langue" button on the home screen leads back to it
- **Quiz in both directions** — FR→ES / ES→FR and FR→ID / ID→FR, 10-question sessions with 4 choices, answer animations
- **Per-word, per-direction progress** — weighted selection that favours new words, "mastered" badge; saved to the account of signed-in users and found again on any device (guests have no progress)
- **Vocabulary list** — Spanish: 630 words (nouns, verbs, adjectives, adverbs, expressions, pronouns), levels A1 → B1. Indonesian: 224 A1 entries (nouns, family, durations and food, verbs, adjectives, time adverbs, numbers, questions, basic sentences, telling the time and ordering at a warung, pronouns)
- **Authentication** — Google SSO through Supabase (web) or guest mode
- **1:1 messaging** — real-time conversations, typing indicator, read receipts, optimistic sending
- **Quiz statistics** — finished quizzes of signed-in users are stored on the backend; the account screen shows, for the current language, quizzes played and accuracy by direction, category and level, plus the most-missed words
- **Articles in easy Spanish** (from the Spanish home only) — short news articles for learners, with a level filter; tap an underlined phrase to see its translation, and listen to the article read aloud (signed-in users; listening on web only for now)

---

## Prerequisites

- Node.js 20+ and npm
- A [Supabase](https://supabase.com) project with the Google provider enabled (for sign-in)
- To test on a phone: the Expo Go app, or an iOS simulator / Android emulator

## Installation

```bash
git clone https://github.com/kaylan44/vocabio.git
cd vocabio
npm install --legacy-peer-deps
cp .env.example .env.local
```

Then fill in `.env.local`:

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (public, bundled into the app) — never the `service_role` key |
| `EXPO_PUBLIC_API_URL` | *(optional)* `vocabio-backend` URL. Defaults to the production instance on Railway |

## Running

```bash
npx expo start          # then scan the QR code with Expo Go
npx expo start --web    # web build (the only platform where Google Sign-In works for now)
```

The app needs a `vocabio-backend` that knows the Indonesian modes and the prefixed word ids (`es-n001`, `id-n001`): an older one refuses Indonesian quizzes, and a newer one refuses unprefixed ids, both with 400.

Without a Supabase configuration, the app still works in **guest mode** (quiz only: no saved progress, no statistics, no messaging, no articles).

## Validation

```bash
npx tsc --noEmit   # type check
npm test           # Jest tests
```

---

## Architecture

```
app/            Screens (Expo Router) — login, language, [lang]/ (home, quiz, result, vocab), account, messages/*, articles/*
components/     UI — ui/ (generic), quiz/, home/, account/, messaging/, articles/
features/       Pure logic, no React or store — quizEngine, messagingLogic, articleLogic
store/          Zustand state — quiz, progress, auth, messaging, current language
hooks/          The only way screens reach the stores (useQuizSession, useQuizStats, useAuth, useChat…)
services/       REST and socket.io clients for vocabio-backend
lib/            Supabase client and authentication flow
data/           Vocabulary dataset, one folder per language (es/, id/), one file per category
types/          Shared TypeScript types
constants/      theme.ts (design system) · config.ts (business constants) · languages.ts (languages and modes)
__tests__/      Jest tests
```

Data flow: `screen → hook → store → features (pure logic)`. Screens never import a store directly.

The detailed description (file-by-file structure, business rules, conventions) lives in [AGENTS.md](AGENTS.md).

---

## Key logic

### Weighted word selection
Words are drawn with a probability weighted by mastery:
- **New** → weight 10 (prioritised)
- **Seen** → weight 5
- **Mastered** → weight 1 (shows up rarely)

### One language per quiz
A quiz draws its words, and their wrong answers, from the vocabulary of its language only. Word ids carry their language (`es-n001`, `id-n001`); the backend refuses a quiz whose ids do not match its mode (400).

### Independent progress per direction
Each direction (FR→ES, ES→FR, FR→ID, ID→FR) has its own mastery counter.
A word can be mastered in one direction and new in the other; the vocabulary list shows the medal once it is mastered in both directions of its language.

Progress is not stored on the device: `vocabio-backend` computes it from the finished quizzes it receives, and the app loads it at sign-in and after each finished quiz. A quiz closed midway does not count, nor does a quiz finished while offline. Guests have no progress: every word stays new for them.

### Mastery
- `new` → never seen
- `seen` → seen at least once
- `mastered` → 3 correct answers in a row

### Distractors
The 3 wrong answers are drawn from the **same language and grammatical category** as the target word (verbs with verbs, nouns with nouns, etc.) so the choices stay plausible.

### Messaging
Writes go through REST (every action gets a status code); real-time delivery goes through socket.io.
Sent messages show up immediately (local id) and are then reconciled with the server response.

### Articles

Articles come from `vocabio-backend`, which copies them from an external site: the app shows nothing until the backend's article sync is enabled. The text is stored as paragraphs of segments (plain text), some of which carry an English explanation shown on tap. The audio is downloaded on the first press on play, with the user's token, and played from a local copy.

---

## Roadmap

| Feature | Where |
|---|---|
| Native Google Sign-In | `lib/auth.ts` → expo-auth-session (PKCE) + dev build |
| Offline quizzes | `hooks/useQuizSession.ts` → queue finished sessions that could not be sent |
| Spaced repetition | `features/quiz/quizEngine.ts` → SM-2 algorithm |
| Level filter | `quizEngine.ts` → filter on `word.level` |
| Streaks | `vocabio-backend` + `store/progressStore.ts` → `currentStreak` field |
| Dark mode | `constants/theme.ts` → `DarkColors` + `useTheme` hook |
| Pronunciation | `features/audio/` → expo-speech |
| Another language | `constants/languages.ts` + `data/<lang>/` + its flag; the backend must accept its modes first |
