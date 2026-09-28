import React from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import { AvatarSize, Colors, Radius, Typography } from '../../constants/theme';

interface AvatarProps {
  uri: string | null;
  name: string | null;
  size?: keyof typeof AvatarSize;
}

export const Avatar: React.FC<AvatarProps> = ({ uri, name, size = 'md' }) => {
  const dimension = AvatarSize[size];
  const box = { width: dimension, height: dimension };

  if (!uri) {
    return (
      <View style={[styles.placeholder, box]}>
        <Text style={[styles.initial, { fontSize: dimension * 0.4 }]}>
          {name?.trim()[0]?.toUpperCase() ?? '?'}
        </Text>
      </View>
    );
  }

  // Google avatars are served with a restrictive referrer policy: on web the
  // default <img> referrer gets a 403, so we bypass react-native-web's Image.
  if (Platform.OS === 'web') {
    return (
      <img
        src={uri}
        referrerPolicy="no-referrer"
        alt={name ?? 'Avatar'}
        style={{ ...box, borderRadius: Radius.full, objectFit: 'cover', flexShrink: 0 }}
      />
    );
  }

  return <Image source={{ uri }} style={[styles.image, box]} />;
};

const styles = StyleSheet.create({
  placeholder: {
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initial: {
    color: Colors.primary,
    fontWeight: Typography.weights.bold,
  },
  image: {
    borderRadius: Radius.full,
  },
});
