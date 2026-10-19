import { useRouter } from 'expo-router';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LanguageCard } from '../components/home/LanguageCard';
import { LANGUAGE_LIST } from '../constants/languages';
import { Colors, ControlSize, Layout, Spacing, Typography } from '../constants/theme';
import { getVocabulary } from '../data/vocabulary';
import { Language } from '../types';

const logoImage = require('../assets/vocabio-logo.png');

// Shown after sign-in (or guest mode) and at each app start: the choice is not stored.
export default function LanguageScreen() {
  const router = useRouter();

  const handleSelect = (language: Language) => {
    router.replace(`/${language}` as never);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <Image source={logoImage} style={styles.logo} />
          <Text style={styles.logoText}>
            <Text style={styles.logoV}>V</Text>ocabio
          </Text>
        </View>

        <Text style={styles.title}>Quelle langue veux-tu apprendre ?</Text>

        <View style={styles.cards}>
          {LANGUAGE_LIST.map(language => (
            <LanguageCard
              key={language}
              language={language}
              wordCount={getVocabulary(language).length}
              onPress={handleSelect}
            />
          ))}
        </View>

        <Text style={styles.hint}>Tu pourras changer de langue depuis l'accueil.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flexGrow: 1,
    width: '100%',
    maxWidth: Layout.contentMaxWidth,
    alignSelf: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xxl,
    gap: Spacing.xl,
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  logo: {
    width: ControlSize.logo,
    height: ControlSize.logo,
    resizeMode: 'contain',
  },
  logoText: {
    fontSize: Typography.sizes.display,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  logoV: {
    color: Colors.success,
    fontWeight: Typography.weights.extrabold,
  },
  title: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  cards: {
    gap: Spacing.md,
  },
  hint: {
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
    textAlign: 'center',
  },
});
