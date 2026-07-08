import styled from 'styled-components';
import { CSSProperties, FC, memo, ReactNode, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context';
import IconRotator from '../icons-rotator/IconsRotator.tsx';
import { FrontGenerationType, GenerationStatus, GetGeneratedPreviewsQuery } from '../../graphql/graphQlApiHooks.ts';
import styles from './PreviewBlock.module.css';
import classNames from 'classnames';
import { useGameDevStore } from '../../store/gamedev.ts';
import { DefaultModeIcon, GameDevModeIcon, PrintingModeIcon } from '../Icons.tsx';

interface ModelBlockProps {
  model: GetGeneratedPreviewsQuery['getGeneratedPreviews']['data'][0] | undefined;
  loading: boolean;
  children?: ReactNode;
  showGrid?: boolean;
}

const LoadingAnimation = memo(function LoadingAnimation() {
  return (
    <>
      <ImageContainer>
        <IconRotator startWith={1} />
      </ImageContainer>
      <ImageContainer>
        <IconRotator startWith={2} />
      </ImageContainer>
      <ImageContainer>
        <IconRotator startWith={3} />
      </ImageContainer>
      <ImageContainer>
        <IconRotator startWith={4} />
      </ImageContainer>
    </>
  );
});

export const PreviewBlock: FC<ModelBlockProps> = memo(({ model, children, loading, showGrid }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const { isGameDevMode, selectedMode } = useGameDevStore();
  if (!model) return null;

  const images = model.images || [];
  const isHomeAndGenerate = (): boolean => {
    const regex = new RegExp('^/([a-f0-9]{64})?$', 'i');
    return regex.test(location.pathname);
  };

  const getModeIcon = () => {
    const generationType = model.generationType;

    if (generationType === FrontGenerationType.Standard) {
      return <DefaultModeIcon />;
    }
    if (generationType === FrontGenerationType.Gamedev) {
      return <GameDevModeIcon />;
    }
    if (generationType === FrontGenerationType.Print) {
      return <PrintingModeIcon />;
    }

    if (selectedMode === 'standard') {
      return <DefaultModeIcon />;
    }
    if (selectedMode === 'gamedev') {
      return <GameDevModeIcon />;
    }
    if (selectedMode === '3dprint') {
      return <PrintingModeIcon />;
    }

    return <DefaultModeIcon />;
  };

  const is3DPrintMode = () => {
    const generationType = model.generationType;
    if (generationType === FrontGenerationType.Print) {
      return true;
    }

    // При выборе мода все модели в превью отображаются как 3д печать
    // if (selectedMode === '3dprint') {
    //   return true;
    // }
    return false;
  };

  const modeIconStyles: CSSProperties = {
    position: 'absolute',
    top: 8,
    left: 0,
    zIndex: 10,
    pointerEvents: 'none',
  };

  const handleImageClick = (model: GetGeneratedPreviewsQuery['getGeneratedPreviews']['data'][0], order: number) => {
    if (model.status === GenerationStatus.Pending || model.status === GenerationStatus.Cancelled) return;

    // в gamedev редиректим в редактор
    if (isGameDevMode) {
      const normalizedOrder = order === 101 ? 100 : order;
      navigate('/editor', {
        state: {
          previewId: model.id,
          order: normalizedOrder,
        },
      });
    } else {
      navigate(`/${model.id}/${model.sourceImageOrder ?? order}`, { state: { fromModelViewer: true } });
    }
  };

  // режим ленты: показываем серые превьюшки
  if (showGrid) {
    const grayImages = images
      .filter((img) => Number(img.order) >= 0 && Number(img.order) <= 3)
      .sort((a, b) => Number(a.order) - Number(b.order));

    return (
      <div data-theme={theme}>
        {loading ? (
          <div className={styles.loaderCentered}>
            <LoadingAnimation />
          </div>
        ) : (
          <div className={styles.previewRowContainer}>
            <div className={styles.previewRow}>
              {model &&
                grayImages.map((preview, index) => (
                  <div
                    key={preview.order}
                    onClick={() => handleImageClick(model, preview.order)}
                    className={styles.galleryImageWrapper}
                  >
                    <ModeIconWrapper style={modeIconStyles} $is3DPrint={is3DPrintMode()}>
                      {getModeIcon()}
                      {is3DPrintMode() && <ModeIconText>Без текстуры</ModeIconText>}
                    </ModeIconWrapper>
                    <StyledImage
                      src={preview.url}
                      alt={`Генерация ${index + 1}`}
                      isModel={!isHomeAndGenerate()}
                      title={model.prompt}
                      className={classNames(styles.galleryImage, styles.previewImage)}
                    />
                  </div>
                ))}
            </div>
            {grayImages.length > 0 && <div className={styles.labelText}>Выберите один понравившийся вариант</div>}
          </div>
        )}
        {children}
      </div>
    );
  }

  // Режим галереи
  const pngImage = images.find((img) => Number(img.order) === 100);
  const gifImage = images.find((img) => Number(img.order) === 101);
  const grayImage = images.find((img) => Number(img.order) >= 0 && Number(img.order) <= 3);
  const mainImage = pngImage || grayImage || images[0];

  let showImageUrl: string | undefined;
  const allowGif = !model.gallery;

  if (model.status === GenerationStatus.Pending) {
    showImageUrl = grayImage?.url || images[0]?.url;
  } else {
    const useGif = Boolean(isHovered && gifImage && allowGif);
    showImageUrl = (useGif ? gifImage?.url : pngImage?.url) || grayImage?.url || images[0]?.url;
  }

  return (
    <div
      data-theme={theme}
      className={classNames(styles.galleryCard, styles.singleGalleryCard)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <ImageContainer
        key={model.id}
        onClick={() => handleImageClick(model, mainImage?.order ?? 0)}
        className={classNames(styles.galleryImageWrapper, styles.singleImageWrapper)}
      >
        <ModeIconWrapper style={modeIconStyles} $is3DPrint={is3DPrintMode()}>
          {getModeIcon()}
          {is3DPrintMode() && <ModeIconText>Без текстуры</ModeIconText>}
        </ModeIconWrapper>
        <div>
          {loading || !showImageUrl ? (
            <LoadingAnimation />
          ) : (
            <StyledImage
              src={showImageUrl}
              alt={model.prompt}
              isModel={!isHomeAndGenerate()}
              title={model.prompt}
              className={styles.galleryImage}
            />
          )}
        </div>
      </ImageContainer>
      {children}
    </div>
  );
});

const ImageContainer = styled.div`
  position: relative !important;
  display: block !important;
  &:before {
    content: '';
    display: block;
    padding-top: 100%;
  }
  > div:last-child {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
`;

const StyledImage = styled.img<{ isModel: boolean }>`
  width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: 12px;
`;

const ModeIconWrapper = styled.div<{ $is3DPrint?: boolean }>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: ${({ $is3DPrint }) => ($is3DPrint ? '4px 8px 4px 4px' : '4px')};
  background: #121213;
  border-radius: ${({ $is3DPrint }) => ($is3DPrint ? '16px' : '50%')};
`;

const ModeIconText = styled.span`
  font-family: 'SB Sans Text', sans-serif;
  font-size: 10px;
  line-height: 1;
  color: rgba(255, 255, 255, 0.8);
  white-space: nowrap;
`;
