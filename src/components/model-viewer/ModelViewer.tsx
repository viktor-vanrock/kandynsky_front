import { GenerationProgress } from '../generation-progress';
import { useProgress } from '@react-three/drei';
import { FC, startTransition, useCallback, useEffect, useRef, useState } from 'react';
import { PointCloudCanvas } from '../point-cloud';
import { CenteredContent } from '../centered-content';
import styled from 'styled-components';
import {
  GenerationStatus,
  GetGeneratedPreviewsQuery,
  MeshFormatEntity,
  MeshRequestEntity,
  useGetFavoriteModelsQuery,
  useRemoveMeshByIdMutation,
} from '../../graphql/graphQlApiHooks.ts';
import classNames from 'classnames';
import styles from './ModelViewer.module.css';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext.ts';
import { useLocale } from '../../context';
import { useViewerStore } from '../../store/viewer.ts';
import { useInIframe } from '../../hooks/useInIframe.ts';
import { getSessionToken } from '../../utils/session.ts';
import * as THREE from 'three';
import { notification } from 'antd';
import { OrbitControls } from 'three-stdlib';
import { Scene } from './scene';
import { ModelInfoPane } from './ModelInfoPane';
import { QRCodeModel } from '../qr-code-model/QrCodeModel';
import ScreenshotManager, { ScreenshotManagerHandle } from './ScreenshotManager';
import ModelSettingsPanel from './ModelSettingsPanel/ModelSettingsPanel.tsx';
import FavoriteModelsPanel from './FavoriteModelsPanel';
import { getRandomLoadingText } from '../../helpers/utils.ts';
import { BodyM, BodyS } from '@salutejs/plasma-giga';
import { secondary } from '@salutejs/plasma-tokens';
import { IframeScrollPanels } from '../IframeScrollPanels';
import { ExpandableText } from '../ExpandableText';
import { useErrorNotification } from '../preview/useNotificationError.ts';

interface ModelViewerProps {
  modelInfo: MeshRequestEntity | null;
  preview: GetGeneratedPreviewsQuery['getGeneratedPreviews']['data'][0] | null;
  sourceImageIndex: number | null;
  fetchOrGenerateMesh: (index: number) => Promise<void>;
  showPointCloud?: boolean;
  hideControls?: boolean;
}

