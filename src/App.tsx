import Routes from './routes';
import { ThemeProvider } from './context';
import './App.css';
import ApolloProviderChangeToken from './ApolloProviderChangeToken.tsx';
import { useIframeAutoResize } from './hooks/useIframeAutoResize.ts';
import {  PopupProvider } from '@salutejs/plasma-giga';
import { useNotificationOutsideClick } from './hooks/useNotificationOutsideClick.ts';

function App() {
  useIframeAutoResize();
  useNotificationOutsideClick();

  return (
    <ApolloProviderChangeToken>
      <ThemeProvider>
        <PopupProvider>
        <Routes />
        </PopupProvider>
      </ThemeProvider>
    </ApolloProviderChangeToken>
  );
}

export default App;
