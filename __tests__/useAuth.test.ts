import { renderHook } from '@testing-library/react-hooks';
import { useAuthStore } from '../store/authStore';
import { useAuth } from '../hooks/useAuth';

beforeEach(() => {
  useAuthStore.setState({ status: 'loading', user: null });
});

describe('useAuth', () => {
  it('isLoading is true when status is "loading"', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isGuest).toBe(false);
  });

  it('isAuthenticated is true when status is "authenticated"', () => {
    useAuthStore.setState({
      status: 'authenticated',
      user: { id: '1', email: 'a@b.com', fullName: 'A', avatarUrl: null, provider: 'google', createdAt: null },
    });
    const { result } = renderHook(() => useAuth());
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isGuest).toBe(false);
    expect(result.current.user?.email).toBe('a@b.com');
  });

  it('isGuest is true when status is "guest"', () => {
    useAuthStore.setState({ status: 'guest', user: null });
    const { result } = renderHook(() => useAuth());
    expect(result.current.isGuest).toBe(true);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('exposes signInWithGoogle, continueAsGuest, signOut functions', () => {
    const { result } = renderHook(() => useAuth());
    expect(typeof result.current.signInWithGoogle).toBe('function');
    expect(typeof result.current.continueAsGuest).toBe('function');
    expect(typeof result.current.signOut).toBe('function');
  });
});
