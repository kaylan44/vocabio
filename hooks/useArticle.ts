import { useCallback, useEffect, useRef, useState } from 'react';
import { articlesApi } from '../services/api';
import type { Article, LoadStatus } from '../types';

/** One article with its text. Nothing is cached: it is fetched each time the screen opens. */
export function useArticle(articleId: string | undefined) {
  const [article, setArticle] = useState<Article | null>(null);
  const [status, setStatus] = useState<LoadStatus>('idle');
  // Ignore responses that arrive after a newer request was started
  const requestId = useRef(0);

  const refresh = useCallback(async () => {
    if (!articleId) return;

    const id = ++requestId.current;
    setStatus('loading');
    try {
      const data = await articlesApi.get(articleId);
      if (id !== requestId.current) return;
      setArticle(data);
      setStatus('ready');
    } catch {
      if (id === requestId.current) setStatus('error');
    }
  }, [articleId]);

  useEffect(() => {
    refresh();
    return () => {
      requestId.current++;
    };
  }, [refresh]);

  return { article, status, refresh };
}