export const ModelViewer: FC<ModelViewerProps> = ({
  modelInfo,
  preview,
  sourceImageIndex,
  fetchOrGenerateMesh,
  showPointCloud = false,
  hideControls = false,
}) => {
  //HACK isToggleThemeDisabled для блокировки тогла
  const { theme, setIsToggleThemeDisabled } = useTheme();
  const { t } = useLocale();
  const [model, setModel] = useState<MeshFormatEntity | undefined>();
  const [activeHdriIndex, setActiveHdriIndex] = useState(0);
  const [polygonCount, setPolygonCount] = useState<number | undefined>();
  const [isLoadingModel, setIsLoadingModel] = useState(false);
  const [removeMeshById] = useRemoveMeshByIdMutation();
  const [isPublished, setIsPublished] = useState<boolean>(preview?.gallery ?? false);
  const controlToken = localStorage.getItem('control-token') || sessionStorage.getItem('control-token');
  const canControl = Boolean(controlToken);

  const [favoriteModels, setFavoriteModels] = useState<GetGeneratedPreviewsQuery['getGeneratedPreviews']['data']>([]);
  const isStand = localStorage.getItem('demonstration');
  const isMobile = window.innerWidth < 959;
  const [hdriMenuOpen, setHdriMenuOpen] = useState(false);
  const [autoRotate, setAutoRotate] = useState(false);
  const [rotationEnabled, setRotationEnabled] = useState(false);
  const [loadingText, setLoadingText] = useState(() => getRandomLoadingText(t));
  const [isCameraOn, setIsCameraOn] = useState<boolean>(false);
  const [isSavingScreenshot, setIsSavingScreenshot] = useState(false);
  const [hasRendered, setHasRendered] = useState(false);
  const { checkAndNotify } = useErrorNotification();

  // управление освещенностью
  const [exposure, setExposure] = useState<number>(1.0);
  const [showLightPanel, setShowLightPanel] = useState<boolean>(false);

  const [estimationSeconds, setEstimationSeconds] = useState<number | null>(null);
  const [estimationTimestamp, setEstimationTimestamp] = useState<number>(0);
  const [initialEstimationSeconds, setInitialEstimationSeconds] = useState<number | null>(null);

  const handleEstimationUpdate = useCallback((seconds: number | null | undefined) => {
    if (seconds === null || seconds === undefined) return;
    const val = Number(seconds);
    setEstimationSeconds(val);
    setInitialEstimationSeconds((prev) => {
      if (prev === null) {
        setEstimationTimestamp(Date.now());
        return val;
      }
      return prev;
    });
  }, []);

  useEffect(() => {
    setEstimationSeconds(null);
    setEstimationTimestamp(0);
    setInitialEstimationSeconds(null);
  }, [preview?.id]);

  const webglCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoElRef = useRef<HTMLVideoElement | null>(null);

  const modelGroupRef = useRef<THREE.Group | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const loadingTextIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const screenshotRef = useRef<ScreenshotManagerHandle | null>(null);
  const LOADING_TEXT_INTERVAL = 20000;

  const inIframe = useInIframe();
  const setHdrMap = useViewerStore((state) => state.setHdrMap);
  const setFloorPositionY = useViewerStore((state) => state.setFloorPositionY);
  const isShowTexture = useViewerStore((state) => state.isShowTexture);
  const setShowTexture = useViewerStore((state) => state.setShowTexture);
  const showMesh = useViewerStore((state) => state.showMesh);
  const setShowMesh = useViewerStore((state) => state.setShowMesh);
  const setEditorLinkData = useViewerStore((state) => state.setEditorLinkData);
  const clearEditorLinkData = useViewerStore((state) => state.clearEditorLinkData);
  const setIsModelReady = useViewerStore((state) => state.setIsModelReady);

  // TODO: 1 000 000 полигонов — единственный признак модели для 3D печати;
  //  у таких моделей нет текстур, поэтому при открытии блокируем переключатель
  const facesFromPreview = preview?.numTargetFaces;
  const facesFromModel = modelInfo?.numTargetFaces;
  const numTargetFaces = facesFromPreview ?? facesFromModel;
  const isTextureToggleDisabled = typeof numTargetFaces === 'number' && numTargetFaces >= 1000000;

  // HACK: quick fix for animation freez on toggle theme
   useEffect(() => {
    setIsToggleThemeDisabled(showPointCloud);
    return () => setIsToggleThemeDisabled(false);
  }, [setIsToggleThemeDisabled, showPointCloud]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const menu = document.getElementById('hdri-menu');
      if (menu && !menu.contains(e.target as Node)) {
        setHdriMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsPublished(preview?.gallery ?? false);
  }, [preview?.gallery]);

  const sessionToken = getSessionToken();
  const { data } = useGetFavoriteModelsQuery({
    variables: { sessionToken },
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (data?.getFavoriteModels) {
      setFavoriteModels(data.getFavoriteModels);
    }
  }, [data]);

  useEffect(() => {
    if (isLoadingModel) {
      setLoadingText(getRandomLoadingText(t));
      loadingTextIntervalRef.current = setInterval(() => {
        setLoadingText(getRandomLoadingText(t));
      }, LOADING_TEXT_INTERVAL);
    } else {
      if (loadingTextIntervalRef.current !== null) {
        clearInterval(loadingTextIntervalRef.current);
        loadingTextIntervalRef.current = null;
      }
    }
    return () => {
      if (loadingTextIntervalRef.current !== null) {
        clearInterval(loadingTextIntervalRef.current);
        loadingTextIntervalRef.current = null;
      }
    };
  }, [isLoadingModel]);

  const timeoutRef = useRef<NodeJS.Timeout>();
  const manualToggleRef = useRef(false);
  const userInteractedWhileRotatingRef = useRef(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (!rotationEnabled) {
      userInteractedWhileRotatingRef.current = false;
    }

    const handlePointerDown = () => {
      if (autoRotate) {
        userInteractedWhileRotatingRef.current = true;
      }
      setAutoRotate(false);
      clearTimeout(timeoutRef.current);
      manualToggleRef.current = false;
    };

    const autoRotateStartDelay = 3000;
    const handlePointerUp = () => {
      if (rotationEnabled && !userInteractedWhileRotatingRef.current) {
        timeoutRef.current = setTimeout(() => {
          setAutoRotate(true);
        }, autoRotateStartDelay);
      }
    };

    const canvas = document.querySelector('canvas');
    canvas?.addEventListener('pointerdown', handlePointerDown);
    canvas?.addEventListener('pointerup', handlePointerUp);

    return () => {
      canvas?.removeEventListener('pointerdown', handlePointerDown);
      canvas?.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isLoadingModel, rotationEnabled, autoRotate]);

  const toggleAutoRotation = () => {
    setAutoRotate(!autoRotate);
    setRotationEnabled(!rotationEnabled);
    manualToggleRef.current = true;
    userInteractedWhileRotatingRef.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const hdriHandler = useCallback(
    (index: number) => {
      startTransition(() => {
        setActiveHdriIndex(index);
        setHdrMap(index);
      });
    },
    [setHdrMap],
  );

  const showTextureHandler = useCallback(() => {
    const currentValue = useViewerStore.getState().isShowTexture;
    setShowTexture(!currentValue);
  }, [setShowTexture]);

  useEffect(() => {
    if (isTextureToggleDisabled && isShowTexture) {
      setShowTexture(false);
    }
  }, [isTextureToggleDisabled, isShowTexture, setShowTexture]);

  const showMeshHandler = useCallback(() => {
    setShowMesh(!showMesh);
  }, [showMesh, setShowMesh]);

  const { active } = useProgress();

  useEffect(() => {
    if (modelInfo?.status !== 'READY') {
      setIsLoadingModel(true);
      setHasRendered(false);

      const estimationSeconds =
        preview?.status === GenerationStatus.Pending ? preview.readyEstimationSeconds :
        modelInfo?.status === GenerationStatus.Pending ? modelInfo.readyEstimationSeconds :
        null;

      if (estimationSeconds) {
        handleEstimationUpdate(estimationSeconds);
      }

      const isCensored =
        modelInfo?.censored === true &&
        (modelInfo?.errorMessage === 'Censor Error' ||
          /censor/i.test(modelInfo?.errorMessage || '') ||
          modelInfo?.status === 'CANCELLED_VALIDATION');

      checkAndNotify({ censored: isCensored, status: preview?.status , previewId: preview?.id});

      // if (isCensored) {
      //   setIsLoadingModel(false);
      //   notification.error({
      //     message: isCensored ? 'Запрещённый контент' : 'Не удалось создать модель',
      //     description:
      //       modelInfo?.errorMessage ||
      //       (isCensored
      //         ? 'Сработал фильтр цензуры. Попробуйте перефразировать запрос'
      //         : 'Произошла ошибка при генерации. Попробуйте изменить запрос и повторите попытку.'),
      //     duration: 8,
      //   });
      //   setTimeout(() => navigate('/'), 5000);
        
      //   return;
      // } else if (modelInfo?.status === 'CANCELLED' || modelInfo?.status === 'CANCELLED_VALIDATION') {
      //   setIsLoadingModel(false);
      //   notification.error({
      //     message: 'Не удалось создать модель',
      //     description: modelInfo?.errorMessage || 'Произошла ошибка при генерации. Попробуйте повторить попытку',
      //     duration: 8,
      //   });
      //   setTimeout(() => navigate('/'), 5000);
      //   return;
      // }
      return;
    }
    setIsLoadingModel(active);
  }, [active, modelInfo, navigate, handleEstimationUpdate, preview?.status, preview?.readyEstimationSeconds, checkAndNotify, preview?.id]);

  useEffect(() => {
    if (!modelInfo) return;

    const hdriMap = modelInfo.generationMode === 'IMAGE_TO_GEOMETRY' || modelInfo.generationMode === 'TEXT_TO_GEOMETRY' ? 2 : 0;
    setActiveHdriIndex(hdriMap);
    setHdrMap(hdriMap)
    const glbModel = modelInfo.meshFormats?.find((mesh) => mesh.format.name === 'glb');
    setModel(glbModel);
    setHasRendered(false);
    userInteractedWhileRotatingRef.current = false;
  }, [modelInfo, setHdrMap, setShowMesh, setShowTexture]);

  // Обновляем данные для кнопки редактора в сторе
  useEffect(() => {
    if (model?.url && preview) {
      const orderToEdit = sourceImageIndex ?? preview?.meshSourceOrder ?? preview?.images?.[0]?.order ?? 0;
      setEditorLinkData({
        model,
        glbUrl: model.url,
        prompt: preview.prompt || '',
        previewId: preview.id,
        order: orderToEdit,
      });
    } else {
      clearEditorLinkData();
    }

    return () => {
      clearEditorLinkData();
    };
  }, [model, preview, sourceImageIndex, setEditorLinkData, clearEditorLinkData]);

  useEffect(() => {
    const isReady = !isLoadingModel && !!model?.url && hasRendered;
    setIsModelReady(isReady);
  }, [isLoadingModel, model?.url, hasRendered, setIsModelReady]);

  useEffect(() => {
    const handleToggleLight = () => setHdriMenuOpen((open) => !open);
    window.addEventListener('toggleLightMenu', handleToggleLight);
    return () => window.removeEventListener('toggleLightMenu', handleToggleLight);
  }, []);

   useEffect(() => {
    return () => {
      setShowTexture(true);
    };
  }, [setShowTexture]);

  const promptSmall = () => preview?.prompt || '';

  const removeButtonHandler = async () => {
    if (sourceImageIndex === null || !preview || !controlToken) return;
    await removeMeshById({
      variables: { id: preview.id, sourceImageIndex },
      context: { headers: { authorization: controlToken } },
    });
    console.debug('Removed mesh', preview.id);
    navigate('/');
  };
  const togglePublishHandler = async () => {
    if (!preview || !controlToken) return;
    const endpoint = import.meta.env.VITE_SERVER_URL ? `${import.meta.env.VITE_SERVER_URL}/graphql` : '/api/graphql';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        authorization: controlToken,
      },
      body: JSON.stringify({
        query: 'mutation TogglePreviewGalleryStatus($id: String!) { togglePreviewGalleryStatus(id: $id) }',
        variables: { id: preview.id },
      }),
    });
    const json = (await res.json()) as { data?: { togglePreviewGalleryStatus?: boolean } };
    const newStatus = json.data?.togglePreviewGalleryStatus;
    if (typeof newStatus === 'boolean') {
      setIsPublished(newStatus);
    } else {
      setIsPublished((v) => !v);
    }
  };

  const goAllModels = () => navigate('/models');

  const handleImageClick = (modelPreview: GetGeneratedPreviewsQuery['getGeneratedPreviews']['data'][0]) => {
    if (modelPreview.status === GenerationStatus.Pending || modelPreview.status === GenerationStatus.Cancelled) return;

    const orderToNavigate = modelPreview.meshSourceOrder ?? modelPreview.images[0]?.order;
    navigate(`/${modelPreview.id}/${orderToNavigate}`, { state: { fromModelViewer: true } });
  };

  const originalImageFormat = modelInfo?.meshFormats?.find((format) => format.format?.name === 'original_image');

  const toggleCamera = () => setIsCameraOn((on) => !on);

  const handleAnalyze = useCallback(
    (minY: number, polygonCount: number) => {
      setFloorPositionY(-minY);
      setPolygonCount(polygonCount);
    },
    [setFloorPositionY],
  );

  const handleRenderError = async () => {
    if (sourceImageIndex === null || !preview) {
      notification.error({
        message: t.errorCannotRestoreModel,
        description: t.errorCannotRestoreModelDesc,
        duration: 5,
      });

      setTimeout(() => {
        navigate('/');
      }, 5000);
      return;
    }

    try {
      const contextOption = controlToken ? { context: { headers: { authorization: controlToken } } } : {};
      await removeMeshById({ variables: { id: preview.id, sourceImageIndex, all: false }, ...contextOption });
      await fetchOrGenerateMesh(sourceImageIndex);
      notification.error({
        message: t.errorRendering,
        description: t.errorRenderingDesc,
        duration: 5,
      });

      setTimeout(() => {
        window.location.reload();
      }, 5000);
    } catch (e) {
      console.error('Error during recovery after render error:', e);
      notification.error({
        message: t.errorRestoreModel,
        description: t.errorRestoreModelDesc,
        duration: 8,
      });
    }
  };

  const handleScreenshot = useCallback(async () => {
    await screenshotRef.current?.takeScreenshot();
  }, []);

  return (
    <CenteredContent>
      <Container isDragging={false} isInIframe={inIframe} className={styles.modelViewerContainer}>
        <IframeScrollPanels enabled={inIframe} />
        {showPointCloud && hideControls && preview?.prompt && (
          <PointCloudHeader>
            <BodyS bold color={secondary}>
              {t.promptLabel}:
            </BodyS>
            <ExpandableText text={preview.prompt} maxLength={100} />
          </PointCloudHeader>
        )}
        {!hideControls && (
          <>
            <div className={classNames(styles.modelPanels)}>
              <ModelInfoPane
                theme={theme}
                isStand={isStand}
                isLoadingModel={isLoadingModel}
                modelInfo={modelInfo}
                previewPrompt={promptSmall()}
                originalImageUrl={originalImageFormat?.url}
                polygonCount={polygonCount}
                rotationEnabled={rotationEnabled}
                autoRotate={autoRotate}
                isCameraOn={isCameraOn}
                isSavingScreenshot={isSavingScreenshot}
                onRemove={removeButtonHandler}
                onToggleAutoRotation={toggleAutoRotation}
                onToggleCamera={toggleCamera}
                onScreenshot={handleScreenshot}
                exposure={exposure}
                showLightPanel={showLightPanel}
                onToggleLightPanel={() => setShowLightPanel((v) => !v)}
                onChangeExposure={(v) => setExposure(v)}
                canControl={canControl}
                isPublished={isPublished}
                onTogglePublish={togglePublishHandler}
              />
              <FavoriteModelsPanel
                theme={theme}
                inIframe={!!inIframe}
                favoriteModels={favoriteModels}
                activePreviewId={preview?.id}
                activeSourceImageIndex={sourceImageIndex}
                onClickModel={handleImageClick}
                onClickAllModels={goAllModels}
              />
              {!isLoadingModel && !!model?.url && (
                <ModelSettingsPanel
                  theme={theme}
                  activeHdriIndex={activeHdriIndex}
                  hdriMenuOpen={hdriMenuOpen}
                  onToggleHdriMenu={() => setHdriMenuOpen((open) => !open)}
                  onSelectHdri={hdriHandler}
                  onToggleTexture={showTextureHandler}
                  onToggleMesh={showMeshHandler}
                  isTextureDisabled={isTextureToggleDisabled}
                />
              )}
            </div>
          </>
        )}

        <ContainerBlock
          isLoading={isLoadingModel}
          className={classNames(styles.editorContainer, inIframe && styles.iframe)}
          data-theme={theme}
        >
          {showPointCloud ? (
            <>
              <div
                style={{
                  position: 'absolute',
                  top: '-10%',
                  left: 0,
                  width: '100%',
                  height: '100%',
                  zIndex: 0,
                }}
              >
                <PointCloudCanvas cameraDistance={4.18} />
              </div>
              <LoadingContainer
                className={styles.loadingContainer}
                style={
                  showPointCloud
                    ? {
                        position: 'relative',
                        zIndex: 1,
                        height: 'auto',
                        minHeight: '100px',
                        marginTop: '250px',
                        transform: 'none',
                      }
                    : undefined
                }
              >
                <BodyM>
                  {
                  // preview?.status === 'CANCELLED' || preview?.status === 'CANCELLED_VALIDATION' ? (
                  //   'Не удалось создать модель. Возврат на главную ...'
                  // ) : (preview?.status === GenerationStatus.Pending ||
                  //     preview?.status === GenerationStatus.Validation) &&
                    estimationSeconds !== null ? (
                    <GenerationProgress
                      estimationSeconds={estimationSeconds}
                      initialEstimationSeconds={initialEstimationSeconds}
                      estimationTimestamp={estimationTimestamp}
                    />
                  ) : (
                    loadingText
                  )}
                </BodyM>
              </LoadingContainer>
            </>
          ) : (
            <Scene
              isCameraOn={isCameraOn}
              autoRotate={autoRotate}
              modelUrl={model?.url}
              isMobile={isMobile}
              modelGroupRef={modelGroupRef}
              controlsRef={controlsRef}
              webglCanvasRef={webglCanvasRef}
              videoElRef={videoElRef}
              onAnalyze={handleAnalyze}
              onRenderError={handleRenderError}
              onRendered={() => {
                setHasRendered(true);
              }}
              exposure={exposure}
              restoreOnCameraOff={true}
              showThickAxes={false}
            />
          )}
        </ContainerBlock>
        <ScreenshotManager
          ref={screenshotRef}
          isCameraOn={isCameraOn}
          webglCanvasRef={webglCanvasRef}
          videoElRef={videoElRef}
          onSavingChange={setIsSavingScreenshot}
        />
      </Container>
      {isStand && modelInfo?.id && hasRendered && <QRCodeModel meshId={modelInfo.id} className={styles.qrStand} />}
    </CenteredContent>
  );
};

const Container = styled.div<{ isDragging: boolean; isInIframe: boolean }>`
  position: fixed;
  width: 100%;
  height: ${({ isInIframe }) => (isInIframe ? '900px' : '100%')};
`;

const ContainerBlock = styled.div<{ isLoading: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: ${({ isLoading }) => (isLoading ? 'blur(8px)' : 'none')};
  height: 100%;
  position: relative;

  @media (max-width: 959px) {
    padding: 0;
    border-radius: 0;
    border: none;
  }

  @media (max-width: 560px) {
    padding: 0;
    border-radius: 0;
    border: none;
  }
`;

const LoadingContainer = styled.div``;

const PointCloudHeader = styled.div`
  position: absolute;
  top: 60px;
  left: 65px;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  pointer-events: auto;
  cursor: default;
  gap: 5px;
  width: 350px;
  color: var(--color);

  @media (max-width: 959px) {
    top: 10px;
    left: 10px;
    width: calc(100% - 20px);

    .promptLabel {
      font-size: 16px;
    }

    .promptText {
      font-size: 15px;
    }
  }
`;
