import { FC } from 'react';
import classNames from 'classnames';
import styles from './FavoriteModelsPanel.module.css';
import { CatalogIcon } from '../Icons';
import { GenerationStatus, GetGeneratedPreviewsQuery } from '../../graphql/graphQlApiHooks';
import { useLocale } from '../../context';

type Props = {
  theme: 'dark' | 'light';
  inIframe: boolean;
  favoriteModels: GetGeneratedPreviewsQuery['getGeneratedPreviews']['data'];
  activePreviewId?: string | null;
  activeSourceImageIndex?: number | null;
  onClickModel: (model: GetGeneratedPreviewsQuery['getGeneratedPreviews']['data'][0]) => void;
  onClickAllModels: () => void;
  className?: string;
};

export const FavoriteModelsPanel: FC<Props> = ({
  theme,
  inIframe,
  favoriteModels,
  activePreviewId,
  activeSourceImageIndex,
  onClickModel,
  onClickAllModels,
  className,
}) => {
  const { t } = useLocale();
  const filtered = favoriteModels.map((preview) => ({
    ...preview,
    // images: preview.images.filter((img) => img.order === 100),
    images: [...preview.images],
  }));

  return (
    <div className={classNames(styles.favoriteModels, inIframe && styles.iframe, className)} data-theme={theme}>
      {filtered.map((modelPreview) => {
        if (modelPreview.status === GenerationStatus.Pending || modelPreview.status === GenerationStatus.Cancelled) {
          return null;
        }

        const isActive =
          modelPreview?.id === activePreviewId && activeSourceImageIndex === modelPreview?.images[0]?.order;

        const imageUrl = modelPreview.images[0]?.url;
        const hasPreview = Boolean(imageUrl && imageUrl.trim());

        return hasPreview ? (
          <div
            key={modelPreview.id}
            className={classNames(styles.favoriteModel, isActive && styles.favoriteModel_active)}
            onClick={() => onClickModel(modelPreview)}
          >
            <img alt={t.imageAlt} className={styles.favoriteModel__image} src={imageUrl} />
          </div>
        ) : null;
      })}

      <div className={styles.allModelsButton} onClick={onClickAllModels}>
        <div className={styles.allModelsButton__icon}>
          <CatalogIcon theme={theme} />
        </div>
        <span className={styles.allModelsButton__label}>{t.myModelsButton}</span>
      </div>
    </div>
  );
};

export default FavoriteModelsPanel;
