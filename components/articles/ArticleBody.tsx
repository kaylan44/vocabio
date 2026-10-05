import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, ControlSize, Radius, Spacing, Typography } from '../../constants/theme';
import { toggleGloss } from '../../features/articles/articleLogic';
import type { ArticleBlock, GlossPosition } from '../../types';

interface ArticleBodyProps {
  content: ArticleBlock[];
}

/**
 * Text of an article. Phrases the source explains are underlined; tapping one opens its
 * translation right under the paragraph, tapping it again (or the card) closes it.
 * Only one translation is open at a time, so the page never fills up with cards.
 */
export const ArticleBody: React.FC<ArticleBodyProps> = ({ content }) => {
  const [selected, setSelected] = useState<GlossPosition | null>(null);

  return (
    <View style={styles.body}>
      {content.map((block, blockIndex) => {
        const open = selected?.block === blockIndex ? block.segments[selected.segment] : undefined;

        return (
          <View key={blockIndex} style={styles.block}>
            <Text style={styles.paragraph}>
              {block.segments.map((segment, segmentIndex) => {
                if (!segment.gloss) return segment.text;

                const position = { block: blockIndex, segment: segmentIndex };
                const isOpen = selected?.block === blockIndex && selected.segment === segmentIndex;
                return (
                  <Text
                    key={segmentIndex}
                    onPress={() => setSelected(current => toggleGloss(current, position))}
                    accessibilityRole="button"
                    accessibilityLabel={`${segment.text}, voir la traduction`}
                    style={[styles.gloss, isOpen && styles.glossOpen]}
                  >
                    {segment.text}
                  </Text>
                );
              })}
            </Text>

            {open?.gloss ? (
              <TouchableOpacity
                onPress={() => setSelected(null)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityLabel="Fermer la traduction"
                style={styles.card}
              >
                <View style={styles.cardText}>
                  <Text style={styles.cardPhrase}>{open.text}</Text>
                  <Text style={styles.cardGloss}>{open.gloss}</Text>
                  {/* The source writes its explanations in English. */}
                  <Text style={styles.cardNote}>Traduction en anglais</Text>
                </View>
                <Ionicons name="close" size={ControlSize.buttonIcon} color={Colors.primaryDark} />
              </TouchableOpacity>
            ) : null}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  body: {
    gap: Spacing.lg,
  },
  block: {
    gap: Spacing.sm,
  },
  paragraph: {
    fontSize: Typography.sizes.lg,
    lineHeight: Typography.lineHeights.reading,
    color: Colors.textPrimary,
  },
  gloss: {
    color: Colors.primaryDark,
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
    textDecorationColor: Colors.primary,
  },
  glossOpen: {
    backgroundColor: Colors.primaryLight,
    fontWeight: Typography.weights.semibold,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    backgroundColor: Colors.primaryLight,
    borderLeftWidth: Spacing.xs,
    borderLeftColor: Colors.primary,
  },
  cardText: {
    flex: 1,
    gap: Spacing.xs / 2,
  },
  cardPhrase: {
    fontSize: Typography.sizes.sm,
    color: Colors.textSecondary,
  },
  cardGloss: {
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.bold,
    color: Colors.textPrimary,
  },
  cardNote: {
    fontSize: Typography.sizes.xs,
    color: Colors.textTertiary,
  },
});
