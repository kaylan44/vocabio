let counter = 0;

// Distinct, UUID-shaped ids so tests can tell two sessions apart.
export const randomUUID = jest.fn(
  () => `00000000-0000-4000-8000-${String(++counter).padStart(12, '0')}`,
);
