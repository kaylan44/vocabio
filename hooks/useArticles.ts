import { useCallback, useEffect, useRef, useState } from 'react';
import { ARTICLES_CONFIG } from '../constants/config';
import { hasMorePages, mergeArticles } from '../features/articles/articleLogic';
import { articlesApi } from '../services/api';
import type { ArticleLevelFilter, ArticleSummary, LoadStatus } from '../types';

/**
 * Article list for the list screen: level filter and "load more" pagination.
 *
 * Loaded when the screen mounts and when the filter changes, not on every focus:
 * coming back from an article must keep the list, its pages and its scroll position.
 */
export function useArticles() {
  const [level, setLevel] = useState<ArticleLevelFilter>('all');
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [status, setStatus] = useState<LoadStatus>('idle');
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreFailed, setLoadMoreFailed] = useState(false);
  // Ignore responses that arrive after a newer request was started (filter changed, refresh)
  const requestId = useRef(0);

  const load = useCallback(async (filter: ArticleLevelFilter) => {
    const id = ++requestId.current;
    setStatus('loading');
    setArticles([]);
    setHasMore(false);
    setLoadingMore(false);
    setLoadMoreFailed(false);
    try {
      const page = await articlesApi.list(filter, 0, ARTICLES_CONFIG.pageSize);
      if (id !== requestId.current) return;
      setArticles(page.articles);
      setHasMore(hasMorePages(page.articles.length, ARTICLES_CONFIG.pageSize));
      setStatus('ready');
    } catch {
      if (id === requestId.current) setStatus('error');
    }
  }, []);

  useEffect(() => {
    load(level);
    return () => {
      requestId.current++;
    };
  }, [level, load]);

  const refresh = useCallback(() => load(level), [level, load]);

  const loadMore = useCallback(async () => {
    if (status !== 'ready' || !hasMore || loadingMore) return;

    const id = requestId.current;
    setLoadingMore(true);
    setLoadMoreFailed(false);
    try {
      // Offset = what we already show, like the chat history.
      const page = await articlesApi.list(level, articles.length, ARTICLES_CONFIG.pageSize);
      if (id !== requestId.current) return;
      setArticles(current => mergeArticles(current, page.articles));
      setHasMore(hasMorePages(page.articles.length, ARTICLES_CONFIG.pageSize));
    } catch {
      // The articles already shown stay: only the "load more" button reports the failure.
      if (id === requestId.current) setLoadMoreFailed(true);
    } finally {
      if (id === requestId.current) setLoadingMore(false);
    }
  }, [status, hasMore, loadingMore, level, articles.length]);

  return { articles, status, level, setLevel, hasMore, loadingMore, loadMoreFailed, loadMore, refresh };
}
