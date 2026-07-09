import { useNavigate, useParams } from 'react-router-dom';
import { PreviewBlock } from '../preview-block';
import { ModelViewer } from '../model-viewer';
import styled from 'styled-components';
import { Button } from 'antd';
import { useTheme, useLocale } from '../../context';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  useGetPreviewByIdQuery,
  useOnPreviewStatusChangedSubscription,
  useGeneratePreviewMutation,
  GenerationStatus,
  GetGeneratedPreviewsQuery,
  MeshModels,
  FrontGenerationType,
} from '../../graphql/graphQlApiHooks.ts';
import styles from './Preview.module.css';
import { getSessionToken } from '../../utils/session.ts';
import { useErrorNotification } from './useNotificationError.ts';

interface GraphQLError {
  message: string;
  extensions?: { code: string };
}
interface GraphQLErrorResponse {
  graphQLErrors: GraphQLError[];
}

type PreviewType = GetGeneratedPreviewsQuery['getGeneratedPreviews']['data'][0];

export const Preview = () => {
  const { id } = useParams<{ id: string }>();
  const { theme } = useTheme();
  const { t } = useLocale();
  const navigate = useNavigate();
  const [previews, setPreviews] = useState<PreviewType | undefined>(undefined);
  const [isLoaded, setIsLoaded] = useState(false);

  const isLoading = useMemo(() => {
    return previews?.status === GenerationStatus.Pending || previews?.status === GenerationStatus.Validation;
  }, [previews]);

  const hasMeshRequests = useMemo(() => {
    return (
      previews?.images?.some(
        (img) => img.order < 100 && Array.isArray(img.meshRequests) && img.meshRequests.length > 0,
      ) ?? false
    );
  }, [previews]);

  // чтобы убрать мелькание
  useEffect(() => {
    if (previews) setIsLoaded(true);
  }, [previews]);

  const { checkAndNotify } = useErrorNotification();

  useEffect(() => {
    // сбрасывать ручные запросы статуса при смене preview
    attemptsRef.current = 0;
  }, [id]);

  const {
    data: queryData,
    error: queryError,
    refetch,
  } = useGetPreviewByIdQuery({
    variables: { id: id || '' },
    skip: !id,
  });

  const { data: subscriptionData, error: subscriptionError } = useOnPreviewStatusChangedSubscription({
    variables: { id: id || '' },
    skip: !id,
  });

  // отслеживаем подписку
  useEffect(() => {
    const ev = subscriptionData?.previewStatusChanged;
    if (!ev) return;
    // Обновляем state только если данные действительно изменились
    setPreviews((prev) => {
      // Если нет предыдущих данных, обновляем
      if (!prev) {
        return ev;
      }
      // Проверяем изменился ли статус или количество изображений
      const statusChanged = prev.status !== ev.status;
      const imagesCountChanged = (prev.images?.length || 0) !== (ev.images?.length || 0);

      // Если ничего не изменилось, не обновляем state
      if (!statusChanged && !imagesCountChanged) {
        return prev;
      }

      return ev;
    });
    checkAndNotify({ censored: ev.censored, status: ev.status, previewId: ev.id });

    // Если статус стал READY но нет images, делаем refetch
    if (ev.status === GenerationStatus.Ready && (!ev.images || ev.images.length === 0)) {
      refetch();
    }
  }, [subscriptionData, navigate, checkAndNotify, refetch]);

  // количество сделанных попыток ручных запросов за статусом
  const attemptsRef = useRef(0);
  const intervalIdRef = useRef<number>();

  // рассчитывает время задержки повторных запросов в зависимости от времени генерации
  const getDelay = useCallback((startTime: number) => {
    // сколько прошло времени от начала (в секундах)
    const totalTimeSec = (Date.now() - startTime) / 1000;
    // если прошло больше 30секунд, то запрашиваем каждые 5 секунд
    if (totalTimeSec > 30) {
      return 5 * 1000;
    }
    return 10 * 1000;
  }, []);

  type ScheduleFunctionParams = {
    maxAttempts: number;
    startTime: number;
    attemptsRef: React.MutableRefObject<number>;
    previews: PreviewType | undefined;
    subscriptionError: unknown;
    refetch: () => void;
  };

  const scheduleNext = useCallback(
    ({ maxAttempts, startTime, previews, subscriptionError, refetch }: ScheduleFunctionParams) => {
      // очищаем старый таймер
      clearTimeout(intervalIdRef.current);
      const delay = getDelay(startTime);
      intervalIdRef.current = window.setTimeout(() => {
        if (attemptsRef.current < maxAttempts && (previews?.status === GenerationStatus.Pending || subscriptionError)) {
          refetch();
          attemptsRef.current++;
          scheduleNext({
            maxAttempts,
            startTime,
            attemptsRef,
            previews,
            subscriptionError,
            refetch,
          });
        }
      }, delay);
    },
    [getDelay],
  );

  useEffect(() => {
    if (previews?.status === GenerationStatus.Pending || subscriptionError) {
      attemptsRef.current = 0;
      // кол-во повторных запросов статуса в ручном режиме (5 * 24 = 120 секунд, около 2 минут)
      const maxAttempts = 24;
      const startTime = Date.now();

      if (previews?.status === GenerationStatus.Pending || subscriptionError) {
        scheduleNext({
          maxAttempts,
          startTime,
          attemptsRef,
          previews,
          subscriptionError,
          refetch,
        });
      }

      return () => clearTimeout(intervalIdRef.current);
    }
  }, [previews?.status, subscriptionError, refetch, previews, scheduleNext]);

  const [generatePreviewMutation] = useGeneratePreviewMutation();

  useEffect(() => {
    if (queryData?.getPreviewById) {
      setPreviews(queryData.getPreviewById);
    }

    if (queryError) {
      const graphQLError = queryError.graphQLErrors?.[0];
      if (graphQLError?.extensions?.code === 'NOT_FOUND') {
        console.warn('Preview not found');
        navigate('/404');
      } else {
        console.error('GraphQL Error:', graphQLError?.message);
        navigate('/404');
      }
    }
  }, [queryData, queryError, navigate]);

  useEffect(() => {
    if (id) refetch();
  }, [id, refetch]);

  useEffect(() => {
    if (
      hasMeshRequests &&
      previews &&
      previews.status === GenerationStatus.Ready &&
      previews.images &&
      previews.images.length > 0
    ) {
      const modelNameLower = previews.modelName?.toLowerCase() || '';
      const isDirectGeneration =
        previews.modelName === MeshModels.Xr_3D ||
        previews.modelName === MeshModels.TextToGeometry ||
        previews.modelName === MeshModels.ImageToGeometry ||
        modelNameLower.includes('xr:3d') ||
        modelNameLower.includes('xr:3d_preview') ||
        modelNameLower.includes('xr:3d_mesh') ||
        modelNameLower.includes('text-to-geometry') ||
        modelNameLower.includes('image-to-geometry');

      if (isDirectGeneration) {
        const imagesWithReadyMesh = previews.images.filter(
          (img) =>
            img.order < 100 &&
            img.meshRequests?.some((mesh) => mesh.status === GenerationStatus.Ready),
        );
        
        if (imagesWithReadyMesh.length === 1) {
          navigate(`/${previews.id}/${imagesWithReadyMesh[0].order}`);
          return;
        }
      }
    }
  }, [hasMeshRequests, navigate, previews]);

  const doGenerate = async () => {
    try {
      const sessionToken = getSessionToken() || '';
      const modelName = previews?.modelName;
      const mode = modelName && Object.values(MeshModels).includes(modelName as MeshModels)
        ? (modelName as MeshModels)
        : MeshModels.Xr_3D;
      const { data } = await generatePreviewMutation({
        variables: {
          input: {
            prompt: previews?.prompt || '',
            token: 'token',
            sessionToken,
            mode,
            generationType: FrontGenerationType.Standard,
          },
        },
      });

      if (data?.generatePreview) {
        navigate(`/${data.generatePreview.id}`);
      }
    } catch (error) {
      console.error(error);

      const err = error as unknown as GraphQLErrorResponse;
      if (err.graphQLErrors) {
        err.graphQLErrors.forEach((e: GraphQLError) => {
          console.error('GraphQL Error:', e.message, e.extensions);
        });
      }
    }
  };

  const startGeneratePreview = async () => {
    await doGenerate();
  };

  const hasImages = !!previews && Array.isArray(previews.images) && previews.images.length > 0;

  const isError = !!subscriptionError || !!queryError;
  // если уже генерация завершилась но картинок нет
  const isTimeout = !isLoading && !hasImages;

  // Заглушка для fetchOrGenerateMesh - не нужна пока генерируются превью
  const dummyFetchOrGenerateMesh = useCallback(async () => {}, []);

  return (
    <>
      {isLoading ? (
        // Показываем ModelViewer с PointCloudFBX2 пока генерируются превью
        <ModelViewer
          modelInfo={null}
          preview={previews ?? null}
          sourceImageIndex={null}
          fetchOrGenerateMesh={dummyFetchOrGenerateMesh}
          showPointCloud={true}
          hideControls={true}
        />
      ) : hasImages ? (
        // картинки есть
        <PreviewBlock model={previews} loading={isLoading} showGrid={true}>
          <div className={styles.buttonWrapper}>
            <ReGenerateButton onClick={startGeneratePreview} loading={isLoading} size="large" theme={theme}>
              {t.regenerate}
            </ReGenerateButton>
          </div>
        </PreviewBlock>
      ) : (
        // картинонк нет (скорее всего сетевая проблема)
        isLoaded && (
          <div className={styles.noPreview}>
            <div>
              {isTimeout
                ? t.errorLoadImages
                : isError
                ? t.errorServerConnection
                : t.errorGetGenerationResult}
            </div>
            <div className={styles.buttonWrapper}>
              <Button onClick={startGeneratePreview}>{t.regenerate}</Button>
              <Button style={{ marginLeft: 8 }} onClick={() => window.location.reload()}>
                {t.reloadPage}
              </Button>
            </div>
          </div>
        )
      )}
    </>
  );
};

const ReGenerateButton = styled(Button)<{ theme: 'light' | 'dark' }>`
  font-weight: 600;
  width: auto;
  padding: 7px 15px;
  border: none;
  box-shadow: none;
  background-color: ${({ theme }) => (theme === 'dark' ? '#fff' : '#080808')} !important;
  color: ${({ theme }) => (theme === 'dark' ? 'black' : 'white')} !important;

  &:hover,
  &:focus,
  &:active {
    background-color: #1a1a1a !important;
    color: white !important;
  }
`;
