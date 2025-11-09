import { createContext, useMemo, useState, PropsWithChildren } from 'react';
import { useColorScheme } from 'react-native';

import { dark, light, Theme } from './tokens';

type ThemeCtx = {
  theme: Theme;
  mode: 'light' | 'dark';
  setMode: (m: 'light' | 'dark') => void;
};

export const ThemeContext = createContext<ThemeCtx>({
  theme: light,
  mode: 'light',
  setMode: () => {},
});

export function ThemeProvider({ children }: PropsWithChildren) {
  const osMode = useColorScheme() === 'dark' ? 'dark' : 'light';
  const [mode, setMode] = useState<'light' | 'dark'>(osMode);
  const value = useMemo(() => ({ theme: mode === 'dark' ? dark : light, mode, setMode }), [mode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
