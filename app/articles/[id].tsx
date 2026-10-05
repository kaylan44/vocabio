import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Ionicons } from '@expo/vector-icons';
import { ArticleAudio } from '../../components/articles/ArticleAudio';
import { ArticleBody } from '../../components/articles/ArticleBody';
import { LevelBadge } from '../../components/articles/LevelBadge';
import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { Colors, ControlSize, Layout, Radius, Spacing, Typography } from '../../constants/theme';
import { formatArticleDate, formatListenTime, formatSource } from '../../features/articles/format';
import { useArticle } from '../../hooks/useArticle';
import { useArticleAudio } from '../../hooks/useArticleAudio';

export default function ArticleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { article, status, refresh } = useArticle(id);
  const audio = useArticleAudio(id);

  // Direct load of /articles/<id> (e.g. web refresh) has no history to go back to.
  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/articles' as never);
  };

  // The address comes from the API: only open a real https link.
  const handleOpenSource = () => {
    if (article?.url.startsWith('https://')) WebBrowser.openBrowserAsync(article.url);
  };

  const renderContent = () => {
    if (status === 'error') {
      return (
        <View style={styles.centered}>
          <Text style={styles.stateTitle}>Impossible de charger cet article</Text>
          <Text style={styles.stateText}>Il a peut-être été retiré. Vous pouvez réessayer ou revenir à la liste.</Text>
          <Button label="Réessayer" variant="secondary" icon="refresh" onPress={refresh} />
        </View>
      );
    }
    if (!article) {
      return <ActivityIndicator style={styles.centered} color={Colors.primary} />;
    }

    const hasGlosses = article.content.some(block => block.segments.some(segment => segment.gloss));

    return (
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.meta}>
          <LevelBadge level={article.level} />
          <Text style={styles.metaText}>{formatArticleDate(article.publishedAt)}</Text>
          {article.hasAudio && article.audioDurationSec ? (
            <View style={styles.metaAudio}>
              <Ionicons name="headset-outline" size={ControlSize.buttonIcon} color={Colors.textTertiary} />
              <Text style={styles.metaText}>{formatListenTime(article.audioDurationSec)}</Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.title} accessibilityRole="header">{article.title}</Text>

        {hasGlosses ? (
          <View style={styles.hint}>
            <Ionicons name="bulb-outline" size={ControlSize.buttonIcon} color={Colors.primaryDark} />
            <Text style={styles.hintText}>Touchez une expression soulignée pour voir sa traduction.</Text>
          </View>
        ) : null}

        <ArticleBody content={article.content} />

        <ArticleAudio
          hasAudio={article.hasAudio}
          supported={audio.supported}
          durationSec={article.audioDurationSec}
          status={audio.status}
          uri={audio.uri}
          onLoad={audio.load}
        />

        <TouchableOpacity
          onPress={handleOpenSource}
          accessibilityRole="link"
          accessibilityLabel={`Lire l'article original sur ${formatSource(article.source)}`}
          style={styles.source}
        >
          <Text style={styles.sourceText}>
            Source : <Text style={styles.sourceName}>{formatSource(article.source)}</Text>
          </Text>
          <Ionicons name="open-outline" size={ControlSize.buttonIcon} color={Colors.textSecondary} />
        </TouchableOpacity>
      </ScrollView>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScreenHeader title="Article" onBack={handleBack} />
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  // Narrower than the other screens: long lines are tiring to read.
  scroll: {
    flexGrow: 1,
    width: '100%',
    maxWidth: Layout.readingMaxWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  meta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.md,
  },
  metaAudio: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  metaText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textTertiary,
  },
  title: {
    fontSize: Typography.sizes.xxl,
    lineHeight: Typography.lineHeights.title,
    fontWeight: Typography.weights.extrabold,
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  hint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
  },
  hintText: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    color: Colors.primaryDark,
  },
  source: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  sourceText: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  sourceName: {
    fontWeight: Typography.weights.semibold,
    textDecorationLine: 'underline',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
  },
  stateTitle: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  stateText: {
    fontSize: Typography.sizes.md,
    lineHeight: Typography.lineHeights.body,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
