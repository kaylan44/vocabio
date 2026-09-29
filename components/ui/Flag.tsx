import React from 'react';
import { Image, ImageSourcePropType, StyleSheet } from 'react-native';
import { Colors, ControlSize, Radius } from '../../constants/theme';

export type FlagCountry = 'fr' | 'es';

// Flag images from flagcdn.com (public domain), 160px wide — sharp up to 3x screens.
const FLAG_IMAGES: Record<FlagCountry, ImageSourcePropType> = {
  fr: require('../../assets/flags/fr.png'),
  es: require('../../assets/flags/es.png'),
};

// Both flags are officially 3:2.
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
    accessibilityLabel={country === 'fr' ? 'Drapeau français' : 'Drapeau espagnol'}
  />
);

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
    // Keeps the white band of the French flag visible on white cards.
    borderWidth: 1,
    borderColor: Colors.border,
  },
});
