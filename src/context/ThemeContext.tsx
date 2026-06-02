import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Colors, DarkColors, LightColors } from '../theme';

interface ThemeContextType {
  isDark: boolean;
  toggleDark: () => void;
  colors: typeof LightColors;
}

const ThemeContext = createContext<ThemeContextType>({
  isDark: false,
  toggleDark: () => {},
  colors: LightColors,
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('darkMode').then(val => {
      if (val === 'true') {
        setIsDark(true);
        Object.assign(Colors, DarkColors);
      }
    });
  }, []);

  const toggleDark = async () => {
    const next = !isDark;
    setIsDark(next);
    Object.assign(Colors, next ? DarkColors : LightColors);
    await AsyncStorage.setItem('darkMode', next ? 'true' : 'false');
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleDark, colors: isDark ? DarkColors : LightColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);