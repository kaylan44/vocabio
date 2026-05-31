import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useProgressStore } from '../store/progressStore';
import { Colors } from '../constants/theme';

export default function RootLayout() {
  const loadProgress = useProgressStore(s => s.loadProgress);

  // Load persisted progress on app start
  useEffect(() => {
    loadProgress();
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background },
          animation: 'fade_from_bottom',
        }}
      />
    </>
  );
}
