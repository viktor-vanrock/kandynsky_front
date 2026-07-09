import { FC, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import classNames from 'classnames';
import { IconButton } from '@salutejs/plasma-giga';
import { ButtonMenu } from '../button-wrapper/ButtonMenu.tsx';
import { CatalogIcon } from '../Icons.tsx';
import { useTheme, useLocale } from '../../context';
import headerStyles from '../header-app/HeaderApp.module.css';

import styles from './FloatingModelsButton.module.css';

export const FloatingModelsButton: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const { t } = useLocale();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 659);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 659);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isHomePage = location.pathname === '/';
  const isGalleryPage = location.pathname === '/models';
  const isActive = (path: string) => location.pathname === path;
  const goAllModels = () => navigate('/models');

  return (
    <div className={styles.floatingWrapper}>
      {isMobile ? (
        <IconButton
          pin='circle-circle'
          view={isActive('/models') ? 'dark' : 'secondary'}
          onClick={goAllModels}
          contentLeft={<CatalogIcon color={isActive('/models')} theme={theme} />}
        />
      ) : (
        <ButtonMenu
          onClick={goAllModels}
          active={isActive('/models')}
          text={t.myModelsButton}
          className={classNames(
            headerStyles.allModelsButton,
            isHomePage && headerStyles.allModelsButton_homepage,
            isGalleryPage && headerStyles.allModelsButton_gallery,
          )}
        >
          <CatalogIcon color={isActive('/models')} theme={theme} />
        </ButtonMenu>
      )}
    </div>
  );
};
