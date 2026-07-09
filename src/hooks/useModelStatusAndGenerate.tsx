import { useCallback, useEffect, useState } from 'react';
import {
  useGenerateMeshMutation,
  useGetMeshByIdLazyQuery,
  useOnMeshStatusChangedSubscription,
  MeshRequestEntity,
  GenerationStatus,
} from '../graphql/graphQlApiHooks.ts';
import { useIframeToken } from './useIframeToken';
import { useInIframe } from './useInIframe';
import { notification } from 'antd';
import { useLocale } from '../context';

type GraphQLError = {
  message?: string;
  extensions?: {
    code?: string;
  };
};

type ErrorWithGraphQL = {
  graphQLErrors?: GraphQLError[];
  networkError?: Error | { message?: string; name?: string };
  message?: string;
};

type MeshError = Error | ErrorWithGraphQL | { message?: string };

export const validateAndParseIndex = (index: string | undefined): number | null => {
  if (index === undefined) {
    return null;
  }
  const VALID_ORDERS = [0, 1, 2, 3, 100, 101];
  const indexNumber = parseInt(index, 10);
  if (isNaN(indexNumber)) {
    console.error(`Индекс NaN. Ожидаемые индексы (0,1,2,3,100,101), получили "${index}"`);
    return null;
  }

  if (!VALID_ORDERS.includes(indexNumber)) {
    console.error(`Невалидный индекс, ожидаемые значения(0, 1, 2, 3, 100, 101). Получили: ${indexNumber}`);
    return null;
  }
  return indexNumber;
};

