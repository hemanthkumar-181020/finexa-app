// import React, {
//   createContext,
//   useContext,
//   useState,
//   type ReactNode,
// } from 'react';

// type Theme = 'light' | 'dark';

// type ThemeContextValue = {
//   theme: Theme;
//   toggleTheme: () => void;
// };

// const ThemeContext = createContext<ThemeContextValue | undefined>(
//   undefined,
// );

// export function ThemeProvider({ children }: { children: ReactNode }) {
//   const [theme, setTheme] = useState<Theme>('dark');

//   const toggleTheme = () => {
//     setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
//   };

//   return (
//     <ThemeContext.Provider value={{ theme, toggleTheme }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// }

// export function useTheme(): ThemeContextValue {
//   const ctx = useContext(ThemeContext);
//   if (!ctx) {
//     throw new Error('useTheme must be used inside ThemeProvider');
//   }
//   return ctx;
// }

// new version,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,
// context/ThemeContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// GeeksforGeeks-inspired color palette
export const lightTheme = {
  // Background colors
  background: '#FFFFFF',
  backgroundSecondary: '#F7F7F7',
  backgroundTertiary: '#EEEEEE',
  
  // Surface colors
  surface: '#FFFFFF',
  surfaceElevated: '#F9F9F9',
  card: '#FFFFFF',
  cardHover: '#F5F5F5',
  
  // Text colors
  text: '#2F2F2F',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textInverse: '#FFFFFF',
  
  // Primary brand colors (GeeksforGeeks green)
  primary: '#2F8D46',
  primaryLight: '#4CAF50',
  primaryDark: '#1B5E20',
  primaryHover: '#45A049',
  
  // Accent colors
  accent: '#0F9D58',
  accentLight: '#66BB6A',
  
  // Status colors
  success: '#4CAF50',
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  
  // Income/Expense specific
  income: '#4CAF50',
  expense: '#F44336',
  balance: '#2196F3',
  
  // Border colors
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
  borderDark: '#CCCCCC',
  
  // Interactive elements
  buttonPrimary: '#2F8D46',
  buttonPrimaryHover: '#45A049',
  buttonSecondary: '#757575',
  buttonDanger: '#F44336',
  
  // Shadows
  shadow: 'rgba(0, 0, 0, 0.1)',
  shadowDark: 'rgba(0, 0, 0, 0.2)',
  
  // Chart colors
  chart1: '#4CAF50',
  chart2: '#2196F3',
  chart3: '#FF9800',
  chart4: '#9C27B0',
  chart5: '#F44336',
  chart6: '#00BCD4',
};

export const darkTheme = {
  // Background colors (GeeksforGeeks dark mode)
  background: '#1E1E1E',
  backgroundSecondary: '#262626',
  backgroundTertiary: '#2D2D2D',
  
  // Surface colors
  surface: '#252525',
  surfaceElevated: '#2D2D2D',
  card: '#2A2A2A',
  cardHover: '#333333',
  
  // Text colors
  text: '#E8E8E8',
  textSecondary: '#B0B0B0',
  textTertiary: '#808080',
  textInverse: '#1E1E1E',
  
  // Primary brand colors (GeeksforGeeks green for dark)
  primary: '#3FA556',
  primaryLight: '#4CAF50',
  primaryDark: '#2E7D3E',
  primaryHover: '#45A049',
  
  // Accent colors
  accent: '#0F9D58',
  accentLight: '#66BB6A',
  
  // Status colors
  success: '#66BB6A',
  error: '#EF5350',
  warning: '#FFA726',
  info: '#42A5F5',
  
  // Income/Expense specific
  income: '#66BB6A',
  expense: '#EF5350',
  balance: '#42A5F5',
  
  // Border colors
  border: '#404040',
  borderLight: '#383838',
  borderDark: '#4A4A4A',
  
  // Interactive elements
  buttonPrimary: '#3FA556',
  buttonPrimaryHover: '#4CAF50',
  buttonSecondary: '#616161',
  buttonDanger: '#EF5350',
  
  // Shadows
  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowDark: 'rgba(0, 0, 0, 0.5)',
  
  // Chart colors
  chart1: '#66BB6A',
  chart2: '#42A5F5',
  chart3: '#FFA726',
  chart4: '#AB47BC',
  chart5: '#EF5350',
  chart6: '#26C6DA',
};

export type Theme = typeof lightTheme;
type ThemeMode = 'light' | 'dark';

interface ThemeContextType {
  theme: ThemeMode;
  colors: Theme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>('light');

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const colors = theme === 'light' ? lightTheme : darkTheme;
  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}