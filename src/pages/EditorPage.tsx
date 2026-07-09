import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { TransformTranslateIcon, TransformRotateIcon, TransformScaleIcon } from '../components/Icons.tsx';
import { BackButton } from '../components/back-button';
import ThemeToggle from '../components/theme-toggle/ThemeToggle.tsx';
import { PointCloudCanvas } from '../components/point-cloud';
import LogoLightImg from '../assets/icons/Logo-light.svg';
import LogoDarkImg from '../assets/icons/Logo-dark.svg';
import styles from './EditorPage.module.css';
import {
  MeshFormatEntity,
  useOnPreviewStatusChangedSubscription,
  useOnMeshStatusChangedSubscription,
  GenerationStatus,
  useGetPreviewByIdQuery,
  MeshRequestEntity,
} from '../graphql/graphQlApiHooks.ts';
import * as THREE from 'three';
import { OrbitControls } from 'three-stdlib';
import { Scene } from '../components/model-viewer/scene';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { useModelStatusAndGenerate } from '../hooks';
import { Button, notification, Tooltip } from 'antd';
import { useViewerStore } from '../store/viewer.ts';
import { useGameDevStore } from '../store/gamedev.ts';
import styled from 'styled-components';
import { useTheme, useLocale } from '../context';
import { BackgroundGradients } from '../components/background-gradients/index.ts';
import { getApiBaseUrl } from '../utils/serverUrl';
import { GenerationProgress } from '../components/generation-progress';
import { useInIframe } from '../hooks/useInIframe.ts';
import { postIframeScrollUp } from '../hooks/useIframeAutoResize.ts';
import classNames from 'classnames';
import { IframeScrollPanels } from '../components/IframeScrollPanels';
import { useErrorNotification } from '../components/preview/useNotificationError.ts';

