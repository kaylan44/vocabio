import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { mockAudioPlayer, resetMockAudio, setMockAudioStatus } from '../__mocks__/expo-audio';
import { ArticleAudio } from '../components/articles/ArticleAudio';
import { ArticleBody } from '../components/articles/ArticleBody';
import { ArticleRow } from '../components/articles/ArticleRow';
import { LevelFilter } from '../components/articles/LevelFilter';
import { ARTICLES_CONFIG } from '../constants/config';
import type { ArticleBlock, ArticleSummary } from '../types';

const SUMMARY: ArticleSummary = {
  id: 'a1',
  source: 'holaquepasa',
  lang: 'es',
  level: 'easy',
  title: 'El gato de la casa',
  excerpt: 'El gato vive en una casa pequeña.',
  url: 'https://holaquepasa.com/el-gato/',
  publishedAt: '2026-10-03T12:00:00.000Z',
  audioDurationSec: 232,
  hasAudio: true,
};

describe('ArticleRow', () => {
  it('shows the title, the level, the excerpt and the listening time', async () => {
    await render(<ArticleRow article={SUMMARY} onPress={jest.fn()} />);
    expect(screen.getByText('El gato de la casa')).toBeTruthy();
    expect(screen.getByText('Facile')).toBeTruthy();
    expect(screen.getByText('El gato vive en una casa pequeña.')).toBeTruthy();
    expect(screen.getByText('4 min')).toBeTruthy();
  });

  it('shows no listening time and no level when the article has neither', async () => {
    const article = { ...SUMMARY, hasAudio: false, audioDurationSec: null, level: null };
    await render(<ArticleRow article={article} onPress={jest.fn()} />);
    expect(screen.queryByText('4 min')).toBeNull();
    expect(screen.queryByText('Facile')).toBeNull();
  });

  it('opens the article it shows', async () => {
    const onPress = jest.fn();
    await render(<ArticleRow article={SUMMARY} onPress={onPress} />);
    await fireEvent.press(screen.getByText('El gato de la casa'));
    expect(onPress).toHaveBeenCalledWith('a1');
  });
});

describe('LevelFilter', () => {
  it('reports the level that was picked', async () => {
    const onChange = jest.fn();
    await render(<LevelFilter value="all" onChange={onChange} />);
    await fireEvent.press(screen.getByText('Intermédiaire'));
    expect(onChange).toHaveBeenCalledWith('intermediate');
  });

  it('marks only the current level as selected', async () => {
    await render(<LevelFilter value="easy" onChange={jest.fn()} />);
    const selected = screen.getAllByRole('tab', { selected: true });
    expect(selected).toHaveLength(1);
    expect(screen.getByRole('tab', { selected: true, name: 'Facile' })).toBeTruthy();
  });
});

describe('ArticleBody', () => {
  const CONTENT: ArticleBlock[] = [
    {
      type: 'paragraph',
      segments: [
        { text: 'El gato vive en ' },
        { text: 'una casa pequeña', gloss: 'a small house' },
        { text: '. Come ' },
        { text: 'mucho', gloss: 'a lot' },
        { text: '.' },
      ],
    },
    { type: 'paragraph', segments: [{ text: 'Por la noche duerme.' }] },
  ];

  it('shows the text and no translation at first', async () => {
    await render(<ArticleBody content={CONTENT} />);
    expect(screen.getByText('una casa pequeña')).toBeTruthy();
    expect(screen.getByText('Por la noche duerme.')).toBeTruthy();
    expect(screen.queryByText('a small house')).toBeNull();
    expect(screen.queryByText('a lot')).toBeNull();
  });

  it('opens the translation of the phrase that is tapped', async () => {
    await render(<ArticleBody content={CONTENT} />);
    await fireEvent.press(screen.getByText('una casa pequeña'));
    expect(screen.getByText('a small house')).toBeTruthy();
    expect(screen.queryByText('a lot')).toBeNull();
  });

  it('closes the translation when the phrase is tapped again', async () => {
    await render(<ArticleBody content={CONTENT} />);
    const phrase = screen.getByLabelText('una casa pequeña, voir la traduction');
    await fireEvent.press(phrase);
    await fireEvent.press(phrase);
    expect(screen.queryByText('a small house')).toBeNull();
  });

  it('shows one translation at a time', async () => {
    await render(<ArticleBody content={CONTENT} />);
    await fireEvent.press(screen.getByText('una casa pequeña'));
    await fireEvent.press(screen.getByText('mucho'));
    expect(screen.getByText('a lot')).toBeTruthy();
    expect(screen.queryByText('a small house')).toBeNull();
  });

  it('closes the translation from its card', async () => {
    await render(<ArticleBody content={CONTENT} />);
    await fireEvent.press(screen.getByText('mucho'));
    await fireEvent.press(screen.getByLabelText('Fermer la traduction'));
    expect(screen.queryByText('a lot')).toBeNull();
  });
});

