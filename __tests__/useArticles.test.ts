jest.mock('../services/api', () => ({
  articlesApi: { list: jest.fn(), get: jest.fn(), getAudio: jest.fn() },
}));

import { act, renderHook } from '@testing-library/react-hooks';
import { Platform } from 'react-native';
import { ARTICLES_CONFIG } from '../constants/config';
import { useArticle } from '../hooks/useArticle';
import { useArticleAudio } from '../hooks/useArticleAudio';
import { useArticles } from '../hooks/useArticles';
import { articlesApi } from '../services/api';
import type { Article, ArticleSummary, ArticlesPage } from '../types';

const list = articlesApi.list as jest.MockedFunction<typeof articlesApi.list>;
const get = articlesApi.get as jest.MockedFunction<typeof articlesApi.get>;
const getAudio = articlesApi.getAudio as jest.MockedFunction<typeof articlesApi.getAudio>;

const PAGE_SIZE = ARTICLES_CONFIG.pageSize;

const summary = (id: string): ArticleSummary => ({
  id,
  source: 'holaquepasa',
  lang: 'es',
  level: 'easy',
  title: `Artículo ${id}`,
  excerpt: 'Texto.',
  url: 'https://holaquepasa.com/a/',
  publishedAt: '2026-10-03T12:00:00.000Z',
  audioDurationSec: 232,
  hasAudio: true,
});

const page = (ids: string[], offset = 0): ArticlesPage => ({
  articles: ids.map(summary),
  pagination: { offset, limit: PAGE_SIZE, count: ids.length },
});

const fullPage = (prefix: string) => Array.from({ length: PAGE_SIZE }, (_, i) => `${prefix}${i}`);

// A request the test finishes by hand, to control the order of two answers.
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>(r => { resolve = r; });
  return { promise, resolve };
}

async function flush() {
  await act(async () => {});
}

beforeEach(() => {
  list.mockReset();
  get.mockReset();
  getAudio.mockReset();
});

describe('useArticles', () => {
  it('loads the first page without a level filter', async () => {
    list.mockResolvedValue(page(['a', 'b']));
    const { result } = renderHook(() => useArticles());
    expect(result.current.status).toBe('loading');

    await flush();
    expect(list).toHaveBeenCalledWith('all', 0, PAGE_SIZE);
    expect(result.current.status).toBe('ready');
    expect(result.current.articles.map(a => a.id)).toEqual(['a', 'b']);
    // A short page is the end of the list.
    expect(result.current.hasMore).toBe(false);
  });

  it('reports an error when the first page fails, and refresh() retries', async () => {
    list.mockRejectedValueOnce(new Error('offline'));
    const { result } = renderHook(() => useArticles());
    await flush();
    expect(result.current.status).toBe('error');

    list.mockResolvedValue(page(['a']));
    await act(async () => { await result.current.refresh(); });
    expect(result.current.status).toBe('ready');
    expect(result.current.articles).toHaveLength(1);
  });

  it('reloads from the start when the level changes', async () => {
    list.mockResolvedValue(page(['a']));
    const { result } = renderHook(() => useArticles());
    await flush();

    list.mockResolvedValue(page(['z']));
    act(() => result.current.setLevel('intermediate'));
    // The previous level's articles must not stay on screen under the new filter.
    expect(result.current.articles).toEqual([]);
    expect(result.current.status).toBe('loading');

    await flush();
    expect(list).toHaveBeenLastCalledWith('intermediate', 0, PAGE_SIZE);
    expect(result.current.articles.map(a => a.id)).toEqual(['z']);
  });

  it('ignores the answer of a previous filter that arrives late', async () => {
    const slow = deferred<ArticlesPage>();
    list.mockReturnValueOnce(slow.promise);
    const { result } = renderHook(() => useArticles());

    list.mockResolvedValue(page(['easy-1']));
    act(() => result.current.setLevel('easy'));
    await flush();
    expect(result.current.articles.map(a => a.id)).toEqual(['easy-1']);

    // The "all" request finally answers: it must not replace the "easy" list.
    await act(async () => { slow.resolve(page(['all-1', 'all-2'])); });
    expect(result.current.articles.map(a => a.id)).toEqual(['easy-1']);
  });

  it('loadMore appends the next page, asked from the number of articles shown', async () => {
    list.mockResolvedValueOnce(page(fullPage('a')));
    const { result } = renderHook(() => useArticles());
    await flush();
    expect(result.current.hasMore).toBe(true);

    list.mockResolvedValueOnce(page(['b0', 'b1'], PAGE_SIZE));
    await act(async () => { await result.current.loadMore(); });

    expect(list).toHaveBeenLastCalledWith('all', PAGE_SIZE, PAGE_SIZE);
    expect(result.current.articles).toHaveLength(PAGE_SIZE + 2);
    expect(result.current.hasMore).toBe(false);
    expect(result.current.loadingMore).toBe(false);
  });

  it('loadMore does not duplicate an article sent again by a shifted page', async () => {
    list.mockResolvedValueOnce(page(fullPage('a')));
    const { result } = renderHook(() => useArticles());
    await flush();

    list.mockResolvedValueOnce(page([`a${PAGE_SIZE - 1}`, 'b0'], PAGE_SIZE));
    await act(async () => { await result.current.loadMore(); });

    expect(result.current.articles).toHaveLength(PAGE_SIZE + 1);
  });

  it('loadMore keeps the articles shown when the next page fails', async () => {
    list.mockResolvedValueOnce(page(fullPage('a')));
    const { result } = renderHook(() => useArticles());
    await flush();

    list.mockRejectedValueOnce(new Error('offline'));
    await act(async () => { await result.current.loadMore(); });

    expect(result.current.articles).toHaveLength(PAGE_SIZE);
    expect(result.current.status).toBe('ready');
    expect(result.current.loadMoreFailed).toBe(true);
    // Still possible to try again.
    expect(result.current.hasMore).toBe(true);
  });

  it('loadMore does nothing at the end of the list', async () => {
    list.mockResolvedValue(page(['a']));
    const { result } = renderHook(() => useArticles());
    await flush();

    await act(async () => { await result.current.loadMore(); });
    expect(list).toHaveBeenCalledTimes(1);
  });
});

