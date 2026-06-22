import { useEffect } from 'react';
import { Image, Platform, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Colors, Radius, Shadow, Spacing, Typography } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const POWER_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="%23DC2626" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>`;

function PowerIcon() {
  if (Platform.OS !== 'web') return null;
  return (
    <div
      style={{ width: 18, height: 18, flexShrink: 0 }}
      dangerouslySetInnerHTML={{
        __html: `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/></svg>`,
      }}
    />
  );
}

function SignOutButton({ onPress }: { onPress: () => void }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedTouchable
      onPress={onPress}
      activeOpacity={0.9}
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 15, stiffness: 300 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15, stiffness: 300 }); }}
      style={[styles.signOutButton, animStyle]}
    >
      <PowerIcon />
      <Text style={styles.signOutLabel}>Se déconnecter</Text>
    </AnimatedTouchable>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value ?? '—'}</Text>
    </View>
  );
}

// Google serves avatar images with a restrictive referrer policy.
// On web, we need to pass referrerPolicy="no-referrer" to load them.
function Avatar({ uri, name }: { uri: string | null; name: string | null }) {
  if (!uri) {
    return (
      <View style={styles.avatarPlaceholder}>
        <Text style={styles.avatarInitial}>{name?.[0]?.toUpperCase() ?? '?'}</Text>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <img
        src={uri}
        referrerPolicy="no-referrer"
        style={{ width: 80, height: 80, borderRadius: 999, objectFit: 'cover', marginBottom: Spacing.sm }}
        alt={name ?? 'Avatar'}
      />
    );
  }

  return <Image source={{ uri }} style={styles.avatar} />;
}

export default function AccountScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, signOut } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/' as never);
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading || !user) return null;

  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Mon compte</Text>
        </View>

        {/* Avatar + name */}
        <View style={styles.profileCard}>
          <Avatar uri={user.avatarUrl} name={user.fullName} />
          <Text style={styles.fullName}>{user.fullName ?? 'Utilisateur'}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        {/* Details */}
        <View style={styles.infoCard}>
          <InfoRow label="Connexion via" value={user.provider} />
          <View style={styles.separator} />
          <InfoRow label="Membre depuis" value={formattedDate} />
        </View>

        {/* Sign out */}
        <SignOutButton onPress={signOut} />
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
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.xl,
  },
  header: {
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: Typography.sizes.xl,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: Spacing.sm,
    ...Shadow.card,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    marginBottom: Spacing.sm,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  avatarInitial: {
    fontSize: Typography.sizes.xxl,
    fontWeight: Typography.weights.bold,
    color: Colors.primary,
  },
  fullName: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  email: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingHorizontal: Spacing.lg,
    ...Shadow.card,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  infoLabel: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.weights.medium,
  },
  infoValue: {
    fontSize: Typography.sizes.sm,
    color: Colors.textPrimary,
    fontWeight: Typography.weights.semibold,
    flexShrink: 1,
    textAlign: 'right',
  },
  separator: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  signOutButton: {
    height: 52,
    borderRadius: Radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FECACA',
  },
  signOutLabel: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.semibold,
    color: '#DC2626',
    letterSpacing: 0.2,
  },
});
