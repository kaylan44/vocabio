import { Platform } from 'react-native';
import { supabase } from './supabase';

export async function performGoogleSignIn(): Promise<{ error: string | null }> {
  if (Platform.OS === 'web') {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    return { error: error?.message ?? null };
  }

  // Native: PKCE flow — requires expo-auth-session + expo-crypto
  // Placeholder for when a dev build is ready.
  return { error: 'Google Sign-In not yet configured for native.' };
}
