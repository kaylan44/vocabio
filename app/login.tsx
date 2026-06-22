import { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { GoogleLogo } from '../components/ui/GoogleLogo';
import { Colors, Radius, Shadow, Spacing, Typography } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';

const logoImage = require('../assets/vocabio-logo.png');

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

function AuthButton({
  onPress,
  disabled,
  children,
  style,
}: {
  onPress: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  style?: object;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedTouchable
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.9}
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 15, stiffness: 300 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
      style={[styles.authButton, style, animStyle]}
    >
      {children}
    </AnimatedTouchable>
  );
}

// Inline SVG Google logo as a URI for cross-platform compatibility

export default function LoginScreen() {
  const router = useRouter();
  const { signInWithGoogle, continueAsGuest } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    const { error: err } = await signInWithGoogle();
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
          {/* Google button */}
          <AuthButton onPress={handleGoogleSignIn} disabled={loading} style={styles.googleButton}>
            {loading ? (
              <ActivityIndicator color={Colors.textPrimary} />
            ) : (
              <>
                <GoogleLogo />
                <Text style={styles.googleLabel}>Continuer avec Google</Text>
              </>
            )}
          </AuthButton>

          {error && <Text style={styles.error}>{error}</Text>}

          {/* Guest button */}
          <AuthButton onPress={async () => { await continueAsGuest(); router.replace('/'); }} style={styles.guestButton}>
            <Text style={styles.guestLabel}>Essayer en tant qu'invité</Text>
          </AuthButton>
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
  authButton: {
    height: 52,
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  googleButton: {
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadow.card,
  },

  googleLabel: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textPrimary,
    letterSpacing: 0.2,
  },
  guestButton: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  guestLabel: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: Colors.textTertiary,
    letterSpacing: 0.2,
  },
  error: {
    color: Colors.error,
    fontSize: Typography.sizes.sm,
    textAlign: 'center',
  },
  hint: {
    textAlign: 'center',
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
    marginTop: Spacing.lg,
  },
});
