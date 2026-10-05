// Controllable stand-in for expo-audio: no sound, but the same surface the app uses.
// A test reads `mockAudioPlayer` to check what was called and calls `setMockAudioStatus`
// to pretend the playback moved.

export const mockAudioPlayer = {
  play: jest.fn(),
  pause: jest.fn(),
  seekTo: jest.fn(),
};

const DEFAULT_STATUS = { playing: false, currentTime: 0, duration: 0, isLoaded: true };

let status = { ...DEFAULT_STATUS };

export const setMockAudioStatus = (next: Partial<typeof DEFAULT_STATUS>) => {
  status = { ...status, ...next };
};

export const resetMockAudio = () => {
  status = { ...DEFAULT_STATUS };
  mockAudioPlayer.play.mockClear();
  mockAudioPlayer.pause.mockClear();
  mockAudioPlayer.seekTo.mockClear();
};

export const useAudioPlayer = jest.fn(() => mockAudioPlayer);
export const useAudioPlayerStatus = jest.fn(() => status);
