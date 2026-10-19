import { Redirect } from 'expo-router';

// The language is chosen at each app start: "/" always leads to the language screen.
export default function Index() {
  return <Redirect href={'/language' as never} />;
}