describe('ArticleAudio', () => {
  const base = {
    hasAudio: true,
    supported: true,
    durationSec: 232,
    status: 'idle' as const,
    uri: null,
    onLoad: jest.fn(),
  };

  beforeEach(() => {
    resetMockAudio();
    base.onLoad.mockClear();
  });

  it('says so when the article has no audio, and offers nothing to press', async () => {
    await render(<ArticleAudio {...base} hasAudio={false} />);
    expect(screen.getByText(/pas de version audio/)).toBeTruthy();
    expect(screen.queryByLabelText("Écouter l'article")).toBeNull();
  });

  it('explains that listening is web-only where it is not supported', async () => {
    await render(<ArticleAudio {...base} supported={false} />);
    expect(screen.getByText(/version web/)).toBeTruthy();
    expect(screen.queryByLabelText("Écouter l'article")).toBeNull();
  });

  it('shows the length of the audio before anything is downloaded', async () => {
    await render(<ArticleAudio {...base} />);
    expect(screen.getByText('0:00')).toBeTruthy();
    expect(screen.getByText('3:52')).toBeTruthy();
  });

  it('starts the download on the first press on play, without touching a player', async () => {
    await render(<ArticleAudio {...base} />);
    await fireEvent.press(screen.getByLabelText("Écouter l'article"));
    expect(base.onLoad).toHaveBeenCalledTimes(1);
    expect(mockAudioPlayer.play).not.toHaveBeenCalled();
  });

  it('offers a retry when the download failed', async () => {
    await render(<ArticleAudio {...base} status="error" />);
    expect(screen.getByText("Impossible de charger l'audio.")).toBeTruthy();
    await fireEvent.press(screen.getByText('Réessayer'));
    expect(base.onLoad).toHaveBeenCalledTimes(1);
  });

  it('starts playing as soon as the file is ready', async () => {
    await render(<ArticleAudio {...base} status="ready" uri="blob:audio-1" />);
    expect(mockAudioPlayer.play).toHaveBeenCalledTimes(1);
  });

  it('pauses when it is playing', async () => {
    setMockAudioStatus({ playing: true, currentTime: 42, duration: 232 });
    await render(<ArticleAudio {...base} status="ready" uri="blob:audio-1" />);
    expect(screen.getByText('0:42')).toBeTruthy();

    await fireEvent.press(screen.getByLabelText('Mettre en pause'));
    expect(mockAudioPlayer.pause).toHaveBeenCalledTimes(1);
  });

  it('starts over when play is pressed at the end of the track', async () => {
    setMockAudioStatus({ playing: false, currentTime: 232, duration: 232 });
    await render(<ArticleAudio {...base} status="ready" uri="blob:audio-1" />);
    mockAudioPlayer.play.mockClear();

    await fireEvent.press(screen.getByLabelText("Écouter l'article"));
    expect(mockAudioPlayer.seekTo).toHaveBeenCalledWith(0);
    expect(mockAudioPlayer.play).toHaveBeenCalledTimes(1);
  });

  it('resumes from where it was when paused in the middle', async () => {
    setMockAudioStatus({ playing: false, currentTime: 42, duration: 232 });
    await render(<ArticleAudio {...base} status="ready" uri="blob:audio-1" />);

    await fireEvent.press(screen.getByLabelText("Écouter l'article"));
    expect(mockAudioPlayer.seekTo).not.toHaveBeenCalled();
  });

  it('rewinds by the configured number of seconds, never before the start', async () => {
    setMockAudioStatus({ playing: true, currentTime: 42, duration: 232 });
    const label = `Reculer de ${ARTICLES_CONFIG.rewindSeconds} secondes`;
    const view = await render(<ArticleAudio {...base} status="ready" uri="blob:audio-1" />);
    await fireEvent.press(screen.getByLabelText(label));
    expect(mockAudioPlayer.seekTo).toHaveBeenLastCalledWith(42 - ARTICLES_CONFIG.rewindSeconds);

    setMockAudioStatus({ currentTime: 4 });
    await view.rerender(<ArticleAudio {...base} status="ready" uri="blob:audio-1" />);
    await fireEvent.press(screen.getByLabelText(label));
    expect(mockAudioPlayer.seekTo).toHaveBeenLastCalledWith(0);
  });
});
