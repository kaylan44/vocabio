import { useEffect } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '../components/ui/Button';
import { Colors, Radius, Shadow, Spacing, Typography } from '../constants/theme';
import { useAuth } from '../hooks/useAuth';

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value ?? '—'}</Text>
    </View>
  );
}

export default function AccountScreen() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, signOut } = useAuth();

  // Guard: only accessible when authenticated with Google
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/' as never);
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading || !user) return null;

  const handleSignOut = async () => {
    await signOut();
    // AuthGate in _layout will redirect to /login automatically
  };

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
          {user.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>
                {user.fullName?.[0]?.toUpperCase() ?? '?'}
              </Text>
            </View>
          )}
          <Text style={styles.fullName}>{user.fullName ?? 'Utilisateur'}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        {/* Details */}
        <View style={styles.infoCard}>
          <InfoRow label="Identifiant" value={user.id} />
          <View style={styles.separator} />
          <InfoRow label="Connexion via" value={user.provider} />
          <View style={styles.separator} />
          <InfoRow label="Membre depuis" value={formattedDate} />
        </View>

        {/* Sign out */}
        <View style={styles.signOutSection}>
          <Button label="Se déconnecter" variant="secondary" onPress={handleSignOut} />
        </View>
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
  signOutSection: {
    marginTop: Spacing.sm,
  },
});
