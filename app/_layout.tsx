// app/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider } from '../services/AuthContext';
import { TransactionProvider } from '../context/TransactionContext';
import { ThemeProvider } from '../context/ThemeContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <TransactionProvider>
        <ThemeProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false }}>
            {/* Main Tabs layout */}
            <Stack.Screen name="tabs" />
          </Stack>
        </ThemeProvider>
      </TransactionProvider>
    </AuthProvider>
  );
}
