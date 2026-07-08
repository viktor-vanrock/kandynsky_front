import { createContext, useContext } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  //HACK isToggleThemeDisabled setIsToggleThemeDisabled для блокировки тогла
  isToggleThemeDisabled: boolean;
  setIsToggleThemeDisabled: (disabled: boolean) => void; 
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