describe('useArticle', () => {
  const ARTICLE: Article = {
    ...summary('a'),
    content: [{ type: 'paragraph', segments: [{ text: 'Hola.' }] }],
  };

  it('loads the article of the given id', async () => {
    get.mockResolvedValue(ARTICLE);
    const { result } = renderHook(() => useArticle('a'));
    expect(result.current.status).toBe('loading');

    await flush();
    expect(get).toHaveBeenCalledWith('a');
    expect(result.current.status).toBe('ready');
    expect(result.current.article).toEqual(ARTICLE);
  });

  it('reports an error, and refresh() retries', async () => {
    get.mockRejectedValueOnce(new Error('404'));
    const { result } = renderHook(() => useArticle('a'));
    await flush();
    expect(result.current.status).toBe('error');

    get.mockResolvedValue(ARTICLE);
    await act(async () => { await result.current.refresh(); });
    expect(result.current.status).toBe('ready');
  });

  it('does not call the API without an id', async () => {
    renderHook(() => useArticle(undefined));
    await flush();
    expect(get).not.toHaveBeenCalled();
  });
});

describe('useArticleAudio', () => {
  const originalOS = Platform.OS;
  const createObjectURL = jest.fn();
  const revokeObjectURL = jest.fn();
  const BLOB = { size: 3, type: 'audio/mpeg' } as Blob;

  beforeEach(() => {
    Platform.OS = 'web';
    createObjectURL.mockReset().mockReturnValue('blob:audio-1');
    revokeObjectURL.mockReset();
    (global.URL as any).createObjectURL = createObjectURL;
    (global.URL as any).revokeObjectURL = revokeObjectURL;
    getAudio.mockResolvedValue(BLOB);
  });

  afterEach(() => {
    Platform.OS = originalOS;
  });

  it('downloads nothing until load() is called', async () => {
    const { result } = renderHook(() => useArticleAudio('a'));
    await flush();

    expect(getAudio).not.toHaveBeenCalled();
    expect(result.current.status).toBe('idle');
    expect(result.current.uri).toBeNull();
    expect(result.current.supported).toBe(true);
  });

  it('load() downloads the file and exposes it as a local URL', async () => {
    const { result } = renderHook(() => useArticleAudio('a'));

    await act(async () => { await result.current.load(); });

    expect(getAudio).toHaveBeenCalledWith('a');
    expect(createObjectURL).toHaveBeenCalledWith(BLOB);
    expect(result.current.status).toBe('ready');
    expect(result.current.uri).toBe('blob:audio-1');
  });

  it('does not download the file a second time once it is ready', async () => {
    const { result } = renderHook(() => useArticleAudio('a'));
    await act(async () => { await result.current.load(); });
    await act(async () => { await result.current.load(); });

    expect(getAudio).toHaveBeenCalledTimes(1);
  });

  it('reports an error, and load() can be called again to retry', async () => {
    getAudio.mockRejectedValueOnce(new Error('404'));
    const { result } = renderHook(() => useArticleAudio('a'));

    await act(async () => { await result.current.load(); });
    expect(result.current.status).toBe('error');
    expect(result.current.uri).toBeNull();

    await act(async () => { await result.current.load(); });
    expect(result.current.status).toBe('ready');
  });

  it('frees the local URL when the screen closes', async () => {
    const { result, unmount } = renderHook(() => useArticleAudio('a'));
    await act(async () => { await result.current.load(); });

    unmount();
    // A blob: URL that is never revoked keeps its 2 MB in memory.
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:audio-1');
  });

  it('ignores a download that finishes after the screen closed', async () => {
    const slow = deferred<Blob>();
    getAudio.mockReturnValueOnce(slow.promise);
    const { result, unmount } = renderHook(() => useArticleAudio('a'));
    act(() => { result.current.load(); });

    unmount();
    await act(async () => { slow.resolve(BLOB); });

    // No URL was created, so nothing is left to leak.
    expect(createObjectURL).not.toHaveBeenCalled();
  });

  it('does nothing on a platform where the audio is not supported yet', async () => {
    Platform.OS = 'ios';
    const { result } = renderHook(() => useArticleAudio('a'));

    await act(async () => { await result.current.load(); });

    expect(result.current.supported).toBe(false);
    expect(getAudio).not.toHaveBeenCalled();
    expect(result.current.status).toBe('idle');
  });
});
