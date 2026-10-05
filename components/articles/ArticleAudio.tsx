import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { ARTICLES_CONFIG } from '../../constants/config';
import { Colors, ControlSize, Radius, Shadow, Spacing, Typography } from '../../constants/theme';
import type { LoadStatus } from '../../types';
import { Button } from '../ui/Button';
import { AudioPlayerView } from './AudioPlayerView';

interface ArticleAudioProps {
  hasAudio: boolean;
  supported: boolean;          // false on platforms where the audio cannot be played yet
  durationSec: number | null;  // from the article, shown before the file is downloaded
  status: LoadStatus;          // download of the file
  uri: string | null;          // local URL of the downloaded file, once ready
  onLoad: () => void;          // starts (or retries) the download
}

// How often the position is refreshed while playing. The default (500 ms) makes the
// progress bar visibly jump.
const STATUS_INTERVAL_MS = 250;
// "Finished" tolerance: players stop a few milliseconds before the reported duration.
const END_MARGIN_SEC = 0.3;

/** The real player, mounted only once the file is available locally. */
function LoadedPlayer({ uri, fallbackDuration }: { uri: string; fallbackDuration: number }) {
  const player = useAudioPlayer({ uri }, { updateInterval: STATUS_INTERVAL_MS });
  const status = useAudioPlayerStatus(player);
  // The file's own duration once known, the article's metadata until then.
  const duration = status.duration > 0 ? status.duration : fallbackDuration;

  // The user pressed play to get here (that press started the download), so start
  // right away. A browser may still refuse (autoplay policy): the button then simply
  // stays on "play" and a second press works.
  useEffect(() => {
    try {
      player.play();
    } catch {
      // nothing to do: the play button is still there
    }
  }, [player]);

  const handleToggle = () => {
    if (status.playing) {
      player.pause();
      return;
    }
    // At the end of the track, "play" starts over instead of doing nothing.
    if (duration > 0 && status.currentTime >= duration - END_MARGIN_SEC) player.seekTo(0);
    player.play();
  };

  return (
    <AudioPlayerView
      playing={status.playing}
      currentTime={status.currentTime}
      duration={duration}
      onToggle={handleToggle}
      onSeek={seconds => player.seekTo(seconds)}
      onRewind={() => player.seekTo(Math.max(0, status.currentTime - ARTICLES_CONFIG.rewindSeconds))}
    />
  );
}

/**
 * "Listen" card of an article. The file is only downloaded on the first press on play,
 * so the card walks through: idle → downloading → playing (or an error with a retry).
 */
export const ArticleAudio: React.FC<ArticleAudioProps> = ({
  hasAudio,
  supported,
  durationSec,
  status,
  uri,
  onLoad,
}) => {
  const fallbackDuration = durationSec ?? 0;

  const renderContent = () => {
    if (!hasAudio) {
      return <Text style={styles.note}>Cet article n'a pas de version audio.</Text>;
    }
    if (!supported) {
      return <Text style={styles.note}>L'écoute est disponible sur la version web pour le moment.</Text>;
    }
    if (status === 'error') {
      return (
        <View style={styles.error}>
          <Text style={styles.note}>Impossible de charger l'audio.</Text>
          <Button label="Réessayer" variant="secondary" icon="refresh" onPress={onLoad} />
        </View>
      );
    }
    if (status === 'ready' && uri) {
      return <LoadedPlayer uri={uri} fallbackDuration={fallbackDuration} />;
    }
    // Idle or downloading: same controls, not wired to a sound yet.
    return (
      <AudioPlayerView
        playing={false}
        loading={status === 'loading'}
        currentTime={0}
        duration={fallbackDuration}
        onToggle={onLoad}
      />
    );
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="headset" size={ControlSize.buttonIcon} color={Colors.primary} />
        <Text style={styles.title}>Écouter l'article</Text>
      </View>
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    gap: Spacing.md,
    ...Shadow.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.semibold,
    color: Colors.textTertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  note: {
    fontSize: Typography.sizes.md,
    lineHeight: Typography.lineHeights.body,
    color: Colors.textSecondary,
  },
  error: {
    gap: Spacing.md,
  },
});