export const useModelStatusAndGenerate = (previewId: string | undefined, index?: string | undefined) => {
  const [modelInfo, setModelInfo] = useState<MeshRequestEntity | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [meshRequestId, setMeshRequestId] = useState<string | null>(null);
  const [subscriptionErrorNotified, setSubscriptionErrorNotified] = useState(false);

  useEffect(() => {
    setModelInfo(null);
    setMeshRequestId(null);
    setIsLoading(false);
    setSubscriptionErrorNotified(false);
  }, [previewId, index]);

  const [generateMeshMutation] = useGenerateMeshMutation();
  const [fetchMeshById, { loading: meshLoading, error: meshError }] = useGetMeshByIdLazyQuery();
  const { t } = useLocale();

  const iframeToken = useIframeToken();
  const inIframe = useInIframe();

  const handleGenerateMeshError = useCallback((error: MeshError) => {
    const errorWithGraphQL = error as ErrorWithGraphQL;
    const networkError = errorWithGraphQL?.networkError;
    const networkErrorMessage = networkError instanceof Error ? networkError.message : networkError?.message;

    const errorMessage =
      networkErrorMessage ||
      errorWithGraphQL?.graphQLErrors?.[0]?.message ||
      (error instanceof Error ? error.message : error?.message) ||
      t.errorStartModelGeneration;

    const isImageNotReady =
      errorMessage.toLowerCase().includes('not found') ||
      errorMessage.toLowerCase().includes('not ready') ||
      errorMessage.toLowerCase().includes('may not be ready');

    const isInvalidQueryId =
      errorMessage.toLowerCase().includes('invalid query_id') ||
      errorMessage.toLowerCase().includes('invalid queryid') ||
      errorMessage.toLowerCase().includes('bad source query');

    const isNetworkError =
      !!networkError ||
      errorMessage.toLowerCase().includes('timeout') ||
      errorMessage.toLowerCase().includes('etimedout') ||
      errorMessage.toLowerCase().includes('failed') ||
      errorMessage.toLowerCase().includes('network');

    notification.error({
      message: t.errorStartModelGeneration,
      description: isInvalidQueryId
        ? t.errorPreviewGeneration
        : isImageNotReady
        ? t.errorImageNotReady
        : isNetworkError
        ? t.networkError
        : errorMessage,
      duration: 8,
    });
  }, [t]);

  const { data: subscriptionData, error: subscriptionError } = useOnMeshStatusChangedSubscription({
    variables: { id: meshRequestId || '' },
    skip: !meshRequestId,
  });

  useEffect(() => {
    const newStatus = subscriptionData?.meshStatusChanged;
    if (newStatus) {
      setModelInfo((prev) => {
        if (newStatus.status !== prev?.status) {
          return newStatus as MeshRequestEntity;
        }
        if (
          newStatus.status === GenerationStatus.Pending &&
          newStatus.readyEstimationSeconds !== prev?.readyEstimationSeconds
        ) {
          return newStatus as MeshRequestEntity;
        }
        return prev;
      });
    }
  }, [subscriptionData]);

  // обработка сетевых ошибок и timeout
  useEffect(() => {
    if (subscriptionError && !subscriptionErrorNotified) {
      console.error('Subscription error:', subscriptionError);
      handleGenerateMeshError(subscriptionError as MeshError);
      setSubscriptionErrorNotified(true);
    }
  }, [subscriptionError, subscriptionErrorNotified, handleGenerateMeshError]);

  // сбрасываем флаг уведомления при смене meshRequestId
  useEffect(() => {
    setSubscriptionErrorNotified(false);
  }, [meshRequestId]);

  const fetchOrGenerateMesh = useCallback(
    async (sourceImageIndex: number) => {
      if (!previewId) {
        return;
      }
      setIsLoading(true);
      try {
        const { data, error } = await fetchMeshById({
          variables: { id: previewId, sourceImageIndex },
          fetchPolicy: 'network-only',
        });

        if (error) {
          console.error('Error fetching mesh:', error);
          const networkError = error.networkError;
          const networkErrorMessage =
            networkError instanceof Error
              ? networkError.message
              : networkError && typeof networkError === 'object' && 'message' in networkError
              ? (networkError as { message?: string }).message
              : undefined;
          const errorMessage =
            networkErrorMessage || error.graphQLErrors?.[0]?.message || error.message || t.unknownError;
          const isNotFound =
            error.graphQLErrors?.[0]?.extensions?.code === 'NOT_FOUND' ||
            errorMessage.toLowerCase().includes('not found');
          const isNetworkError = !!networkError;

          if (isNetworkError) {
            // сетевые ошибки: показываем уведомление, не создаем mesh
            handleGenerateMeshError(error as MeshError);
            throw error;
          } else if (isNotFound) {
            // если mesh не найден пытаемся создать новый
            try {
              const generateResponse = await generateMeshMutation({
                variables: {
                  input: {
                    previewId,
                    sourceImageIndex,
                    token: inIframe ? iframeToken ?? '' : 'captchaToken',
                  },
                },
              });

              if (generateResponse.data?.generateMesh) {
                const generatedMesh = generateResponse.data.generateMesh;
                setModelInfo(generatedMesh as MeshRequestEntity);
                setMeshRequestId(generatedMesh.id);
                return;
              }
            } catch (generateError: unknown) {
              const errorMessage =
                (generateError as ErrorWithGraphQL)?.graphQLErrors?.[0]?.message ||
                (generateError instanceof Error
                  ? generateError.message
                  : (generateError as { message?: string })?.message) ||
                t.unknownError;
              const isImageNotFound =
                errorMessage.toLowerCase().includes('selected image not found') ||
                errorMessage.toLowerCase().includes('image not found');

              if (isImageNotFound) {
                setImageNotFoundError(true);
              }

              handleGenerateMeshError(generateError as MeshError);
              throw generateError;
            }
          } else {
            notification.error({
              message: t.errorLoadModel,
              description: errorMessage,
              duration: 8,
            });
            throw error;
          }
        }

        if (data?.getMeshById) {
          const existingMesh = data.getMeshById;
          if (existingMesh.status !== GenerationStatus.UnknownQueryId) {
            setModelInfo(existingMesh as MeshRequestEntity);
            setMeshRequestId(existingMesh.id);
            setIsLoading(false);
            return;
          }
        }

        try {
          const generateResponse = await generateMeshMutation({
            variables: {
              input: {
                previewId,
                sourceImageIndex,
                token: inIframe ? iframeToken ?? '' : 'captchaToken',
              },
            },
          });

          if (generateResponse.data?.generateMesh) {
            const generatedMesh = generateResponse.data.generateMesh;
            setModelInfo(generatedMesh as MeshRequestEntity);
            setMeshRequestId(generatedMesh.id);
          } else if (generateResponse.errors) {
            const errorMessage = generateResponse.errors[0]?.message || t.errorStartModelGeneration;
            const isImageNotFound =
              errorMessage.toLowerCase().includes('selected image not found') ||
              errorMessage.toLowerCase().includes('image not found');

            if (isImageNotFound) {
              setImageNotFoundError(true);
            }

            handleGenerateMeshError({ message: errorMessage });
            throw new Error(errorMessage);
          }
        } catch (generateError: unknown) {
          const errorMessage =
            (generateError as ErrorWithGraphQL)?.graphQLErrors?.[0]?.message ||
            (generateError instanceof Error
              ? generateError.message
              : (generateError as { message?: string })?.message) ||
            t.unknownError;
          const isImageNotFound =
            errorMessage.toLowerCase().includes('selected image not found') ||
            errorMessage.toLowerCase().includes('image not found');

          if (isImageNotFound) {
            setImageNotFoundError(true);
          }

          handleGenerateMeshError(generateError as MeshError);
          throw generateError;
        }
      } catch (error: unknown) {
        console.error('Error fetching or generating mesh:', error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [previewId, fetchMeshById, generateMeshMutation, iframeToken, inIframe, handleGenerateMeshError],
  );

  useEffect(() => {
    if (!previewId || index === undefined) return;
    const sourceImageIndex = validateAndParseIndex(index);
    if (sourceImageIndex === null) return;
    fetchOrGenerateMesh(sourceImageIndex);
  }, [previewId, index, generateMeshMutation, fetchMeshById, fetchOrGenerateMesh]);

  const [imageNotFoundError, setImageNotFoundError] = useState(false);

  useEffect(() => {
    // сбрасываем флаг при смене previewId или index
    setImageNotFoundError(false);
  }, [previewId, index]);

  useEffect(() => {
    // не делаем повторные попытки при image not found
    if (imageNotFoundError) return;

    const isPending = modelInfo?.status === GenerationStatus.Pending;
    if (isPending || subscriptionError) {
      let attempts = 0;
      const intervalId = window.setInterval(async () => {
        if (attempts < 2 && previewId && index !== undefined) {
          const sourceImageIndex = validateAndParseIndex(index);
          if (sourceImageIndex !== null) {
            const { data } = await fetchMeshById({
              variables: { id: previewId, sourceImageIndex },
              fetchPolicy: 'network-only',
            });

            if (data?.getMeshById) {
              const mesh = data.getMeshById;
              if (mesh.status === GenerationStatus.Ready) {
                setModelInfo(mesh as MeshRequestEntity);
                clearInterval(intervalId);
              } else {
                setModelInfo((prev) => {
                  if (mesh.status !== prev?.status || mesh.readyEstimationSeconds !== prev?.readyEstimationSeconds) {
                    return mesh as MeshRequestEntity;
                  }
                  return prev;
                });
                console.log('[DEBUG] Mesh still pending, status:', mesh.status);
              }
            }
          }
          attempts++;
        } else {
          clearInterval(intervalId);
        }
      }, 30 * 1000);

      return () => clearInterval(intervalId);
    }
  }, [modelInfo?.status, subscriptionError, fetchMeshById, previewId, index, imageNotFoundError]);

  useEffect(() => {
    if (meshError) {
      console.error('Ошибка запроса mesh:', meshError);

      const errorWithGraphQL = meshError as unknown as ErrorWithGraphQL;
      const errorMessage = meshError.message || errorWithGraphQL?.graphQLErrors?.[0]?.message || t.unknownError;
      const isImageNotFound =
        errorMessage.toLowerCase().includes('selected image not found') ||
        errorMessage.toLowerCase().includes('image not found');

      if (isImageNotFound) {
        setImageNotFoundError(true);
        return;
      }

      // запрашиваем статус еще раз через 5 секунд
      setTimeout(() => {
        if (!previewId || index === undefined || imageNotFoundError) return;
        const sourceImageIndex = validateAndParseIndex(index);
        if (sourceImageIndex === null) return;
        fetchOrGenerateMesh(sourceImageIndex);
      }, 5000);
    }
  }, [meshError, fetchOrGenerateMesh, index, previewId, imageNotFoundError]);

  return { modelInfo, isLoading: isLoading || meshLoading, fetchOrGenerateMesh };
};
