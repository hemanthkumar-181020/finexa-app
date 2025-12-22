import { Stack } from 'expo-router';

export default function bankLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="banks/phonepay" />
      <Stack.Screen name="banks/sbi" />
      <Stack.Screen name="banks/icici" />
    </Stack>
  );
}
