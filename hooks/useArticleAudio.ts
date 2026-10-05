import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { articlesApi } from '../services/api';
import type { LoadStatus } from '../types';

// Web only for now. The file is downloaded as a Blob and played from a blob: URL, which
// only a browser can do. Native needs the file written to the cache directory first
// (expo-file-system); not done yet because sign-in itself is web-only.
// Read when called, not once at import, so a test can switch platform.
export const isArticleAudioSupported = (): boolean => Platform.OS === 'web';

/**
 * Audio of an article, downloaded on demand.
 *
 * Nothing is fetched until `load()` is called (first press on play): opening an article
 * to read it must not cost a 2 MB download. The backend route needs the JWT, so the file
 * is fetched by the API client and handed to the player as a local blob: URL.
 */
export function useArticleAudio(articleId: string | undefined) {
  const [uri, setUri] = useState<string | null>(null);
  const [status, setStatus] = useState<LoadStatus>('idle');
  // Ignore a download that finishes after the article changed or the screen closed
  const requestId = useRef(0);
  const currentUri = useRef<string | null>(null);

  // A blob: URL keeps its file in memory until it is revoked.
  const release = useCallback(() => {
    if (currentUri.current) {
      URL.revokeObjectURL(currentUri.current);
      currentUri.current = null;
    }
  }, []);

  useEffect(() => {
    setUri(null);
    setStatus('idle');
    return () => {
      requestId.current++;
      release();
    };
  }, [articleId, release]);

  const load = useCallback(async () => {
    if (!articleId || !isArticleAudioSupported() || status === 'loading' || status === 'ready') return;

    const id = ++requestId.current;
    setStatus('loading');
    try {
      const blob = await articlesApi.getAudio(articleId);
      if (id !== requestId.current) return;
      release();
      currentUri.current = URL.createObjectURL(blob);
      setUri(currentUri.current);
      setStatus('ready');
    } catch {
      if (id === requestId.current) setStatus('error');
    }
  }, [articleId, status, release]);

  return { uri, status, load, supported: isArticleAudioSupported() };
}
