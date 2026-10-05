# CLAUDE.md — Vocabio

This file guides Claude Code (and other agents) when working on this repository.

## Before any change

1. Read `AGENTS.md` at the root — it contains the full architecture, types, business rules and code conventions. This file does not duplicate that content; it adds operational instructions.
2. Do not change `react-native-reanimated` or `react-native-worklets` without checking compatibility — the project's stable versions are 4.2.1 and 0.7.4 respectively.
3. Do not change `react` without checking compatibility with `react-native-web` — the current version is 19.2.0 with Expo SDK 55.

## Validation commands

After any code change, run in this order:

```bash
npx tsc --noEmit
npx expo start --clear
```

A task is not done if `tsc` reports errors.

## Strict rules for this project

- Never access `quizStore` or `progressStore` directly from a screen (`app/*.tsx`). Always go through `hooks/useQuizSession.ts`.
- Never hardcode colors, sizes or spacing in styles. Always import them from `constants/theme.ts`.
- `constants/theme.ts` only holds visual tokens. Behaviour constants (questions per session, delays, pagination…) go in `constants/config.ts`.
- Never use `Animated` from `react-native` core. This project uses `react-native-reanimated` exclusively.
- Every new reusable component goes in `components/ui/`. Every quiz-specific component goes in `components/quiz/`.
- New words go in their category file (`data/nouns.ts`, `data/verbs.ts`…), follow the existing ID format (`n###`, `v###`, `a###`, `d###`, `e###`, `p###`) and continue the sequence with no gaps.
- Do not introduce another state management library. Zustand is the only one used in this project.
- Do not introduce another animation library. Reanimated is the only one used.

## Documentation — keep it up to date in the same PR

Any PR that changes the project structure (file or folder added, moved or removed), the dataset (`data/*`), the core types or a business rule **updates `AGENTS.md` in the same PR** (file tree, dataset table, rules). Also update `README.md` when installation, environment variables or user-facing features change.
Outdated agent docs are worse than no docs: agents take them at face value. A task is not done until the docs match the code.

## When a task touches several files

Recommended order of changes, to stay consistent with the project's data flow:
1. `types/index.ts` if a new type is needed
2. `features/quiz/quizEngine.ts` or `store/*.ts` for the logic
3. `hooks/useQuizSession.ts` if the API exposed to screens changes
4. `components/*` for the UI
5. `app/*.tsx` for the final integration in the screen

## Git workflow — absolute rules

- Never push directly to `main`. Always create a branch (e.g. `feat/...`, `fix/...`, `docs/...`) and commit on it.
- Never use `git push --force` without explicit confirmation from the user.
- Before creating a PR, check that the current branch is not `main` with `git branch --show-current`.
- Never run `git push` or create a PR unless the user explicitly asks. All work stays local until told otherwise.
- Force pushes (`--force`, `--force-with-lease`, `-f`, `+refspec`), pushes to `main` and `npm publish` are blocked in `.claude/settings.json`. Do not try to work around the block (another shell, `wsl -e`, aliases…).
- A bare `git push` cannot be filtered by branch: always run `git branch --show-current` first and never push while on `main`.

## Secrets

- Agents must not read `.env*` files (reading is blocked in `.claude/settings.json`). To know which variables are expected, read `.env.example`.
- Every new environment variable is added to `.env.example` (with a dummy value) and documented in `README.md`.

## Never do without asking for confirmation

- Store app data on the device (AsyncStorage / localStorage) — progress lives on `vocabio-backend` only; the device keeps nothing but the guest flag and the Supabase session.
- Change the shape of the `/quiz-sessions` payloads — the backend must be changed and deployed first.
- Change the word ID format — it would break the progress and quiz results stored on the backend.
- Rename or move `hooks/useQuizSession.ts` — it is the single entry point used by every screen.
