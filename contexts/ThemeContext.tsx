'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  Theme,
  updateTheme,
  getTheme,
  resetTheme,
  applySavedTheme,
  saveTheme as saveThemeToStorage,
  updateThemeVariable,
} from '@/utils/theme';

interface ThemeContextValue {
  currentTheme: Theme;
  updateTheme: (theme: Theme) => void;
  updateVariable: (property: string, value: string) => void;
  resetTheme: () => void;
  saveTheme: () => void;
  loadTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  autoLoad?: boolean; // Automatically load saved theme on mount
  storageKey?: string; // LocalStorage key for theme persistence
}

export function ThemeProvider({
  children,
  autoLoad = true,
  storageKey = 'app-theme',
}: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    if (isInitialized) return;

    // Try to load saved theme if autoLoad is enabled
    if (autoLoad) {
      const loaded = applySavedTheme(storageKey);
      if (loaded) {
        // Get the loaded theme values
        setCurrentTheme(getTheme());
      }
    }

    setIsInitialized(true);
  }, [autoLoad, storageKey, isInitialized]);

  const handleUpdateTheme = (theme: Theme) => {
    updateTheme(theme);
    setCurrentTheme({ ...currentTheme, ...theme });
  };

  const handleUpdateVariable = (property: string, value: string) => {
    updateThemeVariable(property, value);
    // Refresh current theme state
    setCurrentTheme(getTheme());
  };

  const handleResetTheme = () => {
    resetTheme();
    setCurrentTheme({});
  };

  const handleSaveTheme = () => {
    saveThemeToStorage(storageKey);
  };

  const handleLoadTheme = () => {
    const loaded = applySavedTheme(storageKey);
    if (loaded) {
      setCurrentTheme(getTheme());
    }
  };

  const value: ThemeContextValue = {
    currentTheme,
    updateTheme: handleUpdateTheme,
    updateVariable: handleUpdateVariable,
    resetTheme: handleResetTheme,
    saveTheme: handleSaveTheme,
    loadTheme: handleLoadTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Hook to access theme context
 * @throws Error if used outside ThemeProvider
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

/**
 * Optional hook that doesn't throw if used outside provider
 * Returns undefined if not in a ThemeProvider
 */
export function useThemeOptional(): ThemeContextValue | undefined {
  return useContext(ThemeContext);
}
