import React, {createContext, useContext, useState, useEffect, useCallback, ReactNode} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ThemeColors {
  // Surfaces
  background: string;
  surface: string;
  surfaceSecondary: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  // Brand
  accent: string;
  accentForeground: string;
  accentText: string;
  primary: string;

  // UI elements
  border: string;
  divider: string;
  overlay: string;
  cardBg: string;

  // Tab bar
  tabBarBg: string;
  tabBarActive: string;
  tabBarInactive: string;

  // Status
  success: string;
  error: string;
  warning: string;

  // Glass overlays (semi-transparent)
  glassLight: string;
  glassMedium: string;
  glassHeavy: string;

  // Misc
  searchBg: string;
  badgeBg: string;
  skeleton: string;
}

export const DARK_THEME: ThemeColors = {
  background: '#1E00B2',
  surface: '#1A0099',
  surfaceSecondary: 'rgba(255,255,255,0.06)',

  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.7)',
  textTertiary: 'rgba(255,255,255,0.45)',
  textInverse: '#111111',

  accent: '#D9FF3F',
  accentForeground: '#D9FF3F',
  accentText: '#111111',
  primary: '#FFFFFF',

  border: 'rgba(255,255,255,0.1)',
  divider: 'rgba(255,255,255,0.06)',
  overlay: 'rgba(0,0,0,0.5)',
  cardBg: 'rgba(255,255,255,0.08)',

  tabBarBg: '#111111',
  tabBarActive: '#D9FF3F',
  tabBarInactive: '#ABABAB',

  success: '#34C759',
  error: '#FF453A',
  warning: '#FFD60A',

  glassLight: 'rgba(255,255,255,0.06)',
  glassMedium: 'rgba(255,255,255,0.12)',
  glassHeavy: 'rgba(255,255,255,0.2)',

  searchBg: 'rgba(255,255,255,0.08)',
  badgeBg: 'rgba(0,0,0,0.65)',
  skeleton: 'rgba(255,255,255,0.08)',
};

export const LIGHT_THEME: ThemeColors = {
  background: '#FAFAF8',
  surface: '#FFFFFF',
  surfaceSecondary: '#F2F2F0',

  textPrimary: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textTertiary: '#9A9A9A',
  textInverse: '#FFFFFF',

  accent: '#D9FF3F',
  accentForeground: '#4A7A00',
  accentText: '#111111',
  primary: '#1A1A1A',

  border: 'rgba(0,0,0,0.08)',
  divider: 'rgba(0,0,0,0.04)',
  overlay: 'rgba(0,0,0,0.3)',
  cardBg: '#FFFFFF',

  tabBarBg: '#FFFFFF',
  tabBarActive: '#D9FF3F',
  tabBarInactive: '#BBBBBB',

  success: '#34C759',
  error: '#FF453A',
  warning: '#CC7700',

  glassLight: 'rgba(0,0,0,0.03)',
  glassMedium: 'rgba(0,0,0,0.06)',
  glassHeavy: 'rgba(0,0,0,0.12)',

  searchBg: 'rgba(0,0,0,0.04)',
  badgeBg: 'rgba(0,0,0,0.65)',
  skeleton: 'rgba(0,0,0,0.06)',
};

interface ThemeContextType {
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
  statusBarStyle: 'light-content' | 'dark-content';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = '@trenzo_theme_mode';

export function ThemeProvider({children}: {children: ReactNode}) {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored !== null) {
          setIsDark(stored === 'dark');
        }
      } catch (_e) {
        // ignore
      }
    })();
  }, []);

  const toggleTheme = useCallback(() => {
    setIsDark(prev => {
      const next = !prev;
      AsyncStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light').catch(() => {});
      return next;
    });
  }, []);

  const colors = isDark ? DARK_THEME : LIGHT_THEME;
  const statusBarStyle = isDark ? 'light-content' : 'dark-content';

  return (
    <ThemeContext.Provider value={{colors, isDark, toggleTheme, statusBarStyle}}>
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
