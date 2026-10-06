import { useState } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { UserRow } from '../../components/messaging/UserRow';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Colors, Radius, Spacing, Typography } from '../../constants/theme';
import { useUserSearch } from '../../hooks/useUserSearch';
import type { ChatUser } from '../../types';

export default function NewConversationScreen() {
  const router = useRouter();
  const { query, setQuery, results, status, openingUserId, startConversation } = useUserSearch();
  const [openError, setOpenError] = useState(false);

  const handleSelect = async (user: ChatUser) => {
    setOpenError(false);
    const conversationId = await startConversation(user);
    if (!conversationId) {
      setOpenError(true);
      return;
    }
    // replace: back from the chat should return to the list, not to the search
    router.replace(`/messages/${conversationId}` as never);
  };

  const renderEmpty = () => {
    if (status === 'loading') return <ActivityIndicator style={styles.hint} color={Colors.primary} />;
    if (status === 'error') return <Text style={styles.hint}>Le chargement a échoué. Réessaie.</Text>;
    if (query.trim()) return <Text style={styles.hint}>Aucun utilisateur trouvé.</Text>;
    return <Text style={styles.hint}>Aucun autre apprenant pour l'instant.</Text>;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Nouvelle conversation" onBack={() => router.back()} />
      <View style={styles.searchBox}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Filtrer par nom…"
          placeholderTextColor={Colors.textTertiary}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Rechercher un utilisateur"
        />
      </View>
      {openError ? <Text style={styles.error}>Impossible d'ouvrir la conversation. Réessaie.</Text> : null}
      <FlatList
        data={results}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <UserRow
            user={item}
            loading={openingUserId === item.id}
            disabled={openingUserId !== null}
            onPress={handleSelect}
          />
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={renderEmpty}
        keyboardShouldPersistTaps="handled"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchBox: {
    padding: Spacing.md,
  },
  input: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + Spacing.xs,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    fontSize: Typography.sizes.input,
    color: Colors.textPrimary,
  },
  hint: {
    padding: Spacing.xl,
    textAlign: 'center',
    fontSize: Typography.sizes.md,
    color: Colors.textSecondary,
  },
  error: {
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.sm,
    backgroundColor: Colors.errorLight,
    color: Colors.error,
    fontSize: Typography.sizes.sm,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.borderLight,
  },
});
