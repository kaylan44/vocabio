// ─── Vocabio Design System ────────────────────────────────────────────────────
// Single source of truth for all visual tokens.
// Future: add dark mode variants here.

import { Platform } from 'react-native';

export const Colors = {
  // Primary — calm blue
  primary: '#4A7CF7',
  primaryLight: '#EEF3FF',
  primaryDark: '#2E5DD4',

  // Semantic
  success: '#4DB87A',
  successLight: '#E8F8EF',
  error: '#F26B5E',
  errorLight: '#FEF0EE',

  // Neutral
  background: '#F8F9FC',
  surface: '#FFFFFF',
  border: '#E8EAF0',
  borderLight: '#F0F2F8',

  // Text
  textPrimary: '#1A1D2E',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  textOnPrimary: '#FFFFFF',

  // Tile states
  tileIdle: '#FFFFFF',
  tileIdleBorder: '#E8EAF0',
} as const;

export const Typography = {
  // Font family — Expo uses system fonts by default.
  // For production, load 'Outfit' via expo-font for a distinct feel.
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
  },

  sizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 22,
    xxl: 28,
    display: 36,
  },

  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    extrabold: '800' as const,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const Shadow = {
  // Subtle card shadow
  card: Platform.select({
    web: {
      boxShadow: '0px 2px 8px rgba(26, 29, 46, 0.06)',
    },
    default: {
      shadowColor: '#1A1D2E',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },
  }),
  // Slightly stronger for interactive tiles
  tile: Platform.select({
    web: {
      boxShadow: '0px 3px 10px rgba(26, 29, 46, 0.08)',
    },
    default: {
      shadowColor: '#1A1D2E',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 3,
    },
  }),
} as const;

// ─── Quiz constants ───────────────────────────────────────────────────────────

export const QUIZ_CONFIG = {
  questionsPerSession: 10,
  optionsPerQuestion: 4,
  masteryThreshold: 3,   // correct streak to reach "mastered"
} as const;
