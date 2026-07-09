import { FC, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { BackArrowIcon } from '../Icons.tsx';
import styles from './BackButton.module.css';
import { useLocale } from '../../context';

interface BackButtonProps {
  theme: 'light' | 'dark';
  className?: string;
  title?: string;
}

export const BackButton: FC<BackButtonProps> = ({ theme, className, title }) => {
  const { t } = useLocale();
  const resolvedTitle = title ?? t.goback;
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location as {
    state?: {
      fromModelViewer?: boolean;
    };
  };

  const handleBack = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const pathSegments = location.pathname.split('/').filter(Boolean);
      const isModelViewerRoute = pathSegments.length === 2 && pathSegments[0] && pathSegments[1];

      if (state?.fromModelViewer) {
        navigate(-1);
        return;
      }

      // проверяем откуда пришли во вьюер
      if (isModelViewerRoute) {
        const referrer = document.referrer;
        if (referrer) {
          try {
            const referrerUrl = new URL(referrer);
            const referrerPath = referrerUrl.pathname;

            if (referrerPath === '/models' || referrerPath.startsWith('/models/')) {
              navigate('/models');
              return;
            }

             if (referrerPath === '/setting-stand' || referrerPath.startsWith('/setting-stand/')) {
              navigate('/setting-stand');
              return;
            }

            if (referrerPath === '/' || referrerPath === '') {
              navigate('/');
              return;
            }

            navigate(-1);
            return;
          } catch {
            navigate('/');
            return;
          }
        }

        navigate('/');
        return;
      }
      navigate(-1);
    },
    [location, state?.fromModelViewer, navigate],
  );

  return (
    <button
      type="button"
      className={`${styles.backButton} ${className || ''}`}
      onClick={handleBack}
      title={resolvedTitle}
      style={{ pointerEvents: 'auto' }}
    >
      <BackArrowIcon theme={theme} />
    </button>
  );
};
