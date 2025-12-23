import { Stack } from 'expo-router';

export default function bankLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="phonepe" />
      <Stack.Screen name="sbi" />
      <Stack.Screen name="icici" />
    </Stack>
  );
}
