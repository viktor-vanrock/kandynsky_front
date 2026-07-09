import { FC, ReactNode, useState } from 'react';
import { LocaleContext, Locale } from './LocaleContext';
import { ru, en } from '../i18n';

const translations = { ru, en };

export const LocaleProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(
    () => (localStorage.getItem('locale') as Locale) || 'ru',
  );

  const setLocale = (next: Locale) => {
    localStorage.setItem('locale', next);
    setLocaleState(next);
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t: translations[locale] }}>
      {children}
    </LocaleContext.Provider>
  );
};
