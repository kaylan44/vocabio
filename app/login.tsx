import { useState } from 'react';
import { Image, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { Button } from '../components/ui/Button';
import { Colors, Radius, Shadow, Spacing, Typography } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';

const logoImage = require('../assets/vocabio-logo.png');

export default function LoginScreen() {
  const { signInWithGoogle, continueAsGuest } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    const { error: err } = await signInWithGoogle();
    // On web, this redirects the page so we never reach the lines below.
    // On native (not yet supported), we'd land here with an error.
    if (err) setError(err);
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Logo + title */}
        <View style={styles.hero}>
          <Image source={logoImage} style={styles.logo} />
          <Text style={styles.title}>
            <Text style={styles.titleAccent}>V</Text>ocabio
          </Text>
          <Text style={styles.tagline}>Apprenez l'espagnol, une session à la fois.</Text>
        </View>

        {/* Auth actions */}
        <View style={styles.actions}>
          <View style={styles.googleButton}>
            <Button
              label="Continuer avec Google"
              variant="secondary"
              onPress={handleGoogleSignIn}
              loading={loading}
            />
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>ou</Text>
            <View style={styles.dividerLine} />
          </View>

          <Button
            label="Essayer en tant qu'invité"
            variant="ghost"
            onPress={continueAsGuest}
          />
        </View>

        <Text style={styles.hint}>
          Le compte Google permet de sauvegarder ta progression.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
    justifyContent: 'space-between',
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  logo: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: Typography.sizes.display,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
    letterSpacing: -1,
  },
  titleAccent: {
    color: Colors.success,
  },
  tagline: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    gap: Spacing.md,
  },
  googleButton: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.full,
    ...Shadow.card,
  },
  error: {
    color: Colors.error,
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
    fontWeight: Typography.weights.medium,
  },
  hint: {
    textAlign: 'center',
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
    marginTop: Spacing.lg,
  },
});
