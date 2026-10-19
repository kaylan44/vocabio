import { create } from 'zustand';
import { Language } from '../types';

// ─── Store definition ─────────────────────────────────────────────────────────
// The current language is carried by the URL (/es/…, /id/…). This store only mirrors
// the last one visited, for the screens outside app/[lang]/ (account, messages) and
// their way back to the right home. Kept in memory only: nothing is stored on the
// device, the language screen is shown again at each app start.

interface LanguageState {
  current: Language | null;
  setCurrent: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  current: null,
  setCurrent: (lang) => set({ current: lang }),
}));
