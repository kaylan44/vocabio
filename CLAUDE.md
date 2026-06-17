# CLAUDE.md — Vocabio

Ce fichier guide Claude Code (et autres agents) lors du travail sur ce dépôt.

## Avant toute modification

1. Lire `AGENTS.md` à la racine — il contient l'architecture complète, les types, les règles métier et les conventions de code. Ce fichier ne duplique pas ce contenu, il le complète avec des instructions opérationnelles.
2. Ne pas modifier `react-native-reanimated` ni `react-native-worklets` sans vérifier la compatibilité — les versions stables du projet sont respectivement 4.2.1 et 0.7.4.
3. Ne pas modifier `react` sans vérifier la compatibilité avec `react-native-web` — la version actuelle est 19.2.0 avec Expo SDK 55.

## Commandes de validation

Après toute modification de code, exécuter dans l'ordre :

```bash
npx tsc --noEmit
npx expo start --clear
```

Ne pas considérer une tâche terminée si `tsc` retourne des erreurs.

## Règles strictes pour ce projet

- Ne jamais accéder à `quizStore` ou `progressStore` directement depuis un écran (`app/*.tsx`). Toujours passer par `hooks/useQuizSession.ts`.
- Ne jamais utiliser de couleurs, tailles ou espacements en dur dans les styles. Toujours importer depuis `constants/theme.ts`.
- Ne jamais utiliser `Animated` de `react-native` core. Ce projet utilise exclusivement `react-native-reanimated`.
- Tout nouveau composant réutilisable va dans `components/ui/`. Tout composant spécifique au quiz va dans `components/quiz/`.
- Les nouveaux mots ajoutés à `data/vocabulary.ts` doivent respecter le format d'ID existant (`n###`, `v###`, `a###`) et incrémenter la séquence sans trou.
- Ne pas introduire de nouvelle librairie de state management. Zustand est la seule solution utilisée dans ce projet.
- Ne pas introduire de nouvelle librairie d'animation. Reanimated est la seule solution utilisée.

## Quand une tâche touche plusieurs fichiers

Ordre de modification recommandé pour rester cohérent avec le flux de données du projet :
1. `types/index.ts` si un nouveau type est nécessaire
2. `features/quiz/quizEngine.ts` ou `store/*.ts` pour la logique
3. `hooks/useQuizSession.ts` si l'API exposée aux écrans change
4. `components/*` pour l'UI
5. `app/*.tsx` pour l'intégration finale dans l'écran

## Ce qu'il ne faut jamais faire sans demander confirmation

- Changer la structure de persistance AsyncStorage (clé `@vocabio_progress_v1`) — cela invaliderait la progression existante des utilisateurs.
- Changer le format des IDs de mots — cela casserait les références dans `progressStore`.
- Renommer ou déplacer `hooks/useQuizSession.ts` — c'est le point d'entrée unique utilisé par tous les écrans.
