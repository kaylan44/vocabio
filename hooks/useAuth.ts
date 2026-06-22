import { useAuthStore } from '../store/authStore';

export function useAuth() {
  const status = useAuthStore(s => s.status);
  const user = useAuthStore(s => s.user);
  const signInWithGoogle = useAuthStore(s => s.signInWithGoogle);
  const continueAsGuest = useAuthStore(s => s.continueAsGuest);
  const signOut = useAuthStore(s => s.signOut);

  return {
    status,
    user,
    isLoading: status === 'loading',
    isAuthenticated: status === 'authenticated',
    isGuest: status === 'guest',
    signInWithGoogle,
    continueAsGuest,
    signOut,
  };
}
