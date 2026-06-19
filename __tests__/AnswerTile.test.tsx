import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { AnswerTile } from '../components/quiz/AnswerTile';

const noop = jest.fn();

describe('AnswerTile', () => {
  beforeEach(() => noop.mockClear());

  it('renders the label', async () => {
    await render(<AnswerTile label="casa" state="idle" onPress={noop} />);
    expect(screen.getByText('casa')).toBeTruthy();
  });

  it('calls onPress when idle', async () => {
    await render(<AnswerTile label="casa" state="idle" onPress={noop} />);
    fireEvent.press(screen.getByText('casa'));
    expect(noop).toHaveBeenCalledTimes(1);
  });

  it('does not call onPress when disabled', async () => {
    await render(<AnswerTile label="casa" state="disabled" onPress={noop} />);
    fireEvent.press(screen.getByText('casa'));
    expect(noop).not.toHaveBeenCalled();
  });

  it('does not call onPress when selected-correct', async () => {
    await render(<AnswerTile label="casa" state="selected-correct" onPress={noop} />);
    fireEvent.press(screen.getByText('casa'));
    expect(noop).not.toHaveBeenCalled();
  });

  it('shows hint when state is selected-wrong and hint is provided', async () => {
    await render(
      <AnswerTile label="casa" state="selected-wrong" onPress={noop} hint="maison" />
    );
    expect(screen.getByText('(maison)')).toBeTruthy();
  });

  it('does not show hint when state is idle', async () => {
    await render(
      <AnswerTile label="casa" state="idle" onPress={noop} hint="maison" />
    );
    expect(screen.queryByText('(maison)')).toBeNull();
  });
});
