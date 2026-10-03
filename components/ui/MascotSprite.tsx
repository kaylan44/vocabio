import React from 'react';
import { Image, ImageSourcePropType, StyleSheet } from 'react-native';

export type MascotPose = 'run' | 'hug' | 'cool' | 'happy';

// Sprites cut from the mascot sheet. `ratio` is width / height of each PNG:
// update it when a file in assets/mascot/ is replaced.
const SPRITES: Record<MascotPose, { source: ImageSourcePropType; ratio: number }> = {
  run: { source: require('../../assets/mascot/run.png'), ratio: 216 / 336 },
  hug: { source: require('../../assets/mascot/hug.png'), ratio: 221 / 298 },
  cool: { source: require('../../assets/mascot/cool.png'), ratio: 268 / 265 },
  happy: { source: require('../../assets/mascot/happy.png'), ratio: 252 / 243 },
};

interface MascotSpriteProps {
  pose: MascotPose;
  height: number;
}

export const MascotSprite: React.FC<MascotSpriteProps> = ({ pose, height }) => (
  <Image
    source={SPRITES[pose].source}
    style={[styles.image, { height, width: height * SPRITES[pose].ratio }]}
    testID={`mascot-${pose}`}
    accessibilityRole="image"
    accessibilityLabel="Mascotte Vocabio"
  />
);

const styles = StyleSheet.create({
  image: {
    resizeMode: 'contain',
  },
});
