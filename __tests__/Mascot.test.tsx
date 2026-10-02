import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { HomeMascot } from '../components/home/HomeMascot';
import { ResultMascot } from '../components/quiz/ResultMascot';

describe('HomeMascot', () => {
  it('renders the run, idle and sunglasses poses', async () => {
    await render(<HomeMascot />);
    expect(screen.getByTestId('mascot-run')).toBeTruthy();
    expect(screen.getByTestId('mascot-hug')).toBeTruthy();
    expect(screen.getByTestId('mascot-cool')).toBeTruthy();
  });

  it('can be tapped during the entrance without crashing', async () => {
    await render(<HomeMascot />);
    await fireEvent.press(screen.getByRole('button'));
    expect(screen.getByRole('button')).toBeTruthy();
  });

  it('clears its timers on unmount', async () => {
    const clearSpy = jest.spyOn(global, 'clearTimeout');
    const { unmount } = await render(<HomeMascot />);
    await unmount();
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });
});

describe('ResultMascot', () => {
  it('renders the happy head', async () => {
    await render(<ResultMascot />);
    expect(screen.getByTestId('mascot-happy')).toBeTruthy();
  });
});
