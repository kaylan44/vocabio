import { useLocalSearchParams } from 'expo-router';
import { isLanguage, LANGUAGE_LIST } from '../constants/languages';
import { useLanguageStore } from '../store/languageStore';
import { Language } from '../types';

/**
 * Language of a screen under app/[lang]/, read from the URL.
 * app/[lang]/_layout.tsx redirects any other value to /language before a screen mounts,
 * so the fallback is never shown.
 */
export function useRouteLanguage(): Language {
  const { lang } = useLocalSearchParams<{ lang?: string }>();
  return isLanguage(lang) ? lang : LANGUAGE_LIST[0];
}

/**
 * Last language visited, for the screens outside app/[lang]/ (account, messages).
 * null after a direct load of one of those screens: no language was visited yet.
 */
export function useCurrentLanguage() {
  const language = useLanguageStore(s => s.current);
  const setLanguage = useLanguageStore(s => s.setCurrent);
  // Home of the current language, or the language screen when there is none.
  const homeHref = language ? `/${language}` : '/language';
  return { language, setLanguage, homeHref };
}
