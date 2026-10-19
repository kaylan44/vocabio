import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { quizApi } from '../services/api';
import type { Language, LoadStatus, QuizStats } from '../types';

/**
 * Quiz statistics of the signed-in user, computed by the backend. Reloaded on screen focus
 * and when the language changes. Without a language: every language together.
 */
export function useQuizStats(lang?: Language) {
  const [stats, setStats] = useState<QuizStats | null>(null);
  const [status, setStatus] = useState<LoadStatus>('idle');
  // Ignore responses that arrive after a newer request was started
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    const id = ++requestId.current;
    setStatus('loading');
    try {
      const data = await quizApi.getStats(lang);
      if (id !== requestId.current) return;
      setStats(data);
      setStatus('ready');
    } catch {
      if (id === requestId.current) setStatus('error');
    }
  }, [lang]);

  useFocusEffect(
    useCallback(() => {
      refresh();
      return () => {
        requestId.current++;
      };
    }, [refresh]),
  );

  return { stats, status, refresh };
}
