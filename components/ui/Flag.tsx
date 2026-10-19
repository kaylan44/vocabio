import React from 'react';
import { Image, ImageSourcePropType, StyleSheet } from 'react-native';
import { Colors, ControlSize, Radius } from '../../constants/theme';
import { FlagCountry } from '../../types';

export type { FlagCountry };

// Flag images from flagcdn.com (public domain), 160px wide — sharp up to 3x screens.
const FLAG_IMAGES: Record<FlagCountry, ImageSourcePropType> = {
  fr: require('../../assets/flags/fr.png'),
  es: require('../../assets/flags/es.png'),
  id: require('../../assets/flags/id.png'),
};

const FLAG_LABELS: Record<FlagCountry, string> = {
  fr: 'Drapeau français',
  es: 'Drapeau espagnol',
  id: 'Drapeau indonésien',
};

// All the flags are drawn 3:2 (flagcdn crops them to the same size).
const ASPECT_RATIO = 3 / 2;

interface FlagProps {
  country: FlagCountry;
  height?: number;
}

export const Flag: React.FC<FlagProps> = ({ country, height = ControlSize.flag }) => (
  <Image
    source={FLAG_IMAGES[country]}
    // Radius scales down with small flags so they don't turn into pills.
    style={[styles.image, { height, width: height * ASPECT_RATIO, borderRadius: Math.min(Radius.sm, height / 4) }]}
    accessibilityRole="image"
    accessibilityLabel={FLAG_LABELS[country]}
  />
);

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
    // Keeps the white bands of the French and Indonesian flags visible on white cards.
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
