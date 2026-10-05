import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/authStore';
import { useProgressStore } from '../store/progressStore';

// Progress used to be stored on the device under this key. It is not imported: the
// leftover is just deleted. This cleanup can be removed once every install has run it.
const LEGACY_STORAGE_KEY = '@vocabio_progress_v1';

/**
 * Keeps progressStore in step with the account: loaded from the backend while
 * authenticated, emptied on sign-out. Guests have no progress (no JWT).
 * Mounted once in the root layout.
 */
export function useProgressSync(): void {
  const status = useAuthStore(s => s.status);
  const userId = useAuthStore(s => s.user?.id);

  useEffect(() => {
    AsyncStorage.removeItem(LEGACY_STORAGE_KEY).catch(() => {});
  }, []);

  useEffect(() => {
    if (status !== 'authenticated' || !userId) return;

    void useProgressStore.getState().loadProgress();
    return () => useProgressStore.getState().clearProgress();
  }, [status, userId]);
}
