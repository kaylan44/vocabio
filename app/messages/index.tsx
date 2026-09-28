import { useCallback } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ConversationRow } from '../../components/messaging/ConversationRow';
import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Colors, ControlSize, Radius, Spacing, Typography } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';
import { useConversations } from '../../hooks/useConversations';

export default function ConversationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { conversations, status, refresh } = useConversations();

  const openConversation = useCallback(
    (id: string) => router.push(`/messages/${id}` as never),
    [router],
  );
  const openSearch = () => router.push('/messages/new' as never);

  const renderEmpty = () => {
    if (status === 'loading' || status === 'idle') {
      return <ActivityIndicator style={styles.centered} color={Colors.primary} />;
    }
    if (status === 'error') {
      return (
        <View style={styles.centered}>
          <Text style={styles.emptyText}>Impossible de charger vos conversations.</Text>
          <Button label="Réessayer" variant="secondary" onPress={refresh} />
        </View>
      );
    }
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyTitle}>Aucune conversation</Text>
        <Text style={styles.emptyText}>Trouvez un autre apprenant et écrivez-lui en espagnol !</Text>
        <Button label="Nouvelle conversation" onPress={openSearch} />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title="Messages"
        onBack={() => router.replace('/')}
        trailing={
          <TouchableOpacity style={styles.newButton} onPress={openSearch} accessibilityLabel="Nouvelle conversation">
            <Text style={styles.newIcon}>✎</Text>
          </TouchableOpacity>
        }
      />
      <FlatList
        data={conversations}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <ConversationRow conversation={item} myUserId={user?.id ?? null} onPress={openConversation} />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={conversations.length === 0 && styles.emptyContainer}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  newButton: {
    width: ControlSize.iconButton,
    height: ControlSize.iconButton,
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newIcon: {
    fontSize: Typography.sizes.lg,
    color: Colors.textOnPrimary,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
  emptyContainer: {
    flexGrow: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.xl,
  },
  emptyTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  emptyText: {
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
