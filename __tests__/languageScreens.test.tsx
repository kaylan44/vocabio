import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';

const mockPush = jest.fn();
const mockReplace = jest.fn();
let mockParams: Record<string, string | undefined> = {};

jest.mock('expo-router', () => {
  const { Text: MockText } = require('react-native');
  return {
    useRouter: () => ({ push: mockPush, replace: mockReplace }),
    useLocalSearchParams: () => mockParams,
    Redirect: ({ href }: { href: string }) => <MockText>{`redirect:${href}`}</MockText>,
    Stack: () => <MockText>stack</MockText>,
  };
});

let mockIsAuthenticated = true;
jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({ isAuthenticated: mockIsAuthenticated }),
}));

jest.mock('../hooks/useConversations', () => ({
  useUnreadTotal: () => 0,
}));

import Index from '../app/index';
import LanguageScreen from '../app/language';
import LanguageLayout from '../app/[lang]/_layout';
import HomeScreen from '../app/[lang]/index';
import { useLanguageStore } from '../store/languageStore';

beforeEach(() => {
  mockPush.mockClear();
  mockReplace.mockClear();
  mockParams = {};
  mockIsAuthenticated = true;
  useLanguageStore.setState({ current: null });
});

describe('language selection', () => {
  it('sends the app start to the language screen', async () => {
    await render(<Index />);
    expect(screen.getByText('redirect:/language')).toBeTruthy();
  });

  it('opens the home of the language that was picked', async () => {
    await render(<LanguageScreen />);
    await fireEvent.press(screen.getByLabelText("Apprendre l'indonésien"));
    expect(mockReplace).toHaveBeenCalledWith('/id');
  });
});

describe('[lang] layout', () => {
  it('sends an unknown language back to the language screen', async () => {
    mockParams = { lang: 'fr' };
    await render(<LanguageLayout />);
    expect(screen.getByText('redirect:/language')).toBeTruthy();
    expect(useLanguageStore.getState().current).toBeNull();
  });

  it('renders the screens of a known language and remembers it for the shared screens', async () => {
    mockParams = { lang: 'id' };
    await render(<LanguageLayout />);
    expect(screen.getByText('stack')).toBeTruthy();
    expect(useLanguageStore.getState().current).toBe('id');
  });
});

describe('language home', () => {
  it('shows the Spanish modes and the articles row', async () => {
    mockParams = { lang: 'es' };
    await render(<HomeScreen />);
    expect(screen.getByLabelText('Quiz français vers espagnol')).toBeTruthy();
    expect(screen.getByLabelText('Quiz espagnol vers français')).toBeTruthy();
    expect(screen.getByText('Lire un article')).toBeTruthy();
  });

  it('shows the Indonesian modes and no articles row', async () => {
    mockParams = { lang: 'id' };
    await render(<HomeScreen />);
    expect(screen.getByText("Apprends l'indonésien, une session à la fois.")).toBeTruthy();
    expect(screen.getByLabelText('Quiz français vers indonésien')).toBeTruthy();
    expect(screen.getByLabelText('Quiz indonésien vers français')).toBeTruthy();
    expect(screen.queryByText('Lire un article')).toBeNull();
  });

  it('leads back to the language screen', async () => {
    mockParams = { lang: 'id' };
    await render(<HomeScreen />);
    await fireEvent.press(screen.getByLabelText('Changer de langue'));
    expect(mockReplace).toHaveBeenCalledWith('/language');
  });

  it('opens the vocabulary of the current language', async () => {
    mockParams = { lang: 'id' };
    await render(<HomeScreen />);
    await fireEvent.press(screen.getByLabelText('Voir le vocabulaire'));
    expect(mockPush).toHaveBeenCalledWith('/id/vocab');
  });
});

