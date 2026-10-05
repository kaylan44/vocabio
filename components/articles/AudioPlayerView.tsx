import React, { useState } from 'react';
import { ActivityIndicator, GestureResponderEvent, LayoutChangeEvent, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ARTICLES_CONFIG } from '../../constants/config';
import { Colors, ControlSize, Radius, Spacing, Typography } from '../../constants/theme';
import { playbackProgress, seekTarget } from '../../features/articles/articleLogic';
import { formatClock } from '../../features/articles/format';

interface AudioPlayerViewProps {
  playing: boolean;
  loading?: boolean;       // the file is being downloaded: spinner instead of the play icon
  currentTime: number;     // seconds
  duration: number;        // seconds, 0 when unknown
  onToggle: () => void;
  // Absent before the file is loaded: the bar and the rewind button are then inert.
  onSeek?: (seconds: number) => void;
  onRewind?: () => void;
}

/**
 * Controls of the audio player: rewind, play / pause, progress bar and times.
 * Purely visual: it knows nothing about how the sound is produced, so the same view
 * is shown before the file is downloaded and while it plays.
 */
export const AudioPlayerView: React.FC<AudioPlayerViewProps> = ({
  playing,
  loading = false,
  currentTime,
  duration,
  onToggle,
  onSeek,
  onRewind,
}) => {
  const [trackWidth, setTrackWidth] = useState(0);
  const progress = playbackProgress(currentTime, duration);

  const handleTrackLayout = (e: LayoutChangeEvent) => setTrackWidth(e.nativeEvent.layout.width);
  const handleTrackPress = (e: GestureResponderEvent) => {
    onSeek?.(seekTarget(e.nativeEvent.locationX, trackWidth, duration));
  };

  return (
    <View style={styles.row}>
      <TouchableOpacity
        onPress={onRewind}
        disabled={!onRewind}
        accessibilityRole="button"
        accessibilityLabel={`Reculer de ${ARTICLES_CONFIG.rewindSeconds} secondes`}
        style={[styles.rewind, !onRewind && styles.inert]}
      >
        <Ionicons name="play-back" size={ControlSize.buttonIcon} color={Colors.textPrimary} />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onToggle}
        disabled={loading}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel={playing ? 'Mettre en pause' : "Écouter l'article"}
        style={styles.play}
      >
        {loading ? (
          <ActivityIndicator color={Colors.textOnPrimary} />
        ) : (
          <Ionicons
            name={playing ? 'pause' : 'play'}
            size={ControlSize.playIcon}
            color={Colors.textOnPrimary}
            // The play triangle looks off-centre in a circle without this nudge.
            style={playing ? undefined : styles.playNudge}
          />
        )}
      </TouchableOpacity>

      <View style={styles.timeline}>
        <Pressable
          onPress={handleTrackPress}
          onLayout={handleTrackLayout}
          disabled={!onSeek}
          hitSlop={ControlSize.progressHitSlop}
          accessibilityRole="adjustable"
          accessibilityLabel="Position dans l'audio"
          accessibilityValue={{ min: 0, max: Math.round(duration), now: Math.round(currentTime) }}
          style={styles.trackTouch}
        >
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${progress * 100}%` }]} />
          </View>
        </Pressable>
        <View style={styles.times}>
          <Text style={styles.time}>{formatClock(currentTime)}</Text>
          <Text style={styles.time}>{duration > 0 ? formatClock(duration) : '–:––'}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  rewind: {
    width: ControlSize.iconButton,
    height: ControlSize.iconButton,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inert: {
    opacity: 0.4,
  },
  play: {
    width: ControlSize.playButton,
    height: ControlSize.playButton,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
  },
  playNudge: {
    marginLeft: Spacing.xs / 2,
  },
  timeline: {
    flex: 1,
    gap: Spacing.xs,
  },
  // Taller than the visible bar so it is easy to hit.
  trackTouch: {
    paddingVertical: Spacing.sm,
  },
  track: {
    height: ControlSize.progressTrack,
    borderRadius: Radius.full,
    backgroundColor: Colors.border,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.full,
    backgroundColor: Colors.primary,
  },
  times: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  time: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    color: Colors.textSecondary,
    fontVariant: ['tabular-nums'],
  },
});
