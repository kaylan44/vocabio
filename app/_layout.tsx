import { useEffect, useRef } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { useProgressStore } from '../store/progressStore';
import { useAuthStore } from '../store/authStore';
import { Colors } from '../constants/theme';

function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const status = useAuthStore(s => s.status);

  useEffect(() => {
    if (status === 'loading') return;

    const onLoginScreen = (segments[0] as string) === 'login';

    if (status === 'unauthenticated' && !onLoginScreen) {
      router.replace('/login' as never);
    } else if (status === 'authenticated' && onLoginScreen) {
      // Only redirect away from login if already authenticated with Google,
      // not if guest — guests can visit login to sign in.
      router.replace('/');
    }
  }, [status, segments]);

  if (status === 'loading') {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
        <ActivityIndicator color={Colors.primary} />
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const loadProgress = useProgressStore(s => s.loadProgress);
  const init = useAuthStore(s => s.init);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    loadProgress();
    init().then(cleanup => {
      cleanupRef.current = cleanup;
    });
    return () => {
      cleanupRef.current?.();
    };
  }, []);

  return (
    <>
      <StatusBar style="dark" />
      <AuthGate>
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: Colors.background },
            animation: 'fade_from_bottom',
          }}
        />
      </AuthGate>
    </>
  );
}