const EditorPage: FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLocale();
  const { setHdrMap } = useViewerStore();
  const isShowTexture = useViewerStore((s) => s.isShowTexture);
  const setShowTexture = useViewerStore((s) => s.setShowTexture);
  const showMesh = useViewerStore((s) => s.showMesh);
  const setShowMesh = useViewerStore((s) => s.setShowMesh);
  const previewNum = useGameDevStore((s) => s.previewNum);
  const setPbrMode = useGameDevStore((s) => s.setPbrMode);
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location as {
    state?: {
      model?: MeshFormatEntity | undefined;
      glbUrl?: string;
      prompt?: string;
      previewId?: string;
      order?: number;
      skipPreview?: boolean;
      showPreviewModal?: boolean;
      is3DPrintMode?: boolean;
      fromModelViewer?: boolean;
      isGameDevMode?: boolean;
    };
  };

  // текущее GLB которое рисуем на сцене
  const [modelUrl, setModelUrl] = useState<string | undefined>(state?.model?.url ?? state?.glbUrl);
  const normalizeOrder = useCallback((o: number) => (o === 101 ? 100 : o), []);
  const sceneKey = 0;

  const [autoRotate, setAutoRotate] = useState(false);
  const [isCameraOn] = useState(false);
  const [exposure] = useState<number>(1.0);
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 959 : false;

  const modelGroupRef = useRef<THREE.Group | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const webglCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const { checkAndNotify } = useErrorNotification();

  const handleAnalyze = useCallback((_: number, polygonCount: number) => {
    setPolygonCount(polygonCount);
    modelOffsetYSetByAnalysisRef.current = true;
    setIsModelHeightCalculated(true);
  }, []);

  const handleRenderError = useCallback(() => navigate('/'), [navigate]);

  useEffect(() => {
    setHdrMap(0);
  }, [setHdrMap]);

  // применяем Pbr только при новой генерации в геймдев режиме с главной
  useEffect(() => {
    if (!pbrModeResetOnMountRef.current) {
      const locationState = location.state as typeof state;
      if (!locationState?.isGameDevMode && !locationState?.showPreviewModal) {
        setPbrMode('pbr');
      }
      pbrModeResetOnMountRef.current = true;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ресетим pbr при уходе со страницы
  useEffect(() => {
    return () => {
      setPbrMode('pbr');
      setShowTexture(true);
    };
  }, [setPbrMode, setShowTexture]);

  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);
  const [activeOrder, setActiveOrder] = useState<number | null>(null);
  const [isMeshLoading, setIsMeshLoading] = useState<boolean>(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState<boolean>(false);
  const [estimationSeconds, setEstimationSeconds] = useState<number | null>(null);
  const [estimationTimestamp, setEstimationTimestamp] = useState<number>(0);
  const [initialEstimationSeconds, setInitialEstimationSeconds] = useState<number | null>(null);
  const [loadingStatus, setLoadingStatus] = useState<GenerationStatus | undefined>(undefined);

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
  }, [activePreviewId, activeOrder]);

  // Сброс состояния модели
  const resetModelState = useCallback(
    ({
      resetFromCatalog = true,
      setMeshLoading = false,
      resetModelUrlRef = false,
      resetLodLevels = false,
      updateOffsetY = false,
      keepModelUrl = false,
    } = {}) => {
      !keepModelUrl && setModelUrl(undefined);
      if (!updateOffsetY || !modelOffsetYSetByAnalysisRef.current) {
        setModelOffsetY(0);
      }
      !updateOffsetY && (modelOffsetYSetByAnalysisRef.current = false);
      setPolygonCount(undefined);
      setIsModelHeightCalculated(false);
      resetFromCatalog && setIsFromCatalog(false);
      setMeshLoading && setIsMeshLoading(true);
      resetModelUrlRef && (modelUrlFromStateRef.current = undefined);
      if (resetLodLevels) {
        setAvailableLodLevels([]);
        setActiveLodLevel(0);
      }
    },
    [],
  );

  // Загрузка модели из готового меша
  const loadModelFromMesh = useCallback(
    (mesh: MeshRequestEntity, previewId: string, order: number) => {
      const glb = mesh.meshFormats?.find((f) => f.format?.name === 'glb');
      if (!glb?.url) return;

      const wasReset = lastSetModelUrlRef.current.previewId === null;
      if (wasReset && previousModelUrlRef.current === glb.url) {
        return;
      }

      lastSetModelUrlRef.current = { previewId, order };
      previousModelUrlRef.current = undefined;
      resetModelState({ resetLodLevels: true, updateOffsetY: true, keepModelUrl: true });
      setModelUrl(glb.url);
      setShowTexture(true);
      setIsMeshLoading(false);
    },
    [resetModelState, setShowTexture],
  );
  const [pickedPreviewModel, setPickedPreviewModel] = useState<{ numTargetFaces?: number | null } | null>(null);
  const [modelOffsetY, setModelOffsetY] = useState<number>(0);
  const modelOffsetYSetByAnalysisRef = useRef<boolean>(false);
  const [isModelHeightCalculated, setIsModelHeightCalculated] = useState<boolean>(false);
  void isModelHeightCalculated; // Suppress TS6133
  const [currentPrompt, setCurrentPrompt] = useState<string | undefined>(state?.prompt);
  const [polygonCount, setPolygonCount] = useState<number | undefined>(undefined);
  const promptFromPreviewRef = useRef<boolean>(false);
  const [transformMode, setTransformMode] = useState<'translate' | 'rotate' | 'scale' | undefined>(undefined);
  const [activeHdriIndex, setActiveHdriIndex] = useState(0);
  const [hdriMenuOpen, setHdriMenuOpen] = useState(false);
  const [modelCenter, setModelCenter] = useState<[number, number, number]>([0, 0, 0]);
  const [modelRotation, setModelRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [modelSize, setModelSize] = useState<[number, number, number] | undefined>(undefined);
  const [availableLodLevels, setAvailableLodLevels] = useState<number[]>([]);
  const [activeLodLevel, setActiveLodLevel] = useState<number>(0);
  const inIframe = useInIframe();

  useEffect(() => {
    if (!inIframe) return;
    postIframeScrollUp('editor');
  }, [inIframe]);

  const handleLodLevelsDetected = useCallback((levels: number[]) => {
    setAvailableLodLevels((prev) => {
      if (prev.length === levels.length && prev.every((value, index) => value === levels[index])) {
        return prev;
      }
      return levels;
    });

    if (!levels.length) {
      setActiveLodLevel(0);
      return;
    }

    setActiveLodLevel((prev) => {
      if (levels.includes(prev)) {
        return prev;
      }
      // выбираем лод 0 или первый доступный
      return levels.includes(0) ? 0 : levels[0];
    });
  }, []);

  // Используем ref для отслеживания последнего activePreviewId/activeOrder, при котором был установлен modelUrl
  const lastSetModelUrlRef = useRef<{ previewId: string | null; order: number | null }>({
    previewId: null,
    order: null,
  });
  // Запоминаем старый modelUrl при выборе новой модели, чтобы предотвратить установку старого modelUrl
  const previousModelUrlRef = useRef<string | undefined>(undefined);
  // Отслеживаем, был ли modelUrl установлен из state, чтобы не сбрасывать modelOffsetY после анализа
  const modelUrlFromStateRef = useRef<string | undefined>(undefined);
  const pbrModeResetOnMountRef = useRef<boolean>(false);

  const [isFromCatalog, setIsFromCatalog] = useState(false);
  const [isGeneratingFromSidebar, setIsGeneratingFromSidebar] = useState(false);
  const [meshRequestId, setMeshRequestId] = useState<string | null>(null);
  const [meshFromSubscription, setMeshFromSubscription] = useState<MeshRequestEntity | null>(null);
  const [isPreviewReadyForModal, setIsPreviewReadyForModal] = useState(false);

  // При skipPreview не запрашиваем mesh по order (так как изображений нет)
   const shouldFetchMesh = (!state?.skipPreview || isFromCatalog || state?.isGameDevMode) && !isGeneratingFromSidebar;
  const { modelInfo, fetchOrGenerateMesh } = useModelStatusAndGenerate(
    shouldFetchMesh ? activePreviewId ?? undefined : undefined,
    shouldFetchMesh && activeOrder !== null ? String(activeOrder) : undefined,
  );

  const activeMesh = meshFromSubscription ?? modelInfo ?? null;

  // Запрашиваем preview для получения промта при переключении моделей
  const { data: previewData, refetch: refetchPreview } = useGetPreviewByIdQuery({
    variables: { id: activePreviewId || '' },
    skip: !activePreviewId || (state?.skipPreview && !state?.isGameDevMode && !isGeneratingFromSidebar),
    fetchPolicy: 'network-only',
  });

  // подписка на статус preview
  const { data: previewStatusData, error: previewSubError } = useOnPreviewStatusChangedSubscription({
    variables: { id: activePreviewId || '' },
    skip:
      (!state?.skipPreview && !state?.isGameDevMode && !state?.showPreviewModal && !isGeneratingFromSidebar) ||
      !activePreviewId,
  });

  // лог подписки
  useEffect(() => {
    if (previewSubError) {
      console.error('[DEBUG] Preview subscription error:', previewSubError);
    }
  }, [previewSubError]);

  useEffect(() => {
    if (state?.skipPreview && activePreviewId) {
      console.log('[DEBUG] Preview subscription active for:', activePreviewId);
    }
  }, [state?.skipPreview, activePreviewId]);

  // Для gamedev режима - обрабатываем данные из query (не только subscription)
  useEffect(() => {
    if (!state?.isGameDevMode || state?.showPreviewModal || !previewData?.getPreviewById) return;

    const preview = previewData.getPreviewById;
    console.log('[DEBUG] GameDev mode - query preview data:', preview.status, 'images:', preview.images?.length);

    // Обновляем промт из preview
    if (preview.prompt && preview.id === activePreviewId) {
      setCurrentPrompt(preview.prompt);
      promptFromPreviewRef.current = true;
    }

    // Двойное срабатывание в gameDev режиме
    checkAndNotify({ censored: preview.censored, status: preview.status, previewId: activePreviewId});

    if (preview.status && preview.id === activePreviewId) {
      setLoadingStatus(preview.status);

      if (preview.status === GenerationStatus.Pending && preview.readyEstimationSeconds) {
        handleEstimationUpdate(preview.readyEstimationSeconds);
      }
    }

    // Когда preview готов и есть изображения, устанавливаем activeOrder если его еще нет
    const hasImages = (preview.images?.length ?? 0) > 0;
    if (preview.status === GenerationStatus.Ready && hasImages && activeOrder === null) {
      const firstImage = preview.images?.find((img) => img.order >= 0 && img.order <= 3);
      if (firstImage) {
        if (previewNum === 1) {
          setActiveOrder(firstImage.order);
        } else {
          setActiveOrder(firstImage.order);
        }
      }
    }
  }, [
    state?.isGameDevMode,
    state?.showPreviewModal,
    previewData,
    activePreviewId,
    activeOrder,
    previewNum,
    handleEstimationUpdate,
    checkAndNotify,
  ]);

  // Для генерации из сайдбара выставляем isPreviewLoading при генерации preview
  useEffect(() => {
    if (isGeneratingFromSidebar && previewNum === 1 && activePreviewId) {
      setIsPreviewLoading(true);
    } else if (!isGeneratingFromSidebar) {
      // Сбрасываем isPreviewLoading когда генерация из сайдбара завершена
      setIsPreviewLoading(false);
    }
  }, [isGeneratingFromSidebar, previewNum, activePreviewId]);

  useEffect(() => {
    if (!isGeneratingFromSidebar || previewNum !== 1 || !previewData?.getPreviewById) return;

    const preview = previewData.getPreviewById;
    console.log('[DEBUG] Sidebar generation - query preview data:', preview.status, 'images:', preview.images?.length);

    if (preview.status && preview.id === activePreviewId) {
      setLoadingStatus(preview.status);

      if (preview.status === GenerationStatus.Pending || preview.status === GenerationStatus.Validation) {
        setIsPreviewLoading(true);
      } else if (preview.status === GenerationStatus.Ready) {
        setIsPreviewLoading(false);
      }

      if (preview.status === GenerationStatus.Pending && preview.readyEstimationSeconds) {
        handleEstimationUpdate(preview.readyEstimationSeconds);
      }
    }

    const hasImages = (preview.images?.length ?? 0) > 0;
    if (preview.status === GenerationStatus.Ready && hasImages && activeOrder === null) {
      setIsPreviewLoading(false);
      const firstImage = preview.images?.find((img) => img.order >= 0 && img.order <= 3);
      if (firstImage) {
        setActiveOrder(firstImage.order);
      }
    }
  }, [isGeneratingFromSidebar, previewNum, previewData, activePreviewId, activeOrder, handleEstimationUpdate]);

  // получаем meshRequestId из preview когда он становится READY
  useEffect(() => {
    if (
      (!state?.skipPreview && !isGeneratingFromSidebar && !state?.isGameDevMode && !state?.showPreviewModal) ||
      !previewStatusData?.previewStatusChanged
    )
      return;

    const preview = previewStatusData.previewStatusChanged;
    console.log('[DEBUG] Preview status changed:', preview.status);
    checkAndNotify({ censored: preview.censored, status: preview.status, previewId: activePreviewId });
    setLoadingStatus(preview.status);

    if (
      isGeneratingFromSidebar &&
      (preview.status === GenerationStatus.Pending || preview.status === GenerationStatus.Validation) &&
      preview.id === activePreviewId
    ) {
      setIsPreviewLoading(true);
    } else if (isGeneratingFromSidebar && preview.status === GenerationStatus.Ready && preview.id === activePreviewId) {
      setIsPreviewLoading(false);
    }

    if (preview.status === GenerationStatus.Pending && preview.readyEstimationSeconds) {
      console.log('[DEBUG] Preview readyEstimationSeconds:', preview.readyEstimationSeconds);
      handleEstimationUpdate(preview.readyEstimationSeconds);
    }

    // Обновляем промт из preview только если это текущий preview
    if (preview.prompt && preview.id === activePreviewId) {
      setCurrentPrompt(preview.prompt);
    }

    // показываем модалку когда превью готово
    if (state?.showPreviewModal && preview.id === activePreviewId) {
      if (preview.status === GenerationStatus.Pending || preview.status === GenerationStatus.Validation) {
        setIsPreviewLoading(true);
      } else if (preview.status === GenerationStatus.Ready) {
        setIsPreviewLoading(false);
        setIsPreviewReadyForModal(true);
      }
      return;
    }

    // Проверяем есть ли уже mesh в preview

    if (state?.skipPreview) {
      // Проверяем есть ли уже mesh в preview
      const firstImage = preview.images?.[0];
      const firstMesh = firstImage?.meshRequests?.[0];

      if (firstMesh?.id) {
        console.log('[DEBUG] Got meshRequestId:', firstMesh.id, 'status:', firstMesh.status);
        setMeshRequestId(firstMesh.id);
        setIsGeneratingFromSidebar(false);

        // Если mesh уже READY, сразу показываем модель
        if (firstMesh.status === GenerationStatus.Ready) {
          setMeshFromSubscription(firstMesh as MeshRequestEntity);
          const glbFormat = firstMesh.meshFormats?.find((f) => f.format?.name === 'glb');
          if (glbFormat?.url) {
            console.log('[DEBUG] Model already ready, setting URL:', glbFormat.url);
            setModelUrl(glbFormat.url);
            setShowTexture(true);
            setIsModelHeightCalculated(false);
            if (!modelOffsetYSetByAnalysisRef.current) {
              setModelOffsetY(0);
            }
          }
        }
      }
    }

    if (state?.isGameDevMode || state?.showPreviewModal) {
      const hasImages = (preview.images?.length ?? 0) > 0;

      // Когда preview готов и есть изображения, устанавливаем activeOrder если его еще нет
      if (preview.status === GenerationStatus.Ready && hasImages && activeOrder === null) {
        const firstImage = preview.images?.find((img) => img.order >= 0 && img.order <= 3);
        if (firstImage) {
          if (previewNum === 1) {
            setActiveOrder(firstImage.order);
          } else {
            setActiveOrder(firstImage.order);
          }
        }
      }
    }
  }, [previewStatusData, state?.skipPreview, state?.showPreviewModal, activePreviewId, isGeneratingFromSidebar, handleEstimationUpdate, state?.isGameDevMode, activeOrder, previewNum, setShowTexture, checkAndNotify]);

  // Подписываемся на изменение статуса mesh
  const { data: meshStatusData, error: meshSubError } = useOnMeshStatusChangedSubscription({
    variables: { id: meshRequestId || '' },
    skip: (!state?.skipPreview && !isGeneratingFromSidebar) || !meshRequestId,
  });

  // Логируем ошибки mesh subscription
  useEffect(() => {
    if (meshSubError) {
      console.error('[DEBUG] Mesh subscription error:', meshSubError);
    }
  }, [meshSubError]);

  // Логируем когда mesh subscription активен
  useEffect(() => {
    if (state?.skipPreview && meshRequestId) {
      console.log('[DEBUG] Mesh subscription active for meshRequestId:', meshRequestId);
    }
  }, [state?.skipPreview, meshRequestId]);

  // Когда mesh готов, показываем модель
  useEffect(() => {
    if (!state?.skipPreview || !meshStatusData?.meshStatusChanged) return;

    const mesh = meshStatusData.meshStatusChanged;
    console.log('[DEBUG] Mesh status changed:', mesh.status);
    setLoadingStatus(mesh.status);

    if (mesh.status === GenerationStatus.Pending && mesh.readyEstimationSeconds) {
      console.log('[DEBUG] readyEstimationSeconds:', mesh.readyEstimationSeconds);
      handleEstimationUpdate(mesh.readyEstimationSeconds);
    }

    if (mesh.status === GenerationStatus.Ready) {
      setMeshFromSubscription(mesh as MeshRequestEntity);
      const glbFormat = mesh.meshFormats?.find((f) => f.format?.name === 'glb');

      if (glbFormat?.url) {
        console.log('[DEBUG] Model ready, setting URL:', glbFormat.url);
        setModelUrl(glbFormat.url);
        setShowTexture(true);
        setIsModelHeightCalculated(false);
        if (!modelOffsetYSetByAnalysisRef.current) {
          setModelOffsetY(0);
        }
      }
    }
  }, [
    meshStatusData,
    state?.skipPreview,
    state?.isGameDevMode,
    state?.showPreviewModal,
    isGeneratingFromSidebar,
    handleEstimationUpdate,
    setShowTexture,
  ]);

  const isCensorError = useCallback((info: MeshRequestEntity | null): boolean => {
    if (!info) return false;

    return (
      info.censored === true &&
        (info.errorMessage === 'Censor Error' || /censor/i.test(info.errorMessage || '') || info.status === GenerationStatus.CancelledValidation)
    )
  }, [])

  // Для режима gamedev - автоматически запускаем генерацию модели когда activeOrder установлен
  useEffect(() => {
    if (meshFromSubscription) {
      return;
    }
    // надо ли делать генерацию меша после выбора превью
    const needGenerate =
      (state?.isGameDevMode || state?.showPreviewModal) &&
      activePreviewId &&
      activeOrder !== null &&
      fetchOrGenerateMesh;

    if (needGenerate) {
      fetchOrGenerateMesh(activeOrder);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.isGameDevMode, state?.showPreviewModal, activePreviewId, activeOrder, meshFromSubscription]);

  useEffect(() => {
    if (isGeneratingFromSidebar && previewNum === 1 && activePreviewId && activeOrder !== null && fetchOrGenerateMesh) {
      setIsGeneratingFromSidebar(false);
      setIsPreviewLoading(false); // Preview готов, сбрасываем isPreviewLoading
      fetchOrGenerateMesh(activeOrder);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGeneratingFromSidebar, previewNum, activePreviewId, activeOrder]);

  // Fallback: Polling для режима skipPreview если subscriptions не работают
  useEffect(() => {
    if (!state?.skipPreview || !activePreviewId || modelUrl) return;

    console.log('[DEBUG] Starting fallback polling for preview:', activePreviewId);

    const pollInterval = setInterval(async () => {
      try {
        const serverUrl = getApiBaseUrl();
        const response = await fetch(`${serverUrl}/graphql`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: `
                query GetPreviewById($id: String!) {
                  getPreviewById(id: $id) {
                    id
                    status
                    readyEstimationSeconds
                    prompt
                    images {
                      id
                      meshRequests {
                        id
                        status
                        readyEstimationSeconds
                        meshFormats {
                          id
                          url
                          format {
                            id
                            name
                          }
                        }
                      }
                    }
                  }
                }
              `,
            variables: { id: activePreviewId },
          }),
        });

        const { data } = await response.json();
        const preview = data?.getPreviewById;

        if (preview) {
          if (preview.status !== loadingStatus) {
            setLoadingStatus(preview.status);  
          }

          if (preview.status === GenerationStatus.Pending && preview.readyEstimationSeconds) {
            handleEstimationUpdate(preview.readyEstimationSeconds);
          }
        }

        console.log('[DEBUG] Fallback polling: Got preview', {
          status: preview?.status,
          imagesCount: preview?.images?.length,
          firstImageId: preview?.images?.[0]?.id,
          meshRequestsCount: preview?.images?.[0]?.meshRequests?.length,
          firstMeshId: preview?.images?.[0]?.meshRequests?.[0]?.id,
          firstMeshStatus: preview?.images?.[0]?.meshRequests?.[0]?.status,
          readyEstimationSeconds: preview?.readyEstimationSeconds,
          formatsCount: preview?.images?.[0]?.meshRequests?.[0]?.meshFormats?.length,
        });

        const isPreviewCensored = isCensorError(preview)
      
        checkAndNotify({ censored: isPreviewCensored, status: preview.status, previewId: activePreviewId });


        if (preview?.status === 'READY') {
          console.log('[DEBUG] Fallback polling: Preview ready');
          // Обновляем промт из preview только если это текущий preview
          if (preview.prompt && preview.id === activePreviewId) {
            setCurrentPrompt(preview.prompt);
          }
          const firstImage = preview.images?.[0];
          const firstMesh = firstImage?.meshRequests?.[0];
          const isMeshCensored = isCensorError(firstMesh)
          if (isMeshCensored) {
            setIsMeshLoading(false);
            // notification.error({
            //   message: 'Сработал фильтр цензуры',
            //   description: 'Попробуйте перефразировать Ваш запрос или пришлите другое изображение',
            //   duration: 8,
            // });
            checkAndNotify({ censored: isMeshCensored, status: firstMesh.status, previewId: activePreviewId });
            // TODO: add censor popup
            setTimeout(() => navigate('/'), 5000);
            return;
          }
          
          
          if (firstMesh?.status === 'READY') {

            
            setMeshFromSubscription(firstMesh as MeshRequestEntity);
            const glbFormat = firstMesh.meshFormats?.find((f: MeshFormatEntity) => f.format?.name === 'glb');

            if (glbFormat?.url) {
              console.log('[DEBUG] Fallback polling: Model ready, URL:', glbFormat.url);
              setModelUrl(glbFormat.url);
              setShowTexture(true);
              setIsModelHeightCalculated(false);
              if (!modelOffsetYSetByAnalysisRef.current) {
                setModelOffsetY(0);
              }
              clearInterval(pollInterval);
            } else {
              console.log(
                '[DEBUG] Fallback polling: GLB format not found in formats:',
                firstMesh.meshFormats?.map((f: MeshFormatEntity) => f.format?.name),
              );
            }
          } else {
            console.log('[DEBUG] Fallback polling: Mesh not ready yet, status:', firstMesh?.status);
            if (firstMesh?.status === GenerationStatus.Pending && firstMesh?.readyEstimationSeconds) {
              handleEstimationUpdate(firstMesh.readyEstimationSeconds);
              setLoadingStatus(GenerationStatus.Pending);
            }
          }
        }
      } catch (error) {
        console.error('[DEBUG] Fallback polling error:', error);
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [state?.skipPreview, activePreviewId, modelUrl, handleEstimationUpdate, setShowTexture, loadingStatus, isCensorError, modelInfo?.errorMessage, navigate, checkAndNotify]);

  // Fallback: Polling для gamedev режима если subscriptions не работают
  useEffect(() => {
    if (!state?.isGameDevMode || !activePreviewId || activeOrder !== null) return;

    console.log('[DEBUG] Starting fallback polling for gamedev mode, preview:', activePreviewId);

    const pollInterval = setInterval(() => {
      console.log('[DEBUG] Gamedev polling: refetching preview data...');
      refetchPreview();
    }, 3000);

    return () => {
      console.log('[DEBUG] Stopping gamedev polling');
      clearInterval(pollInterval);
    };
  }, [state?.isGameDevMode, activePreviewId, activeOrder, refetchPreview]);

  const handlePickVariant = useCallback(
    (
      previewId: string,
      order: number,
      prompt?: string,
      meshRequest?: MeshRequestEntity,
      previewModel?: { numTargetFaces?: number | null },
    ) => {
      // Запоминаем текущий modelUrl перед сбросом
      previousModelUrlRef.current = modelUrl;
      setActivePreviewId(previewId);

      const is3DPrint = previewModel?.numTargetFaces === 1000000;
      const isGameDevMode = state?.isGameDevMode;
      // при генерации из сайдбара не открываем модалку и ждем готовности preview
      const isFromSidebarGeneration = !meshRequest && !isGameDevMode;

      if (isFromSidebarGeneration && (is3DPrint || previewNum === 1)) {
        setActiveOrder(null);
        setIsGeneratingFromSidebar(true);
        setIsFromCatalog(true);
        setLoadingStatus(GenerationStatus.Pending);
      } else {
        setActiveOrder(order);
        setIsFromCatalog(true);
        setIsGeneratingFromSidebar(false);
      }

      // если нет промта, получаем его из previewData
      if (prompt && prompt !== previewId) {
        setCurrentPrompt(prompt);
        promptFromPreviewRef.current = false;
      } else {
        setCurrentPrompt(undefined);
        promptFromPreviewRef.current = false;
      }
      resetModelState({ setMeshLoading: true, resetModelUrlRef: true });
      setIsPreviewLoading(false);
      lastSetModelUrlRef.current = { previewId: null, order: null };
      setMeshFromSubscription(meshRequest || null);
      setPickedPreviewModel(previewModel || null);
      setEstimationSeconds(null);
      setInitialEstimationSeconds(null);
      if (previewId !== activePreviewId) {
        setPbrMode('pbr');
      }
      if (!(isFromSidebarGeneration && (is3DPrint || previewNum === 1))) {
        setLoadingStatus(undefined);
      } else {
        setIsPreviewLoading(true);
      }
    },
    [modelUrl, state?.isGameDevMode, previewNum, setPbrMode, activePreviewId, resetModelState],
  );

  useEffect(() => {
    if (!activePreviewId || meshFromSubscription) return;

    if (isGeneratingFromSidebar) {
      setIsMeshLoading(true);
      if (activeOrder === null) {
        return;
      }
    }

    if (activeOrder === null) return;

    // При skipPreview не запрашиваем mesh (он будет сгенерирован напрямую)
    if (state?.skipPreview && !isFromCatalog) {
      setIsMeshLoading(true);
      setLoadingStatus(GenerationStatus.Pending);
      return;
    }

    let aborted = false;
    (async () => {
      try {
        setIsMeshLoading(true);
        await fetchOrGenerateMesh(activeOrder);
        setIsFromCatalog(false);
      } catch (e: unknown) {
        if (!aborted) {
          console.error(e);
          const error = e as {
            graphQLErrors?: unknown[];
            networkError?: Error | { message?: string };
            message?: string;
          };
          const networkError = error?.networkError;
          const networkErrorMessage =
            networkError instanceof Error
              ? networkError.message
              : networkError && typeof networkError === 'object' && 'message' in networkError
              ? (networkError as { message?: string }).message
              : undefined;
          const errorMessage = networkErrorMessage || error?.message || t.unknownError;
          const isNetworkError = !!networkError;
          const isImageNotFound =
            errorMessage.toLowerCase().includes('selected image not found') ||
            errorMessage.toLowerCase().includes('image not found');

          // При ошибке "image not found" сразу редиректим на главную
          if (isImageNotFound) {
            notification.error({
              message: t.modelUnavailable,
              description: t.modelUnavailableDesc,
              duration: 5,
            });
            setTimeout(() => {
              navigate('/');
            }, 2000);
            setIsMeshLoading(false);
            return;
          }

          const isImageNotReady =
            errorMessage.toLowerCase().includes('not found') || errorMessage.toLowerCase().includes('not ready');

          const isAlreadyHandled = isNetworkError || isImageNotReady || !!error?.graphQLErrors;

          if (!isAlreadyHandled) {
            notification.error({
              message: t.errorStartModelGeneration,
              description: t.errorStartModelGenerationDesc,
              duration: 8,
            });
          }
          setIsMeshLoading(false);
          setIsFromCatalog(false);
        }
      }
    })();
    return () => {
      aborted = true;
    };
  }, [
    activePreviewId,
    activeOrder,
    fetchOrGenerateMesh,
    navigate,
    state?.skipPreview,
    isFromCatalog,
    isGeneratingFromSidebar,
    meshFromSubscription,
  ]);

  // showPreviewModal=true при previewNum > 1
  useEffect(() => {
    if (state?.showPreviewModal && state?.previewId) {
      setActivePreviewId(state.previewId);
      setIsPreviewLoading(true);
      setLoadingStatus(GenerationStatus.Pending);
      setIsPreviewReadyForModal(false);
      resetModelState();
    }
    if (state?.showPreviewModal && activePreviewId) {
      setIsPreviewReadyForModal(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.showPreviewModal, state?.previewId, activePreviewId]);

  useEffect(() => {
    if (state?.showPreviewModal) {
      return;
    }

    // Для gamedev режима устанавливаем только previewId, order будет установлен когда preview READY
    if (state?.isGameDevMode && state?.previewId && typeof state.order !== 'number') {
      console.log('[DEBUG] GameDev mode - setting only previewId, waiting for preview to be READY');
      setActivePreviewId(state.previewId);
      resetModelState({ setMeshLoading: true });
      return;
    }

    if (state?.previewId && typeof state.order === 'number') {
      const ord = normalizeOrder(state.order);
      setActivePreviewId(state.previewId);
      setActiveOrder(ord);
      resetModelState();
      setPickedPreviewModel(null); // Сбрасываем при переходе из state
      setMeshFromSubscription(null);
      setMeshRequestId(null);

      // Если skipPreview, автоматически запускаем генерацию без modelUrl
      if (!state.skipPreview && (state?.model?.url || state?.glbUrl)) {
        const newUrl = state.model?.url ?? state.glbUrl;
        if (modelUrlFromStateRef.current !== newUrl) {
          setModelUrl(newUrl);
          setShowTexture(true);
          setIsModelHeightCalculated(false);
          modelUrlFromStateRef.current = newUrl;
          if (!modelOffsetYSetByAnalysisRef.current) {
            setModelOffsetY(0);
          }
        }
      }
      return;
    }

    if (state?.model?.url || state?.glbUrl) {
      const newUrl = state.model?.url ?? state.glbUrl;
      if (modelUrlFromStateRef.current !== newUrl) {
        if (modelUrl !== newUrl) {
          setModelUrl(newUrl);
          setShowTexture(true);
          setIsModelHeightCalculated(false);
          if (!modelOffsetYSetByAnalysisRef.current) {
            setModelOffsetY(0);
          }
        }
        modelUrlFromStateRef.current = newUrl;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, normalizeOrder]);

  useEffect(() => {
    // сбрасываем промт только если он был установлен из previewData
    if (promptFromPreviewRef.current) {
      setCurrentPrompt(undefined);
      promptFromPreviewRef.current = false;
    }
  }, [activePreviewId]);

  // обновляем промт из preview при переключении моделей
  useEffect(() => {
    if (activePreviewId && previewData?.getPreviewById) {
      if (previewData.getPreviewById.id === activePreviewId) {
        if (previewData.getPreviewById.prompt) {
          setCurrentPrompt(previewData.getPreviewById.prompt);
          promptFromPreviewRef.current = true;
        } else {
          setCurrentPrompt(undefined);
          promptFromPreviewRef.current = true;
        }
      } else {
        console.log(
          '[DEBUG] Skipping prompt update - preview ID mismatch:',
          previewData.getPreviewById.id,
          'vs',
          activePreviewId,
        );
      }
    }
  }, [activePreviewId, previewData]);

  // после выбора превью меш уже может быть готов
  useEffect(() => {
    if (!meshFromSubscription || !activePreviewId || activeOrder === null) return;

    if (meshFromSubscription.status === GenerationStatus.Ready) {
      loadModelFromMesh(meshFromSubscription, activePreviewId, activeOrder);
    } else if (meshFromSubscription.status === GenerationStatus.Pending) {
      setIsMeshLoading(true);
      setLoadingStatus(meshFromSubscription.status);
      meshFromSubscription.readyEstimationSeconds &&
        handleEstimationUpdate(meshFromSubscription.readyEstimationSeconds);
    }
  }, [meshFromSubscription, activePreviewId, activeOrder, handleEstimationUpdate, loadModelFromMesh]);
  
  useEffect(() => {
    if (!modelInfo) return;
    if (!activePreviewId || activeOrder === null) {
      setIsMeshLoading(false);
      return;
    }

    // обновляем промт из modelInfo только если он относится к текущему activePreviewId
    if (modelInfo.previewPrompt && !promptFromPreviewRef.current) {
      const modelPreviewId = (modelInfo as { image?: { preview?: { id?: string } } }).image?.preview?.id;
      if (!modelPreviewId || modelPreviewId === activePreviewId) {
        setCurrentPrompt(modelInfo.previewPrompt);
      }
    }

    // сбрасываем pickedPreviewModel если модель загрузилась не из каталога
    if (!isFromCatalog && pickedPreviewModel) {
      setPickedPreviewModel(null);
    }

    if (modelInfo.status === GenerationStatus.Cancelled || modelInfo.status === GenerationStatus.CancelledValidation) {
      setIsMeshLoading(false);

      const isCensored = isCensorError(modelInfo);

      if (isCensored) {
        if (previousModelUrlRef.current) {
          setModelUrl(previousModelUrlRef.current);
          previousModelUrlRef.current = undefined;
        }
        // notification.error({
        //   message: 'Сработал фильтр цензуры',
        //   description: 'Попробуйте перефразировать Ваш запрос или пришлите другое изображение',
        //   duration: 8,
        // });
        //TODO: add censor popup
        checkAndNotify({ censored: isCensored, status: modelInfo.status, previewId: activePreviewId });
      } else {
        notification.error({
          message: t.generationCancelled,
          description: modelInfo.errorMessage || t.generationCancelledDesc,
          duration: 8,
        });
      }

      return;
    }

    if (modelInfo.status !== GenerationStatus.Ready) {
      setIsMeshLoading(true);
      setLoadingStatus(modelInfo.status);
      if (modelInfo.status === GenerationStatus.Pending && modelInfo.readyEstimationSeconds) {
        handleEstimationUpdate(modelInfo.readyEstimationSeconds);
      }
      return;
    }

    const glb = modelInfo.meshFormats?.find((f) => f.format?.name === 'glb');
    if (glb?.url) {
      loadModelFromMesh(modelInfo, activePreviewId, activeOrder);
    } else {
      const isSwitchingModel = lastSetModelUrlRef.current.previewId === null;
      const hasModelUrl = !!modelUrl;

      if (!isSwitchingModel && hasModelUrl) {
        setIsMeshLoading(false);
        notification.warning({
          message: t.glbNotFound,
          description: t.glbNotFoundDesc,
        });
      } else {
        setIsMeshLoading(true);
      }
    }
  }, [modelInfo, activePreviewId, activeOrder, modelUrl, isFromCatalog, pickedPreviewModel, handleEstimationUpdate, loadModelFromMesh, isCensorError, checkAndNotify]);

  useEffect(() => {
    if (!activeMesh) return;
    if (!activeMesh.createLod) {
      setAvailableLodLevels([]);
      setActiveLodLevel(0);
    }
  }, [activeMesh]);

  const onSceneRendered = useCallback(() => {
    setIsMeshLoading(false);
    setAutoRotate(false);
  }, []);

  useEffect(() => {
    let raf = 0;
    let last = 0;
    const interval = 1000 / 10;
    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (!modelGroupRef.current) return;
      if (t - last < interval) return;
      last = t;
      const g = modelGroupRef.current;
      setModelCenter([g.position.x, g.position.y - modelOffsetY, g.position.z]);
      setModelRotation([g.rotation.x, g.rotation.y, g.rotation.z]);
      const box = new THREE.Box3().setFromObject(g);
      if (!box.isEmpty()) {
        const v = new THREE.Vector3();
        box.getSize(v);
        setModelSize([v.x, v.y, v.z]);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [modelOffsetY]);

  const hdriHandler = useCallback(
    (index: number) => {
      setActiveHdriIndex(index);
      setHdrMap(index);
    },
    [setHdrMap],
  );
  const toggleHdriMenu = useCallback(() => setHdriMenuOpen((o) => !o), []);
  const toggleTexture = useCallback(() => setShowTexture(!isShowTexture), [isShowTexture, setShowTexture]);
  const toggleMesh = useCallback(() => setShowMesh(!showMesh), [showMesh, setShowMesh]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const isTyping = !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
      if (isTyping) return;
      if (e.key === 'Escape') {
        window.dispatchEvent(new Event('commit-transform'));
        setTransformMode(undefined);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // определяем режим 3д печати по полигонам текущей модели
  const is3DPrintMode = useMemo(() => {
    const pickedFaces = pickedPreviewModel?.numTargetFaces;

    // 1. Приоритет: выбранная модель из истории/каталога
    // если pickedPreviewModel установлен, используем его данные
    if (pickedPreviewModel !== null) {
      if (pickedFaces !== undefined && pickedFaces !== null) {
        return pickedFaces === 1000000;
      }
      return false;
    }

    // 2. Текущие данные модели приоритет у meshFromSubscription
    const currentFaces = meshFromSubscription?.numTargetFaces;
    if (currentFaces !== undefined) {
      return currentFaces === 1000000;
    }

    // 3. данные превью
    const previewFaces = previewData?.getPreviewById?.numTargetFaces;
    if (previewFaces !== undefined && previewFaces !== 1000000) return false;
    if (previewFaces === 1000000) return true;

    // 4. fallback к modelInfo
    const modelInfoPreviewId = (modelInfo as { image?: { preview?: { id?: string } } })?.image?.preview?.id;
    const isModelInfoRelevant = !activePreviewId || !modelInfoPreviewId || modelInfoPreviewId === activePreviewId;

    if (isModelInfoRelevant && modelInfo?.numTargetFaces === 1000000) return true;

    // 5. если перешли с флагом is3DPrintMode, но полигонов еще нет, считаем что это 3D
    if (state?.is3DPrintMode) {
      const hasMeshFaces = meshFromSubscription?.numTargetFaces !== undefined;
      const hasPreviewFaces = previewData?.getPreviewById?.numTargetFaces !== undefined;
      const hasModelInfoFaces = isModelInfoRelevant && modelInfo?.numTargetFaces !== undefined;
      const hasAnyReliableData = hasMeshFaces || hasPreviewFaces || hasModelInfoFaces;

      if (hasAnyReliableData) return false;

      // Если данных нет, верим флагу из стейта пока данные грузятся
      return true;
    }

    return false;
  }, [
    pickedPreviewModel,
    meshFromSubscription?.numTargetFaces,
    previewData?.getPreviewById?.numTargetFaces,
    state?.is3DPrintMode,
    activePreviewId,
    modelInfo,
  ]);

  // для моделей 3D печати ставим правильный hdri
  useEffect(() => {
    const hdriIndex = is3DPrintMode ? 2 : 0;
    setActiveHdriIndex(hdriIndex);
    setHdrMap(hdriIndex);
  }, [is3DPrintMode, setHdrMap]);

  // получаем createLod из activeMesh или из previewData
  const createLodFromMesh = activeMesh?.createLod;
  const createLodFromPreview = previewData?.getPreviewById?.createLod;
  const createLod = createLodFromMesh ?? createLodFromPreview;

  const hasLodFormat = typeof createLod === 'number' && createLod > 0;
  const createLodValue = typeof createLod === 'number' ? createLod : 0;

  const lodLevelsForSidebar = useMemo(() => {
    if (!hasLodFormat) return [];

    if (availableLodLevels.length > 0) {
      // уровни из GLB
      return Array.from(new Set(availableLodLevels)).sort((a, b) => a - b);
    }

    // уровни от 0 до createLod
    const generatedLevels: number[] = [];
    for (let i = 0; i <= createLodValue; i++) {
      generatedLevels.push(i);
    }
    return generatedLevels;
  }, [hasLodFormat, availableLodLevels, createLodValue]);

  const showLodSelector = hasLodFormat && lodLevelsForSidebar.length > 0;
  const effectiveLodLevel = showLodSelector ? activeLodLevel : undefined;

  // Определяем топологию модели
  const topology = useMemo(() => {
    const doQuadrification = previewData?.getPreviewById?.doQuadrification;

    if (doQuadrification !== undefined && doQuadrification !== null) {
      return doQuadrification ? t.quads : t.triangles;
    }

    return t.triangles;
  }, [previewData?.getPreviewById?.doQuadrification]);

  // Получаем URL превью картинки для редактирования модели (image + prompt)
  const currentPreviewImageUrl = useMemo(() => {
  const images = previewData?.getPreviewById?.images;
  if (!images || images.length === 0) return undefined;

  // Ищем PNG превью (order=100) или серую картинку (order 0-3)
  const pngImage = images.find((img) => img.order ===
  100 && img.url);
  if (pngImage?.url) return pngImage.url;

  // Fallback на первую серую картинку
  const grayImage = images.find((img) => img.order >= 0 && img.order <= 3 && img.url);
  return grayImage?.url;
  }, [previewData?.getPreviewById?.images]);

  const gradientMode = useMemo<'standard' | 'gamedev' | '3dprint'>(() => {
    if (is3DPrintMode) return '3dprint';
    if (state?.showPreviewModal) return 'gamedev';
    return 'standard';
  }, [is3DPrintMode, state?.showPreviewModal]);

  const isGameDevMode = useMemo(() => {
    return !!state?.isGameDevMode || !!state?.showPreviewModal;
  }, [state?.isGameDevMode, state?.showPreviewModal]);

  return (
    <div className={styles.wrapper} data-theme={theme}>
      <BackgroundGradients mode={gradientMode} />
      <header className={styles.header} data-theme={theme}>
        <div className={styles.headerLeft}>
          <BackButton theme={theme} className={styles.backButton} />
        </div>

        <div className={styles.headerCenter}>
          <button className={styles.logoButton} onClick={() => navigate('/')}>
            <img src={theme === 'dark' ? LogoLightImg : LogoDarkImg} alt="Kandinsky 3D" className={styles.logoIcon} />
          </button>
        </div>

        <div className={styles.headerRight}>
          <ThemeToggle
            isChecked={theme === 'dark'}
            handleChange={toggleTheme}
            theme={theme}
            className={styles.themeToggle}
          />
        </div>
      </header>

      <div className={styles.mainArea} data-theme={theme}>
        <LeftSidebar
          className={styles.sidebarLeft}
          onPickVariant={handlePickVariant}
          isMeshLoading={isMeshLoading}
          currentPrompt={currentPrompt}
          initialPreviewId={state?.showPreviewModal ? state.previewId : undefined}
          autoOpenModal={state?.showPreviewModal && previewNum > 1 && isPreviewReadyForModal}
          numTargetFaces={
            pickedPreviewModel?.numTargetFaces ??
            previewData?.getPreviewById?.numTargetFaces ??
            meshFromSubscription?.numTargetFaces ??
            modelInfo?.numTargetFaces ??
            undefined
          }
          topology={topology}
          is3DPrintMode={is3DPrintMode}
          currentPreviewImageUrl={currentPreviewImageUrl}
        />
        <main className={styles.content} data-theme={theme}>
          <div className={classNames(styles.canvasRoot, inIframe && styles.canvasRootIframe)}>
            <IframeScrollPanels enabled={inIframe} />
            {(isMeshLoading || isPreviewLoading) && (
              <div className={styles.canvasOverlay} data-theme={theme}>
                {/* {state?.skipPreview || state?.isGameDevMode ? (
                  // Показываем облако точек вместо анимации */}
                <>
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                    }}
                  >
                    <PointCloudCanvas cameraDistance={4.1} />
                  </div>
                  <div className={styles.loadingCard}>
                    {/* <IconRotator /> */}
                    <div className={styles.loadingText}>
                      {(loadingStatus === GenerationStatus.Validation ||
                        loadingStatus === GenerationStatus.Pending) && (
                        <GenerationProgress
                          estimationSeconds={estimationSeconds}
                          initialEstimationSeconds={initialEstimationSeconds}
                          estimationTimestamp={estimationTimestamp}
                        />
                      )}
                    </div>
                  </div>
                </>
              </div>
            )}
            <Scene
              key={sceneKey}
              isCameraOn={isCameraOn}
              autoRotate={autoRotate}
              modelUrl={modelUrl ? `${modelUrl}${modelUrl.includes('?') ? '&' : '?'}context=editor` : undefined}
              isMobile={isMobile}
              modelGroupRef={modelGroupRef}
              controlsRef={controlsRef}
              webglCanvasRef={webglCanvasRef}
              videoElRef={videoElRef}
              onAnalyze={handleAnalyze}
              onRenderError={handleRenderError}
              onRendered={onSceneRendered}
              exposure={exposure}
              showGrid={true}
              noCanvasOffset={true}
              modelOffsetY={modelOffsetY}
              showThickAxes={true}
              transformMode={transformMode}
              transformSpace={'world'}
              isModelReady={!!modelUrl}
              lodLevel={effectiveLodLevel}
              onLodLevelsDetected={handleLodLevelsDetected}
              onPolygonCountChange={(count) => {
                setPolygonCount(count);
              }}
              modelInfo={meshFromSubscription ?? modelInfo ?? null}
              doQuadrification={topology === t.quads}
              isGameDevMode={isGameDevMode}
            />
            <BottomBar data-theme={theme}>
              <ControlsGroup>
                <Tooltip title={t.scaleByAxis} placement="top">
                  <ToolBtn
                    type="text"
                    shape="circle"
                    size="small"
                    aria-label={t.scaleByAxis}
                    title={t.scaleByAxis}
                    $active={transformMode === 'scale'}
                    icon={<TransformTranslateIcon theme={theme} active={transformMode === 'scale'} />}
                    onClick={() => {
                      setTransformMode((m) => (m === 'scale' ? undefined : 'scale'));
                    }}
                  />
                </Tooltip>
                <Tooltip title={t.move} placement="top">
                  <ToolBtn
                    type="text"
                    shape="circle"
                    size="small"
                    aria-label={t.move}
                    title={t.move}
                    $active={transformMode === 'translate'}
                    icon={<TransformScaleIcon theme={theme} active={transformMode === 'translate'} />}
                    onClick={() => {
                      setTransformMode((m) => {
                        if (m === 'translate') {
                          return undefined;
                        }
                        return 'translate';
                      });
                    }}
                  />
                </Tooltip>
                <Tooltip title={t.rotate} placement="top">
                  <ToolBtn
                    type="text"
                    shape="circle"
                    size="small"
                    aria-label={t.rotate}
                    title={t.rotate}
                    $active={transformMode === 'rotate'}
                    icon={<TransformRotateIcon theme={theme} active={transformMode === 'rotate'} />}
                    onClick={() => {
                      setTransformMode((m) => {
                        if (m === 'rotate') {
                          return undefined;
                        }
                        return 'rotate';
                      });
                    }}
                  />
                </Tooltip>
              </ControlsGroup>
            </BottomBar>
            <ModelInfoBlock data-theme={theme}>
              <ModelInfoLine>{t.topologyLabel}: {topology}</ModelInfoLine>
              <ModelInfoLine>
                {t.polygonsLabel}: {polygonCount !== undefined ? polygonCount.toLocaleString() : '0'}
              </ModelInfoLine>
            </ModelInfoBlock>
            <LegendWrap>
              <LegendImage src="/img/rectangle-22.svg" alt={t.legendAlt} width={90} height={90} draggable={false} />
            </LegendWrap>
          </div>
        </main>
        <RightSidebar
          className={styles.sidebarRight}
          theme={theme}
          showMesh={showMesh}
          onToggleMesh={toggleMesh}
          modelInfo={meshFromSubscription ?? modelInfo ?? null}
          position={modelCenter}
          rotation={modelRotation}
          size={modelSize}
          activeHdriIndex={activeHdriIndex}
          hdriMenuOpen={hdriMenuOpen}
          onToggleHdriMenu={toggleHdriMenu}
          onSelectHdri={hdriHandler}
          isShowTexture={isShowTexture}
          onToggleTexture={toggleTexture}
          onPickFromCatalog={handlePickVariant}
          is3DPrintMode={is3DPrintMode}
          lodLevels={lodLevelsForSidebar}
          activeLodLevel={activeLodLevel}
          onLodLevelChange={setActiveLodLevel}
          hasLod={showLodSelector}
          currentPrompt={currentPrompt}
          isMeshLoading={isMeshLoading}
        />
      </div>
    </div>
  );
};

export default EditorPage;

const BottomBar = styled.div`
  position: absolute;
  left: 50%;
  bottom: 12px;
  transform: translateX(-50%);
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 10px;
  pointer-events: none;
  --icon-line: #0e0e0e;
  --controls-bg: rgba(0, 0, 0, 0.35);
  --controls-border: rgba(255, 255, 255, 0.12);
  &[data-theme='dark'] {
    --icon-line: #fff;
    --controls-bg: rgba(0, 0, 0, 0.35);
    --controls-border: rgba(255, 255, 255, 0.12);
  }
  &[data-theme='light'] {
    --icon-line: #0e0e0e;
    --controls-bg: rgba(255, 255, 255, 0.65);
    --controls-border: rgba(8, 8, 8, 0.18);
  }
  @media (prefers-color-scheme: dark) {
    --icon-line: #fff;
  }
`;

const ControlsGroup = styled.div`
  display: inline-flex;
  gap: 12px;
  padding: 6px;
  background: var(--controls-bg);
  border: 1px solid var(--controls-border);
  border-radius: 20px;
  pointer-events: auto;
  backdrop-filter: blur(4px);
  color: var(--icon-line);
`;

const ToolBtn = styled(Button)<{ $active?: boolean }>`
  width: 32px !important;
  height: 32px !important;
  border-radius: 50% !important;
  padding: 0 !important;
  line-height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  border: none !important;
  background: ${({ $active }) => ($active ? 'rgba(255, 255, 255, 0.20)' : 'transparent')} !important;
  color: inherit;

  &:hover {
    background: rgba(255, 255, 255, 0.16) !important;
  }

  .ant-btn-icon {
    margin: 0 !important;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }

  svg {
    width: 18px;
    height: 18px;
    display: block;
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px rgba(64, 128, 255, 0.35) !important;
  }
`;

const LegendImage = styled.img`
  width: 90px;
  height: 90px;
  display: block;
  pointer-events: none;
  user-select: none;
`;

const ModelInfoBlock = styled.div`
  position: absolute;
  right: 412px;
  bottom: 12px;
  z-index: 3;
  pointer-events: none;
  padding: 8px 12px;
  background: transparent;
  border: 1px solid var(--controls-border);
  border-radius: 8px;
  color: var(--icon-line);
  font-size: 13px;
  line-height: 1.5;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 160px;
`;

const ModelInfoLine = styled.div`
  white-space: nowrap;
`;

const LegendWrap = styled.div`
  position: absolute;
  right: 312px;
  bottom: 12px;
  z-index: 3;
  pointer-events: none;
`;
