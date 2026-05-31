# Vocabio 🇫🇷 ↔ 🇪🇸

Application mobile de quiz de vocabulaire Espagnol ↔ Français.  
Stack : React Native · Expo · TypeScript · Expo Router · Zustand · Reanimated

---

## Installation

```bash
# 1. Créer le projet Expo
npx create-expo-app@latest vocabio --template blank-typescript
cd vocabio

# 2. Supprimer l'app par défaut
rm -rf app/

# 3. Copier tous les fichiers du projet dans le dossier vocabio/

# 4. Dépendances Expo
npx expo install expo-router \
  react-native-safe-area-context \
  react-native-screens \
  expo-linking \
  expo-constants \
  expo-status-bar \
  @react-native-async-storage/async-storage \
  react-native-reanimated

# 5. Dépendances npm
npm install zustand

# 6. app.json — ajouter dans "expo" :
{
  "scheme": "vocabio",
  "web": { "bundler": "metro" },
  "plugins": ["expo-router"]
}

# 7. babel.config.js
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ['react-native-reanimated/plugin'],
  };
};
```

## Lancement

```bash
npx expo start
# Scan le QR code avec Expo Go (iOS / Android)
```

---

## Architecture

```
vocabio/
├── app/
│   ├── _layout.tsx       Root layout — charge la progression au démarrage
│   ├── index.tsx         Home — choix du mode
│   ├── quiz.tsx          Quiz — grille de tuiles, score, progression
│   └── result.tsx        Résultat — score final, replay, changer de mode
│
├── components/
│   ├── ui/
│   │   ├── Button.tsx        Bouton animé (primary / secondary / ghost)
│   │   ├── Badge.tsx         Badge score
│   │   └── ProgressBar.tsx   Barre de progression animée
│   ├── quiz/
│   │   ├── WordCard.tsx      Carte du mot à traduire
│   │   ├── AnswerTile.tsx    Tuile de réponse (idle/correct/wrong/disabled)
│   │   └── TileGrid.tsx      Grille 2x2 de tuiles
│   └── home/
│       └── ModeCard.tsx      Carte de sélection du mode
│
├── features/
│   └── quiz/
│       └── quizEngine.ts   Logique pure : sélection pondérée, distracteurs, build session
│
├── store/
│   ├── quizStore.ts        État de session (Zustand)
│   └── progressStore.ts    Progression persistante (Zustand + AsyncStorage)
│
├── hooks/
│   └── useQuizSession.ts   Hook principal — bridge store + progress + navigation
│
├── data/
│   └── vocabulary.ts       60 mots mock (noms, verbes, adjectifs · A1/A2)
│
├── types/
│   └── index.ts            Types TypeScript stricts
│
└── constants/
    └── theme.ts            Design system complet (couleurs, typo, espacements)
```

---

## Logique clé

### Sélection pondérée des mots
Les mots sont tirés avec une probabilité pondérée selon leur maîtrise :
- **Nouveau** → poids 10 (prioritaire)
- **Vu** → poids 5
- **Maîtrisé** → poids 1 (apparaît rarement)

### Progression indépendante par mode
FR→ES et ES→FR ont chacun leur propre compteur de maîtrise.  
Un mot peut être maîtrisé dans un sens mais nouveau dans l'autre.

### Mastery
- `new` → jamais vu
- `seen` → vu au moins une fois
- `mastered` → 3 bonnes réponses consécutives

### Distracteurs
Les 3 mauvaises réponses sont tirées de la **même catégorie grammaticale** que le mot cible (verbes avec verbes, noms avec noms, etc.) pour des choix plausibles.

---

## Extensions prévues (non implémentées)

| Feature | Où l'ajouter |
|---|---|
| Dark mode | `constants/theme.ts` → ajouter `DarkColors` + hook `useTheme` |
| Sons | `features/audio/` → `expo-av` |
| Streaks | `store/progressStore.ts` → champ `currentStreak` |
| Spaced repetition | `features/quiz/quizEngine.ts` → algorithme SM-2 |
| Auth + profils | `services/auth.ts` + backend API |
| Plus de langues | `data/vocabulary.ts` → ajouter champ `language` |
| Niveaux B1/B2 | Filtre dans `quizEngine.ts` par `word.level` |
