import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

type ThemeMode = 'light' | 'dark';
export type ColorScheme = 'emerald' | 'blue' | 'violet' | 'rose';

interface ThemeContextType {
  theme: ThemeMode; // backward compatibility (mode)
  mode: ThemeMode;
  colorScheme: ColorScheme;
  toggleTheme: () => void;
  setMode: (m: ThemeMode) => void;
  setColorScheme: (c: ColorScheme) => void;
}

const DEFAULT_COLOR_SCHEME: ColorScheme = 'emerald';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('theme-mode') as ThemeMode | null;
    return (saved === 'light' || saved === 'dark') ? saved : 'light';
  });
  const [colorScheme, setColorSchemeState] = useState<ColorScheme>(() => {
    const saved = localStorage.getItem('color-scheme') as ColorScheme | null;
    return (saved && ['emerald','blue','violet','rose'].includes(saved)) ? saved as ColorScheme : DEFAULT_COLOR_SCHEME;
  });

  // Apply mode & scheme to <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark');
    localStorage.setItem('theme-mode', mode);
  }, [mode]);

  useEffect(() => {
    document.documentElement.setAttribute('data-color-scheme', colorScheme);
    localStorage.setItem('color-scheme', colorScheme);
  }, [colorScheme]);

  // Backwards compatibility for existing localStorage key 'theme'
  useEffect(() => {
    const legacy = localStorage.getItem('theme');
    if (legacy && !localStorage.getItem('theme-mode')) {
      if (legacy === 'light' || legacy === 'dark') setMode(legacy);
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setMode(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  return (
    <ThemeContext.Provider value={{ theme: mode, mode, colorScheme, toggleTheme, setMode, setColorScheme: setColorSchemeState }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
