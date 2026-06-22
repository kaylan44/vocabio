const mockSubscription = { unsubscribe: jest.fn() };

const mockAuth = {
  getSession: jest.fn().mockResolvedValue({ data: { session: null }, error: null }),
  onAuthStateChange: jest.fn().mockReturnValue({ data: { subscription: mockSubscription } }),
  signInWithOAuth: jest.fn().mockResolvedValue({ error: null }),
  signOut: jest.fn().mockResolvedValue({ error: null }),
};

export const createClient = jest.fn(() => ({
  auth: mockAuth,
}));

export { mockAuth, mockSubscription };
