import { FC, MouseEvent } from 'react';
import styles from './ModelInfoPane.module.css';

import DownloadModel from '../download-model/DownloadModel';
import { notification, Slider } from 'antd';
import { TriangleIcon, RotateIcon, CameraIcon, ScreenshotIcon, RemoveIcon } from '../Icons';
import { SunOutlined, PublishedIcon, UnpublishedIcon } from '../Icons';

import { MeshRequestEntity } from '../../graphql/graphQlApiHooks';
import { BodyS, BodyXS, ButtonGroup, IconButton } from '@salutejs/plasma-giga';
import { textSecondary } from '@salutejs/plasma-themes/tokens';
import { useViewerStore } from '../../store/viewer';
import { useNavigate } from 'react-router-dom';
import { Button } from '@salutejs/plasma-giga';
import styled from 'styled-components';
import { ExpandableText } from '../ExpandableText.tsx';
import { ExpandableImage } from '../ExpandableImage.tsx';

type Props = {
  theme: 'dark' | 'light';
  isStand: string | null;
  isLoadingModel: boolean;
  modelInfo: MeshRequestEntity | null;
  previewPrompt: string;
  originalImageUrl?: string;
  polygonCount?: number;

  rotationEnabled: boolean;
  autoRotate: boolean;
  isCameraOn: boolean;
  isSavingScreenshot: boolean;

  onRemove: () => void;
  onToggleAutoRotation: () => void;
  onToggleCamera: () => void;
  onScreenshot: () => void;

  exposure: number;
  showLightPanel: boolean;
  onToggleLightPanel: () => void;
  onChangeExposure: (v: number) => void;

  canControl: boolean;
  isPublished: boolean;
  onTogglePublish: () => void;
};

export const ModelInfoPane: FC<Props> = ({
  theme,
  isStand,
  isLoadingModel,
  modelInfo,
  previewPrompt,
  originalImageUrl,
  polygonCount,
  autoRotate,
  isCameraOn,
  isSavingScreenshot,
  onRemove,
  onToggleAutoRotation,
  onToggleCamera,
  onScreenshot,
  exposure,
  showLightPanel,
  onToggleLightPanel,
  onChangeExposure,
  canControl,
  isPublished,
  onTogglePublish,
}) => {
  const handleCameraClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleCamera();
  };

  const navigate = useNavigate();
  const editorLinkData = useViewerStore((state) => state.editorLinkData);
  const isModelReady = useViewerStore((state) => state.isModelReady);

  const handleOpenEditor = () => {
    if (!editorLinkData) {
      notification.warning({
        message: 'Модель ещё загружается',
        description: 'Подождите завершения загрузки модели, чтобы открыть её в редакторе.',
        duration: 4,
      });
      return;
    }

    navigate('/editor', {
      state: {
        model: editorLinkData.model,
        glbUrl: editorLinkData.glbUrl,
        prompt: editorLinkData.prompt,
        previewId: editorLinkData.previewId,
        order: editorLinkData.order,
        fromModelViewer: true,
      },
    });
  };

  return (
    <StyledControllContainer>
      <div>
        {/* color={theme === 'dark'? buttonWhiteSecondary :buttonBlackSecondary}  */}
        <BodyS color={textSecondary} bold>
          {originalImageUrl ? 'Генерация по картинке' : 'Промпт:'}
        </BodyS>

        {originalImageUrl && (
          <div className={styles.originalImageBox} style={{ marginBottom: 12 }}>
            <ExpandableImage src={originalImageUrl} alt="Оригинальное изображение" minSize={64} maxSize={320} />
          </div>
        )}

        <BodyS>
          <ExpandableText text={previewPrompt} maxLength={100} />
        </BodyS>
      </div>

      <div className={styles.infoText__subtext}>
        <BodyXS color={textSecondary}>Kandinsky 3D</BodyXS>
        <div className={styles.infoText__polygonCount}>
          <TriangleIcon theme={theme} />
          <BodyXS>{polygonCount}</BodyXS>
        </div>
      </div>

      {/* <div className={styles.controlButtons}> */}
      <ButtonGroup view="secondary" orientation="horizontal" size="s" gap="wide">
        {!isLoadingModel && <DownloadModel modelInfo={modelInfo} prompt={previewPrompt} />}

        {!isLoadingModel && isStand && canControl && (
          <IconButton
            title="Удалить"
            size="s"
            view="secondary"
            pin="circle-circle"
            onClick={onRemove}
            contentLeft={<RemoveIcon theme={theme} />}
          />
        )}

        {!isLoadingModel && isStand && canControl && (
          <IconButton
            title="Опубликовать"
            size="s"
            view="secondary"
            pin="circle-circle"
            onClick={onTogglePublish}
            contentLeft={isPublished ? <PublishedIcon theme={theme} /> : <UnpublishedIcon theme={theme} />}
          />
        )}

        {!isLoadingModel && (
          <IconButton
            title="Авто-вращение"
            size="s"
            view={autoRotate ? 'dark' : 'secondary'}
            pin="circle-circle"
            onClick={onToggleAutoRotation}
            contentLeft={<RotateIcon theme={theme} />}
          />
        )}

        {isStand && !isLoadingModel && (
          <IconButton
            onClick={handleCameraClick}
            pin="circle-circle"
            view="secondary"
            size="s"
            onMouseDown={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
            title={isCameraOn ? 'Выключить камеру' : 'Включить камеру'}
            contentLeft={<CameraIcon theme={theme} active={isCameraOn} />}
          />
        )}

        {isStand && !isLoadingModel && isCameraOn && (
          <IconButton
            title="Сделать скриншот"
            pin="circle-circle"
            view="secondary"
            size="s"
            onClick={onScreenshot}
            disabled={isSavingScreenshot}
            contentLeft={<ScreenshotIcon theme={theme} />}
          />
        )}

        {isStand && !isLoadingModel && (
          <IconButton
            pin="circle-circle"
            view="secondary"
            size="s"
            title="Настроить освещённость"
            contentLeft={<SunOutlined theme={theme} />}
            onClick={onToggleLightPanel}
          />
        )}
      </ButtonGroup>
      {/* </div> */}

      {
        !isLoadingModel && (
          // <div>
          <Button
            title="Открыть в редакторе"
            size="s"
            view="secondary"
            stretching={canControl && isStand ? 'filled' : 'fixed'}
            onClick={handleOpenEditor}
            disabled={!isModelReady}
          >
            <BodyS bold color="textSecondary" noWrap>
              Открыть в редакторе
            </BodyS>
          </Button>
        )
        // </div>
      }

      {/* слайдер */}
      {isStand && !isLoadingModel && showLightPanel && (
        <div className={styles.lightPanel}>
          <Slider min={0.2} max={2.0} step={0.05} value={exposure} onChange={(v: number) => onChangeExposure(v)} />
        </div>
      )}
    </StyledControllContainer>
  );
};

export default ModelInfoPane;

const StyledControllContainer = styled.div`
  position: absolute;
  top: 60px;
  left: 65px;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  pointer-events: auto;
  cursor: default;
  gap: 8px;
  width: 350px;
  border-radius: 14px;
  padding: 4px;
`;
