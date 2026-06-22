import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session, Subscription } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { performGoogleSignIn } from '../lib/auth';
import type { AuthUser, AuthStatus } from '../types';

const GUEST_KEY = '@vocabio_guest';

function sessionToUser(session: Session): AuthUser {
  const meta = session.user.user_metadata ?? {};
  return {
    id: session.user.id,
    email: session.user.email ?? null,
    fullName: meta['full_name'] ?? meta['name'] ?? null,
    avatarUrl: meta['avatar_url'] ?? meta['picture'] ?? null,
    provider: session.user.app_metadata?.['provider'] ?? null,
    createdAt: session.user.created_at ?? null,
  };
}

// ─── Store definition ─────────────────────────────────────────────────────────

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  // Actions
  init: () => Promise<() => void>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  continueAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  status: 'loading',
  user: null,

  init: async () => {
    // Restore persisted session
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      set({ status: 'authenticated', user: sessionToUser(data.session) });
    } else {
      // Fall back to guest flag
      const isGuest = await AsyncStorage.getItem(GUEST_KEY);
      set({ status: isGuest === 'true' ? 'guest' : 'unauthenticated', user: null });
    }

    // Keep store in sync with Supabase auth events (token refresh, sign out from another tab…)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        await AsyncStorage.removeItem(GUEST_KEY);
        set({ status: 'authenticated', user: sessionToUser(session) });
      } else {
        const isGuest = await AsyncStorage.getItem(GUEST_KEY);
        set({ status: isGuest === 'true' ? 'guest' : 'unauthenticated', user: null });
      }
    });

    // Return cleanup so the caller can unsubscribe on unmount
    return () => subscription.unsubscribe();
  },

  signInWithGoogle: async () => {
    return performGoogleSignIn();
  },

  continueAsGuest: async () => {
    await AsyncStorage.setItem(GUEST_KEY, 'true');
    set({ status: 'guest', user: null });
  },

  signOut: async () => {
    await AsyncStorage.removeItem(GUEST_KEY);
    await supabase.auth.signOut();
    // onAuthStateChange will update the status to 'unauthenticated'
  },
}));
