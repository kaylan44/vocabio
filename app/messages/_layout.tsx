import { Redirect, Stack } from 'expo-router';
import { Colors } from '../../constants/theme';
import { useAuth } from '../../hooks/useAuth';

// Messaging needs a Supabase JWT: guests (and direct web URLs) are sent to login.
export default function MessagesLayout() {
  const { isAuthenticated, isLoading } = useAuth();

  if (!isLoading && !isAuthenticated) return <Redirect href={'/login' as never} />;

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
      }}
    />
  );
}
