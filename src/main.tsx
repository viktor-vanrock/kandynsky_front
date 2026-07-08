import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { GlobalStyle } from './components/main-layout';
import { HelmetProvider } from "react-helmet-async";

ReactDOM.createRoot(document.getElementById('root')!).render(
  <HelmetProvider>
    <BrowserRouter>
      <GlobalStyle />
      <App />
    </BrowserRouter>
  </HelmetProvider>,
);
