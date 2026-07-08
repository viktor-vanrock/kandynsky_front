import { plasma_giga__dark, plasma_giga__light } from '@salutejs/plasma-themes';
import { FC, ReactNode, useEffect, useState } from 'react';
import { createGlobalStyle } from 'styled-components';
import { Theme, ThemeContext } from './ThemeContext';

interface ThemeProviderProps {
  children: ReactNode;
}

const DarkTheme = createGlobalStyle`
  ${plasma_giga__dark}
`;

const LightTheme = createGlobalStyle`
  ${plasma_giga__light}

  body {
    background-color: var(--plasma-colors-background-primary);
    color: var(--plasma-colors-text-primary);
  }
`;

export const ThemeProvider: FC<ThemeProviderProps> = ({ children }) => {
  const defaultTheme = 'dark';
  const [theme, setTheme] = useState<Theme>((localStorage.getItem('theme') as Theme) || defaultTheme);
  //HACK isToggleThemeDisabled setIsToggleThemeDisabled для блокировки тогла
  const [isToggleThemeDisabled, setIsToggleThemeDisabled] = useState(false);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isToggleThemeDisabled, setIsToggleThemeDisabled }}>
      {theme === 'dark' ? <DarkTheme /> : <LightTheme />}
      {children}
    </ThemeContext.Provider>
  );
};
