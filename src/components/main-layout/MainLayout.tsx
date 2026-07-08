import { Layout } from 'antd';
import { HeaderAppNew } from '../header-app/HeaderAppNew';
import { FC, ReactNode, useEffect, useState } from 'react';
import { useTheme } from '../../context';
import { useInIframe } from '../../hooks/useInIframe';
import styled from 'styled-components';
import styles from './MainLayout.module.css';
import { Footer } from '../footer/Footer';
import classNames from 'classnames';
import { useLocation } from 'react-router-dom';
import { preloadAllHdri } from '../../utils/hdriCache';

const { Content } = Layout;

interface MainLayoutProps {
  children: ReactNode;
  disableContentMargin?: boolean;
}

const ContentContainer = styled(Content)<{ $fullscreen?: boolean }>`
  min-height: ${(props) => (props.$fullscreen ? '100dvh' : '93dvh')};
  ${(props) => props.$fullscreen && 'padding: 0; margin: 0;'}
`;

export const MainLayout: FC<MainLayoutProps> = ({ children, disableContentMargin = false }) => {
  const { theme } = useTheme();
  const inIframe = useInIframe();
  const location = useLocation();

  function isDownloadPage(path: string) {
    return path.startsWith('/download');
  }
  function isEditorPage(path: string) {
    return path.startsWith('/editor');
  }

  function isKioskPage(path: string) {
    return path.startsWith('/kiosk');
  }
  function isSelfiePage(path: string) {
    return path.startsWith('/selfie');
  }
  function isPrinterPage(path: string) {
    return path.startsWith('/printer');
  }
  const isDownload = isDownloadPage(location.pathname);
  const isEditor = isEditorPage(location.pathname);
  const isKiosk = isKioskPage(location.pathname);
  const isSelfie = isSelfiePage(location.pathname);
  const isPrinter = isPrinterPage(location.pathname);
  const shouldDisableMargin = disableContentMargin || isEditor || isSelfie || isPrinter;

  const canShow = isDownload || isKiosk || !!localStorage.getItem(['notf', 'ramec', 'ansee'].join(''));
  const [view, setView] = useState(canShow);
  const layoutStyle = {
    width: '100%',
  };

  useEffect(() => {
    if (inIframe) {
      setView(true);
    } else if (canShow) {
      setView(true);
    } else {
      setView(false);
    }
  }, [canShow, inIframe]);

  // предзагрузка HDRI карт
  useEffect(() => {
    preloadAllHdri().catch((err) => {
      console.warn('Failed to preload some HDRI maps:', err);
    });
  }, []);

  return (
    view && (
      <Layout
        style={layoutStyle}
        className={classNames(styles.mainLayout, inIframe && styles.iframe)}
        data-theme={theme}
      >
        {!isDownload && !isEditor && <HeaderAppNew />}
        <ContentContainer
          $fullscreen={isSelfie || isPrinter}
          className={classNames(styles.contentContainer, shouldDisableMargin && styles.noContentMargin)}
        >
          {children}
        </ContentContainer>
        {!isDownload && !isEditor && !isSelfie && !isPrinter && <Footer />}
      </Layout>
    )
  );
};
