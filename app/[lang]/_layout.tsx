import { useEffect } from 'react';
import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants/theme';
import { isLanguage } from '../../constants/languages';
import { useCurrentLanguage } from '../../hooks/useLanguage';

// Screens of one language: /es/…, /id/…. Any other first segment that reaches this
// route (e.g. /fr) is sent back to the language screen.
export default function LanguageLayout() {
  const { lang } = useLocalSearchParams<{ lang?: string }>();
  const { setLanguage } = useCurrentLanguage();
  const valid = isLanguage(lang);

  // Mirror the language for the screens outside app/[lang]/ (account, messages).
  useEffect(() => {
    if (isLanguage(lang)) setLanguage(lang);
  }, [lang, setLanguage]);

  if (!valid) return <Redirect href={'/language' as never} />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'fade_from_bottom',
      }}
    />
  );
}
