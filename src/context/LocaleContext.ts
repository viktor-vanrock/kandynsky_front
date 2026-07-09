import { createContext, useContext } from 'react';
import ru from '../i18n/ru';

export type Locale = 'ru' | 'en';
export type Translations = { [K in keyof typeof ru]: string };

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Translations;
}

export const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export const useLocale = (): LocaleContextType => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};
