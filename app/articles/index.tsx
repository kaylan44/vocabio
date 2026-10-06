import { useCallback } from 'react';
import { ActivityIndicator, FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ArticleRow } from '../../components/articles/ArticleRow';
import { LevelFilter } from '../../components/articles/LevelFilter';
import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Colors, ControlSize, Layout, Radius, Spacing, Typography } from '../../constants/theme';
import { useArticles } from '../../hooks/useArticles';

export default function ArticlesScreen() {
  const router = useRouter();
  const { articles, status, level, setLevel, hasMore, loadingMore, loadMoreFailed, loadMore, refresh } =
    useArticles();

  const openArticle = useCallback(
    (id: string) => router.push(`/articles/${id}` as never),
    [router],
  );

  // Direct load of /articles (e.g. web refresh) has no history to go back to.
  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/' as never);
  };

  const renderEmpty = () => {
    if (status === 'loading' || status === 'idle') {
      return <ActivityIndicator style={styles.centered} color={Colors.primary} />;
    }
    if (status === 'error') {
      return (
        <View style={styles.centered}>
          <Text style={styles.emptyTitle}>Impossible de charger les articles</Text>
          <Text style={styles.emptyText}>Vérifie ta connexion, puis réessaie.</Text>
          <Button label="Réessayer" variant="secondary" icon="refresh" onPress={refresh} />
        </View>
      );
    }
    return (
      <View style={styles.centered}>
        <View style={styles.emptyIcon}>
          <Ionicons name="newspaper-outline" size={ControlSize.playIcon} color={Colors.primary} />
        </View>
        <Text style={styles.emptyTitle}>Aucun article pour le moment</Text>
        <Text style={styles.emptyText}>
          {level === 'all'
            ? 'De nouveaux articles arrivent chaque jour. Reviens un peu plus tard.'
            : 'Aucun article à ce niveau. Essaie un autre filtre.'}
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={styles.footer}>
        {loadMoreFailed ? <Text style={styles.emptyText}>Le chargement a échoué.</Text> : null}
        <Button
          label={loadMoreFailed ? 'Réessayer' : "Voir plus d'articles"}
          variant="secondary"
          loading={loadingMore}
          onPress={loadMore}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader
        title="Lire en espagnol"
        subtitle="Des actualités courtes, à lire et à écouter"
        onBack={handleBack}
      />
      <FlatList
        data={articles}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <ArticleRow article={item} onPress={openArticle} />}
        ListHeaderComponent={
          <View style={styles.filter}>
            <LevelFilter value={level} onChange={setLevel} />
          </View>
        }
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // Same centred column as Home, so cards do not stretch edge to edge on tablet and web.
  list: {
    flexGrow: 1,
    width: '100%',
    maxWidth: Layout.contentMaxWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  filter: {
    marginBottom: Spacing.lg,
  },
  separator: {
    height: Spacing.md,
  },
  footer: {
    marginTop: Spacing.lg,
    gap: Spacing.sm,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.xxl,
  },
  emptyIcon: {
    width: ControlSize.playButton,
    height: ControlSize.playButton,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primaryLight,
  },
  emptyTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: Typography.sizes.md,
    lineHeight: Typography.lineHeights.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
