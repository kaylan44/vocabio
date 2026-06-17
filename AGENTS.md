# AGENTS.md — Vocabio

> Ce fichier est destiné aux agents IA travaillant sur le projet.
> Il décrit l'architecture, les conventions, les règles à respecter et les points d'extension.

---

## Vue d'ensemble

**Vocabio** est une application mobile de quiz de vocabulaire Espagnol ↔ Français.
- React Native + Expo (SDK 55+)
- Expo Router (file-based routing)
- TypeScript strict
- Zustand (state management)
- AsyncStorage (persistance locale)
- React Native Reanimated 4 + react-native-worklets (animations)

---

## Stack et versions

| Package | Version stable à utiliser |
|---|---|
| react | 19.2.0 |
| react-native | 0.83.6 |
| expo | ^55.0.0 |
| expo-router | ~55.0.16 |
| zustand | ^5.x |
| react-native-reanimated | 4.2.1 |
| react-native-worklets | 0.7.4 |
| @react-native-async-storage/async-storage | 2.2.0 |

---

## Structure du projet

```
vocabio/
├── app/                        Écrans — Expo Router (file-based)
│   ├── _layout.tsx             Root layout, charge la progression AsyncStorage
│   ├── index.tsx               Home screen — choix du mode
│   ├── quiz.tsx                Quiz screen — session active
│   └── result.tsx              Result screen — score final
│
├── components/
│   ├── ui/                     Composants génériques réutilisables
│   │   ├── Button.tsx          Bouton animé — variants: primary | secondary | ghost
│   │   ├── Badge.tsx           Badge texte coloré
│   │   └── ProgressBar.tsx     Barre de progression animée
│   ├── quiz/                   Composants spécifiques au quiz
│   │   ├── WordCard.tsx        Affiche le mot à traduire + catégorie + langue
│   │   ├── AnswerTile.tsx      Tuile de réponse avec états et animations
│   │   └── TileGrid.tsx        Grille 2x2 de AnswerTile
│   └── home/
│       └── ModeCard.tsx        Carte de sélection du mode FR→ES ou ES→FR
│
├── features/
│   └── quiz/
│       └── quizEngine.ts       Logique pure — pas de UI, pas de store
│
├── store/
│   ├── quizStore.ts            État de la session en cours (Zustand)
│   └── progressStore.ts        Progression persistante (Zustand + AsyncStorage)
│
├── hooks/
│   └── useQuizSession.ts       Hook principal — seul point d'entrée pour les écrans
│
├── data/
│   └── vocabulary.ts           300 mots mock (100 noms, 100 verbes, 100 adjectifs)
│
├── types/
│   └── index.ts                Tous les types TypeScript du projet
│
└── constants/
    └── theme.ts                Design system — couleurs, typo, espacements, ombres
```

---

## Types principaux

```typescript
interface VocabWord {
  id: string;
  french: string;
  spanish: string;
  category: 'noun' | 'verb' | 'adjective' | 'adverb' | 'phrase';
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
}

type QuizMode = 'fr-es' | 'es-fr';

interface QuizQuestion {
  wordId: string;
  targetWord: string;
  correctAnswer: string;
  options: string[];
  category: GrammarCategory;
}

type TileState = 'idle' | 'selected-correct' | 'selected-wrong' | 'revealed-correct' | 'disabled';

type MasteryLevel = 'new' | 'seen' | 'mastered';
```

---

## Flux de données

```
useQuizSession (hook)
    quizStore       état de la session active (questions, index, score, réponse)
    progressStore   progression persistée par mot et par mode
    navigation      Expo Router (push/replace)

Écrans -> useQuizSession uniquement (jamais les stores directement)
```

---

## Règles de la logique quiz

Génération d'une session (quizEngine.ts) :
- 10 questions par session
- Sélection pondérée : new (poids 10) > seen (poids 5) > mastered (poids 1)
- Un mot n'apparaît qu'une seule fois par session
- 3 distracteurs tirés de la même catégorie grammaticale que le mot cible

Progression (progressStore.ts) :
- FR→ES et ES→FR ont des compteurs indépendants
- mastered = 3 bonnes réponses consécutives (correctStreak >= 3)
- La progression est persistée immédiatement après chaque réponse via AsyncStorage
- Clé AsyncStorage : @vocabio_progress_v1

