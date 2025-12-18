import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from '../services/AuthContext';
import { TransactionProvider } from '../context/TransactionContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <TransactionProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }} />
      </TransactionProvider>
    </AuthProvider>
  );
}
