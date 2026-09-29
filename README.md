# Vocabio 🇫🇷 ↔ 🇪🇸

Mobile vocabulary quiz app for Spanish ↔ French, with user accounts and 1:1 messaging.
Stack: React Native · Expo SDK 55 · TypeScript · Expo Router · Zustand · Reanimated · Supabase · Socket.io

---

## Features

- **FR→ES / ES→FR quiz** — 10-question sessions with 4 choices, answer animations
- **Per-word, per-direction progress** — weighted selection that favours new words, "mastered" badge
- **Vocabulary list** — 630 words (nouns, verbs, adjectives, adverbs, expressions, pronouns), levels A1 → B1
- **Authentication** — Google SSO through Supabase (web) or guest mode
- **1:1 messaging** — real-time conversations, typing indicator, read receipts, optimistic sending

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

Without a Supabase configuration, the app still works in **guest mode** (quiz and local progress, no messaging).

## Validation

```bash
npx tsc --noEmit   # type check
npm test           # Jest tests
```

---

## Architecture

```
app/            Screens (Expo Router) — login, home, quiz, result, vocab, account, messages/*
components/     UI — ui/ (generic), quiz/, home/, messaging/
features/       Pure logic, no React or store — quizEngine, messagingLogic
store/          Zustand state — quiz, progress, auth, messaging
hooks/          The only way screens reach the stores (useQuizSession, useAuth, useChat…)
services/       REST and socket.io clients for vocabio-backend
lib/            Supabase client and authentication flow
data/           Vocabulary dataset, one file per category
types/          Shared TypeScript types
constants/      theme.ts (design system) · config.ts (business constants)
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

### Independent progress per direction
FR→ES and ES→FR each have their own mastery counter.
A word can be mastered in one direction and new in the other. Progress is stored locally (AsyncStorage).

### Mastery
- `new` → never seen
- `seen` → seen at least once
- `mastered` → 3 correct answers in a row

### Distractors
The 3 wrong answers are drawn from the **same grammatical category** as the target word (verbs with verbs, nouns with nouns, etc.) so the choices stay plausible.

### Messaging
Writes go through REST (every action gets a status code); real-time delivery goes through socket.io.
Sent messages show up immediately (local id) and are then reconciled with the server response.

---

## Roadmap

| Feature | Where |
|---|---|
| Native Google Sign-In | `lib/auth.ts` → expo-auth-session (PKCE) + dev build |
| Progress sync | `store/progressStore.ts` → Supabase for signed-in users |
| Spaced repetition | `features/quiz/quizEngine.ts` → SM-2 algorithm |
| Level filter | `quizEngine.ts` → filter on `word.level` |
| Streaks | `store/progressStore.ts` → `currentStreak` field |
| Dark mode | `constants/theme.ts` → `DarkColors` + `useTheme` hook |
| Pronunciation | `features/audio/` → expo-speech |