Session (quizStore.ts) :
- selectAnswer est idempotent — ignore les appels si hasAnswered === true
- nextQuestion avance l'index ; l'écran navigue vers /result si c'est la dernière question
- resetSession vide complètement le store — appeler avant chaque nouvelle session

---

## Design system (constants/theme.ts)

Toujours utiliser les tokens du theme, jamais de valeurs hardcodées.

```typescript
Colors.primary          #4A7CF7 — bleu principal
Colors.success          #4DB87A — vert réponse correcte
Colors.error            #F26B5E — rouge réponse incorrecte
Colors.background       #F8F9FC — fond général
Colors.surface          #FFFFFF — cartes et tuiles
Colors.textPrimary      #1A1D2E
Colors.textSecondary    #6B7280
Colors.textTertiary     #9CA3AF

Spacing.xs / sm / md / lg / xl / xxl   4 / 8 / 16 / 24 / 32 / 48
Radius.sm / md / lg / xl / full        8 / 12 / 16 / 24 / 999
Typography.sizes.xs -> display          11 -> 36
Typography.weights.regular -> extrabold '400' -> '800'
```

---

## Conventions de code

- Composants : functional components uniquement, pas de class components
- Styles : StyleSheet.create() dans chaque fichier, jamais de styles inline sauf cas exceptionnel
- Animations : uniquement via react-native-reanimated — pas d'Animated de React Native core
- Navigation : uniquement via useRouter() d'Expo Router — jamais de navigation directe depuis les stores
- Accès aux stores : uniquement depuis useQuizSession ou _layout.tsx — les écrans ne touchent pas les stores directement
- Types : tous dans types/index.ts — pas de types inline dans les composants sauf interfaces de props locales
- IDs des mots : format n001-n100 (nouns), v001-v100 (verbs), a001-a100 (adjectives)

---

## Dataset vocabulaire

300 mots dans data/vocabulary.ts :

| Catégorie | A1 | A2 | B1 | B2 | Total |
|---|---|---|---|---|---|
| noun | 25 | 25 | 25 | 25 | 100 |
| verb | 25 | 25 | 25 | 25 | 100 |
| adjective | 25 | 25 | 25 | 25 | 100 |

Pour ajouter des mots : respecter le format existant et incrémenter les IDs dans la séquence.

---

## Points d'extension prévus

| Feature | Fichier cible | Notes |
|---|---|---|
| Dark mode | constants/theme.ts | Ajouter DarkColors, hook useTheme() |
| Sons | features/audio/soundEngine.ts | expo-av |
| Streaks | store/progressStore.ts | Ajouter currentStreak, bestStreak dans UserProgress |
| Spaced repetition (SM-2) | features/quiz/quizEngine.ts | Remplacer le système de poids par l'algorithme SM-2 |
| Filtre par niveau | app/index.tsx + quizEngine.ts | Passer le niveau choisi à buildQuizSession() |
| Auth + profils | services/auth.ts | Remplacer AsyncStorage par API calls |
| Autres langues | types/index.ts + data/ | Ajouter champ language dans VocabWord |
| Backend | services/api.ts | Remplacer data/vocabulary.ts par des appels réseau |

---

## Erreurs connues et solutions

| Erreur | Cause | Solution |
|---|---|---|
| Cannot find module react-native-worklets/plugin | react-native-worklets non installé | npm install react-native-worklets@0.7.4 |
| ERESOLVE peer deps | Conflit de versions | npm install --legacy-peer-deps |
| Cannot find module babel-preset-expo | Template sans Expo Router | Utiliser --template tabs pour create-expo-app |
| Écran blanc / App.tsx affiché | Template blank-typescript utilisé | Utiliser --template tabs |
| libnspr4.so cannot open shared object file | React Native DevTools manquant sur Linux | Ignorable, ou sudo apt-get install libnspr4 |

---

## Commandes utiles

```bash
npx expo start --clear
npx expo start --ios
npx expo start --android
npx tsc --noEmit
rm -rf node_modules package-lock.json && npm install --legacy-peer-deps
```
