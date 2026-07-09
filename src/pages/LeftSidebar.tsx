import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button, Input, Modal, Typography, Slider, InputNumber, Divider, notification } from 'antd';
import styled from 'styled-components';
import classNames from 'classnames';
import {
  GenerationStatus,
  GetGeneratedPreviewsQuery,
  useGeneratePreviewMutation,
  useGetPreviewByIdQuery,
  useOnPreviewStatusChangedSubscription,
  useOnMeshStatusChangedSubscription,
  MeshRequestEntity,
  MeshModels,
  FrontGenerationType,
} from '../graphql/graphQlApiHooks.ts';
import { useTheme } from '../context/ThemeContext.ts';
import { useLocale } from '../context';
import { getSessionToken } from '../utils/session.ts';
import IconRotator from '../components/icons-rotator/IconsRotator.tsx';
import styles from './LeftSidebar.module.css';
import { BodyS, BodyXS, Select } from '@salutejs/plasma-giga';
import { primary, secondary } from '@salutejs/plasma-tokens';
import { ExpandableText } from '../components/ExpandableText.tsx';

type PreviewType = GetGeneratedPreviewsQuery['getGeneratedPreviews']['data'][0];

type LeftSidebarProps = {
  className?: string;
  onPickVariant: (
    previewId: string,
    order: number,
    prompt?: string,
    meshRequest?: MeshRequestEntity,
    previewModel?: { numTargetFaces?: number | null },
  ) => void;
  isMeshLoading?: boolean;
  currentPrompt?: string;
  initialPreviewId?: string;
  autoOpenModal?: boolean;
  numTargetFaces?: number;
  topology?: string;
  is3DPrintMode?: boolean;
  currentPreviewImageUrl?: string;
};

const { Text } = Typography;

export const LeftSidebar: FC<LeftSidebarProps> = ({
  className,
  onPickVariant,
  isMeshLoading = false,
  currentPrompt,
  initialPreviewId,
  autoOpenModal = false,
  numTargetFaces,
  topology,
  is3DPrintMode = false,
  currentPreviewImageUrl,
}) => {
  const { theme } = useTheme();
  const { t } = useLocale();
  const [prompt, setPrompt] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(initialPreviewId || null);
  const [doQuadrification, setDoQuadrification] = useState<boolean>(false);
  const [polygonCount, setPolygonCount] = useState<number>(40000);
  const [lodCount, setLodCount] = useState<number>(0);
  const [isPolygonSliderOpen, setIsPolygonSliderOpen] = useState<boolean>(false);
  const [isPolygonCountModified, setIsPolygonCountModified] = useState<boolean>(false);
  const [generatePreview] = useGeneratePreviewMutation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showCloseConfirmation, setShowCloseConfirmation] = useState(false);

  // грузим превью когда появится id
  const { data, refetch } = useGetPreviewByIdQuery({
    variables: { id: previewId || '' },
    skip: !previewId,
    fetchPolicy: 'network-only',
  });

  // подтягиваем апдейты состоянием
  const { data: subData, error: subscriptionError } = useOnPreviewStatusChangedSubscription({
    variables: { id: previewId || '' },
    skip: !previewId,
  });

  const [previews, setPreviews] = useState<PreviewType | undefined>(data?.getPreviewById ?? undefined);

  useEffect(() => {
    const ev = subData?.previewStatusChanged;
    if (ev) {
      setPreviews(ev);
    }
  }, [subData]);

  useEffect(() => {
    if (data?.getPreviewById) {
      setPreviews(data.getPreviewById);
    }
  }, [data]);

  const isLoading = useMemo(
    () => previews?.status === GenerationStatus.Pending || previews?.status === GenerationStatus.Validation,
    [previews],
  );

  // Блокируем элементы при генерации preview или меша
  const isGeneratingPreview = isSubmitting || isLoading;
  const isDisabled = isMeshLoading || isGeneratingPreview;

  const attemptsRef = useRef(0);
  const intervalIdRef = useRef<number>();
  const autoOpenedRef = useRef(false); // Флаг, что модалка уже была открыта автоматически

  useEffect(() => {
    if (previewId) {
      setPreviews(undefined); // cбрасываем при смене previewId
      attemptsRef.current = 0; // cбрасываем счетчик попыток
      clearTimeout(intervalIdRef.current);
    }
  }, [previewId]);

  // Автоматическое открытие модалки при переходе из gamedev режима
  useEffect(() => {
    if (autoOpenModal && initialPreviewId && !modalOpen && !autoOpenedRef.current) {
      setPreviewId(initialPreviewId);
      setModalOpen(true);
      setShowCloseConfirmation(false);
      autoOpenedRef.current = true;
    }
  }, [autoOpenModal, initialPreviewId, modalOpen]);

  useEffect(() => {
    setIsCollapsed(modalOpen || isLoading || isMeshLoading);
  }, [isMeshLoading, isLoading, modalOpen]);

  // авто-рефетч на старте модалки
  useEffect(() => {
    if (modalOpen && previewId) {
      refetch();
    }
  }, [modalOpen, previewId, refetch]);

  useEffect(() => {
    if ((previews?.status === GenerationStatus.Pending || subscriptionError) && previewId) {
      attemptsRef.current = 0;
      const maxAttempts = 24;
      const startTime = Date.now();

      const scheduleNext = () => {
        clearTimeout(intervalIdRef.current);
        const totalTimeSec = (Date.now() - startTime) / 1000;
        const delay = totalTimeSec > 30 ? 5 * 1000 : 10 * 1000;

        intervalIdRef.current = window.setTimeout(() => {
          // проверяем актуальное состояние
          if (attemptsRef.current < maxAttempts) {
            refetch();
            attemptsRef.current++;
            scheduleNext();
          }
        }, delay);
      };

      scheduleNext();

      return () => clearTimeout(intervalIdRef.current);
    }
  }, [previews?.status, subscriptionError, previewId, refetch]);

  // Обработка ошибок подписки для превью
  useEffect(() => {
    if (subscriptionError) {
      console.error('Preview subscription error:', subscriptionError);
      const errorObj = subscriptionError as unknown as Record<string, unknown>;
      const networkError = errorObj?.networkError as Error | { message?: string } | undefined;
      const graphQLErrors = errorObj?.graphQLErrors as Array<{ message?: string }> | undefined;
      const networkErrorMessage =
        networkError instanceof Error
          ? networkError.message
          : networkError && typeof networkError === 'object' && 'message' in networkError
          ? (networkError as { message?: string }).message
          : undefined;
      const errorMessage =
        networkErrorMessage ||
        graphQLErrors?.[0]?.message ||
        (errorObj?.message as string | undefined) ||
        t.errorPreviewSubscriptionStatus;
      const isNetworkError =
        !!networkError ||
        errorMessage.toLowerCase().includes('timeout') ||
        errorMessage.toLowerCase().includes('etimedout') ||
        errorMessage.toLowerCase().includes('failed') ||
        errorMessage.toLowerCase().includes('network');

      notification.error({
        message: t.errorPreviewSubscription,
        description: isNetworkError ? t.networkError : errorMessage,
        duration: 8,
      });
    }
  }, [subscriptionError, t]);

  const startTextGeneration = useCallback(async () => {
    if (!prompt.trim()) return;
    setIsSubmitting(true);
    try {
      const sessionToken = getSessionToken() || '';
      const numTargetFacesValue = is3DPrintMode ? 1000000 : polygonCount;

      if (currentPreviewImageUrl) {
        try {
          const imageResponse = await fetch(currentPreviewImageUrl);
          if (!imageResponse.ok) {
            throw new Error(t.errorLoadPreviewImage);
          }

          const imageBlob = await imageResponse.blob();
          const contentType = imageBlob.type || 'image/png';
          const fielExtention = contentType.includes('jpeg') || contentType.includes('jpg')? '.jpg' : contentType.includes('gif') ? '.gif' : '.png'
          const filename = `preview${fielExtention}`;

          const imageFile = new File([imageBlob], filename, {type: contentType})

          const formData = new FormData();
          formData.append('file', imageFile);
          formData.append('sessionToken', sessionToken);
          formData.append('token', 'captchaToken');
          formData.append('prompt', prompt.trim());
          formData.append('doQuadrification', String(doQuadrification));
          formData.append('numTargetFaces', String(numTargetFacesValue));
          formData.append('mode', 'xr:3d');
          formData.append('previewNum', '1');

          if (is3DPrintMode) {formData.append('generationType', 'standard');}

          const apiBaseUrl = import.meta.env.VITE_SERVER_URL || '/api';
          const res = await fetch(`${apiBaseUrl}/upload/image`, {
            method: 'POST',
            body: formData,
          });

          if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || t.errorImageGeneration);
          }

          const responseData = await res.json();
          const id = responseData?.previewId;

          if (id) {
            setPreviewId(id);
            onPickVariant(id, 0, prompt.trim(), undefined, { numTargetFaces: numTargetFacesValue });
          }
          } catch (imageError) {
              console.error('Error with image generation:', imageError);
              notification.error({
                message: t.errorStartGenerationByImage,
                description: imageError instanceof Error ? imageError.message : t.unknownError,
                duration: 8,
              });
          }
        return;
      }

      const mode = is3DPrintMode ? MeshModels.TextToGeometry : MeshModels.Xr_3D;
      const createLodValue = is3DPrintMode ? undefined : lodCount > 0 ? lodCount : undefined;
      const modelFormats = is3DPrintMode ? ['glb', 'stl'] : undefined;

      const generationType = is3DPrintMode ? FrontGenerationType.Print : FrontGenerationType.Standard;

      const { data, errors } = await generatePreview({
        variables: {
          input: {
            prompt: prompt.trim(),
            token: 'captchaToken',
            sessionToken,
            doQuadrification,
            num_target_faces: numTargetFacesValue,
            create_lod: createLodValue,
            mode,
            modelFormats,
            preview_num: 1,
            generationType,
          },
        },
      });

      if (errors) {
        const errorMessage = errors[0]?.message || t.errorStartGenerationPreview;
        const networkError = errors[0]?.extensions?.networkError;
        const isNetworkError =
          !!networkError ||
          errorMessage.toLowerCase().includes('timeout') ||
          errorMessage.toLowerCase().includes('etimedout') ||
          errorMessage.toLowerCase().includes('failed') ||
          errorMessage.toLowerCase().includes('network');

        notification.error({
          message: t.errorStartGeneration,
          description: isNetworkError ? t.networkError : errorMessage,
          duration: 8,
        });
        return;
      }

      const id = data?.generatePreview?.id;
      if (id) {
        setPreviewId(id);
        // const previewNumValue = 1; // previewNum всегда равен 1 при генерации из сайдбара
        // if (is3DPrintMode || previewNumValue === 1) {
        //   // вызываем onPickVariant для загрузки модели: убираем текущую модель со сцены и показываем лоадер
        //   const previewModel = is3DPrintMode ? { numTargetFaces: 1000000 } : { numTargetFaces };
        //   onPickVariant(id, 0, prompt.trim(), undefined, previewModel);
        // } else {
        //   setModalOpen(true);
        //   setShowCloseConfirmation(false);
        // }
        const targetFaces = is3DPrintMode ? 1000000 : numTargetFacesValue;
        onPickVariant(id, 0, prompt.trim(), undefined, { numTargetFaces: targetFaces });
      }
    } catch (error: unknown) {
      console.error('Error generating preview:', error);
      const errorObj = error as unknown as {
        graphQLErrors?: Array<{ message?: string; extensions?: { networkError?: unknown } }>;
        networkError?: Error | { message?: string };
        message?: string;
      };
      const networkError = errorObj?.networkError;
      const networkErrorMessage =
        networkError instanceof Error
          ? networkError.message
          : networkError && typeof networkError === 'object' && 'message' in networkError
          ? (networkError as { message?: string }).message
          : undefined;
      const errorMessage =
        networkErrorMessage ||
        errorObj?.graphQLErrors?.[0]?.message ||
        errorObj?.message ||
        t.errorStartGenerationPreview;
      const isNetworkError =
        !!networkError ||
        errorMessage.toLowerCase().includes('timeout') ||
        errorMessage.toLowerCase().includes('etimedout') ||
        errorMessage.toLowerCase().includes('failed') ||
        errorMessage.toLowerCase().includes('network');

      notification.error({
        message: t.errorStartGeneration,
        description: isNetworkError ? t.networkError : errorMessage,
        duration: 8,
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [prompt, is3DPrintMode, polygonCount, currentPreviewImageUrl, lodCount, generatePreview, doQuadrification, onPickVariant, t]);

  const grayImages = useMemo(() => {
    const imgs = previews?.images ?? [];
    return imgs
      .filter((img) => Number(img.order) >= 0 && Number(img.order) <= 3)
      .sort((a, b) => Number(a.order) - Number(b.order));
  }, [previews]);

  const previewCardsCount = grayImages.length;
  const gridColumns = useMemo(() => {
    if (previewCardsCount === 0) return 4;
    return Math.min(previewCardsCount, 4);
  }, [previewCardsCount]);

  const modalWidth = useMemo(() => {
    if (previewCardsCount === 0) return 720;
    const columns = gridColumns;
    const cardWidth = 160;
    const gap = 12;
    const modalPadding = 48;
    const calculatedWidth = columns * cardWidth + (columns - 1) * gap + modalPadding;
    return Math.max(380, Math.min(calculatedWidth, 720));
  }, [previewCardsCount, gridColumns]);

  // собираем все меш реквесты из previews для подписки
  const meshRequestIds = useMemo(() => {
    const ids: string[] = [];
    previews?.images?.forEach((img) => {
      img.meshRequests?.forEach((mesh) => {
        const meshWithId = mesh as { id?: string; status: GenerationStatus };
        if (meshWithId?.id && typeof meshWithId.id === 'string' && !ids.includes(meshWithId.id)) {
          ids.push(meshWithId.id);
        }
      });
    });
    return ids;
  }, [previews]);

  // подписка на первый меш (отслеживание статуса генерации)
  const firstMeshId = meshRequestIds[0] || null;
  const { data: meshSubscriptionData, error: meshSubscriptionError } = useOnMeshStatusChangedSubscription({
    variables: { id: firstMeshId || '' },
    skip: !firstMeshId,
  });

  useEffect(() => {
    const meshData = meshSubscriptionData?.meshStatusChanged;
    if (meshData && previews) {
      // обновляем meshRequest в previews при изменении статуса
      const updatedImages = previews.images?.map((img) => {
        const updatedMeshRequests = img.meshRequests?.map((mesh) => {
          const meshWithId = mesh as { id?: string; status: GenerationStatus };
          return meshWithId?.id === meshData.id ? (meshData as MeshRequestEntity) : mesh;
        });
        return { ...img, meshRequests: updatedMeshRequests };
      });
      setPreviews({ ...previews, images: updatedImages });
    }
  }, [meshSubscriptionData, previews]);

  // refetch при проблемах с подпиской
  const meshAttemptsRef = useRef(0);
  const meshIntervalRef = useRef<number>();

  useEffect(() => {
    const mesh = previews?.images
      ?.flatMap((img) => img.meshRequests ?? [])
      .find((m) => {
        const meshWithId = m as { id?: string; status: GenerationStatus };
        return meshWithId?.id === firstMeshId;
      });

    if ((mesh?.status === GenerationStatus.Pending || meshSubscriptionError) && firstMeshId && previewId) {
      meshAttemptsRef.current = 0;
      const maxAttempts = 24;
      const startTime = Date.now();

      const scheduleNext = () => {
        clearTimeout(meshIntervalRef.current);
        const totalTimeSec = (Date.now() - startTime) / 1000;
        const delay = totalTimeSec > 30 ? 5 * 1000 : 10 * 1000;

        meshIntervalRef.current = window.setTimeout(() => {
          if (meshAttemptsRef.current < maxAttempts && previewId) {
            // refetch preview для обновления статуса меша
            refetch();
            meshAttemptsRef.current++;
            scheduleNext();
          }
        }, delay);
      };

      scheduleNext();

      return () => {
        clearTimeout(meshIntervalRef.current);
      };
    }
  }, [firstMeshId, meshSubscriptionError, previews, previewId, refetch]);

  useEffect(() => {
    if (previewId) {
      meshAttemptsRef.current = 0;
      clearTimeout(meshIntervalRef.current);
    }
  }, [previewId]);

  const pickVariant = (order: number) => {
    if (!previewId) return;
    setModalOpen(false);
    setShowCloseConfirmation(false);
    autoOpenedRef.current = true;

    const selectedImage = previews?.images?.find((img) => Number(img.order) === order);
    const meshRequest = selectedImage?.meshRequests?.[0] as MeshRequestEntity | undefined;
    // Передаем previews для определения режима по numTargetFaces
    onPickVariant(previewId, order, previews?.prompt, meshRequest, previews);
  };

  const handleModalCancel = () => {
    if (!showCloseConfirmation) {
      setShowCloseConfirmation(true);
    } else {
      handleConfirmClose();
    }
  };

  const handleConfirmClose = () => {
    setModalOpen(false);
    setShowCloseConfirmation(false);
    autoOpenedRef.current = true;

    setIsSubmitting(false);
    setPreviewId(null);
    setPreviews(undefined);

    window.location.href = '/';
  };

  const handleCancelConfirmation = () => {
    setShowCloseConfirmation(false);
  };

  const announceHotkeys = (enabled: boolean) => {
    window.dispatchEvent(new CustomEvent('editor-hotkeys', { detail: { enabled } }));
  };

  return (
    <SidebarWrapper
      data-theme={theme}
      $collapsed={isCollapsed}
      data-testid="sidebar-wrapper"
      data-collapsed={isCollapsed}
    >
      <Aside className={className} $collapsed={isCollapsed}>
        <Slot $collapsed={isCollapsed}>
          <BodyS bold color={secondary}>
            {t.editModel}
          </BodyS>
          <FlatTextArea
            className={styles.textArea}
            name="prompt"
            value={prompt}
            onChange={(e) => {
              if (!isDisabled) {
                setPrompt(e.target.value);
              }
            }}
            onFocus={() => {
              if (!isDisabled) {
                announceHotkeys(false);
              }
            }}
            onBlur={() => {
              if (!isDisabled) {
                announceHotkeys(true);
              }
            }}
            placeholder={t.editModelDesc}
            autoSize={{ minRows: 2, maxRows: 5 }}
            disabled={isDisabled}
          />
          <Button
            type="primary"
            size="large"
            block
            onClick={startTextGeneration}
            loading={isSubmitting}
            disabled={isDisabled || !prompt.trim()}
            style={{ marginTop: 4 }}
            className={styles.generateButton}
          >
            <BodyS>{isSubmitting ? t.creating : t.refine}</BodyS>
          </Button>

          {!is3DPrintMode && (
            <>
              <Divider style={{ margin: '12px 0' }} />
              <BodyXS bold color={primary}>
                {t.parametersGeneration}
              </BodyXS>
              <Row2 style={{ marginTop: 6 }}>
                <BodyXS>{t.topology}</BodyXS>
                <Select
                  value={doQuadrification ? 'quads' : 'tris'}
                  target="button-like"
                  placement="bottom"
                  items={[
                    { value: 'quads', label: t.quads },
                    { value: 'tris', label: t.triangles },
                  ]}
                  onChange={(v) => {
                    if (!isDisabled) {
                      setDoQuadrification(v === 'quads');
                    }
                  }}
                  disabled={isDisabled}
                  size="xs"
                  view="clear"
                />
              </Row2>

              <Row2 style={{ marginTop: 6 }}>
                <FieldLabelWithArrow>
                  <BodyXS onClick={() => setIsPolygonSliderOpen(!isPolygonSliderOpen)} style={{ cursor: 'pointer' }}>
                    {t.polygonCount}
                  </BodyXS>
                  <ArrowDownIcon
                    $isOpen={isPolygonSliderOpen}
                    onClick={() => setIsPolygonSliderOpen(!isPolygonSliderOpen)}
                    data-theme={theme}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M3 4.5L6 7.5L9 4.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </ArrowDownIcon>
                </FieldLabelWithArrow>
                <FlatNumber
                  value={polygonCount}
                  min={10000}
                  max={200000}
                  step={1000}
                  controls={false}
                  size="small"
                  parser={(v) => {
                    const str = String(v ?? '')
                      .trim()
                      .toLowerCase();
                    if (str === t.autoLower || str === 'auto') {
                      setIsPolygonCountModified(true);
                      return 40000;
                    }
                    const num = Number(String(v ?? '').replace(/\s/g, ''));
                    if (!isNaN(num)) {
                      setIsPolygonCountModified(true);
                    }
                    return num;
                  }}
                  formatter={(v) => {
                    if (v === null || v === undefined || v === '') return '';
                    // Убираем все пробелы для корректного сравнения
                    const cleanValue = String(v).replace(/\s/g, '');
                    const numValue = typeof v === 'number' ? v : Number(cleanValue);
                    // Проверяем, что значение равно 40000 и не было изменено
                    if (!isPolygonCountModified && (numValue === 40000 || cleanValue === '40000')) {
                      return t.auto;
                    }
                    // Форматируем число с пробелами
                    const num = typeof v === 'number' ? v : numValue;
                    if (isNaN(num)) return String(v);
                    return String(num).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
                  }}
                  onChange={(v) => {
                    if (!isDisabled && typeof v === 'number') {
                      const clamped = Math.max(10000, Math.min(200000, v));
                      setPolygonCount(clamped);
                      setIsPolygonCountModified(true);
                    }
                  }}
                  disabled={isDisabled}
                />
              </Row2>
              {isPolygonSliderOpen && (
                <div className={styles.sliderWrap}>
                  <Slider
                    min={10000}
                    max={200000}
                    step={1000}
                    value={polygonCount}
                    onChange={(v) => {
                      if (!isDisabled) {
                        setPolygonCount(v as number);
                        setIsPolygonCountModified(true);
                      }
                    }}
                    disabled={isDisabled}
                  />
                </div>
              )}

              <Row2 style={{ marginTop: 12 }}>
                <BodyXS>LOD</BodyXS>
                <Select
                  value={String(lodCount)}
                  onChange={(v) => {
                    if (!isDisabled) {
                      setLodCount(Number(v));
                    }
                  }}
                  items={[
                    { value: '0', label: '0' },
                    { value: '1', label: '1' },
                    { value: '2', label: '2' },
                    { value: '3', label: '3' },
                    { value: '4', label: '4' },
                    { value: '5', label: '5' },
                    { value: '6', label: '6' },
                    { value: '7', label: '7' },
                  ]}
                  size="xs"
                  disabled={isDisabled}
                  style={{ width: '60px' }}
                />
              </Row2>
            </>
          )}

          {currentPrompt && !isMeshLoading && (
            <>
              <Divider style={{ margin: '12px 0' }} />
              <BodyXS bold color={primary}>
                {t.currentPrompt}
              </BodyXS>
              <div className={styles.currentRequestBlock}>
                <div className={styles.currentRequestRow}>
                  <BodyXS>{t.prompt}</BodyXS>
                  <BodyXS color={secondary}>
                    <ExpandableText text={currentPrompt} maxLength={100} />
                  </BodyXS>
                </div>
                <div className={styles.currentRequestRow}>
                  <BodyXS>{t.generationModel}</BodyXS>
                  <BodyXS color={secondary}>Kandinsky 3D</BodyXS>
                </div>
                {topology && (
                  <div className={styles.currentRequestRow}>
                    <BodyXS>{t.topology}</BodyXS>
                    <BodyXS color={secondary}>{topology}</BodyXS>
                  </div>
                )}
                {numTargetFaces && (
                  <div className={styles.currentRequestRow}>
                    <BodyXS>{t.polygonCount}</BodyXS>
                    <BodyXS color={secondary}>{numTargetFaces.toLocaleString('ru-RU')}</BodyXS>
                  </div>
                )}
              </div>
            </>
          )}
        </Slot>
      </Aside>
      <Modal
        open={modalOpen}
        onCancel={handleModalCancel}
        afterClose={() => {
          setIsSubmitting(false);
          setPreviewId(null);
          setPreviews(undefined);
        }}
        footer={null}
        width={modalWidth}
        title={t.selectVariantTitle}
        destroyOnClose
        rootClassName={classNames(styles.previewModalRoot, theme === 'dark' ? styles.themeDark : styles.themeLight)}
      >
        {showCloseConfirmation ? (
          <Center>
            <Text
              style={{
                fontSize: 16,
                marginBottom: 16,
                textAlign: 'center',
                color: theme === 'dark' ? '#ffffff' : '#0e0e0e',
              }}
            >
              {t.confirmCancelGeneration}
            </Text>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <Button type="primary" onClick={handleConfirmClose}>
                {t.yes}
              </Button>
              <Button onClick={handleCancelConfirmation}>{t.no}</Button>
            </div>
          </Center>
        ) : (
          <>
            {!isLoading && previews && (!grayImages || grayImages.length === 0) && (
              <Center>
                <Text type="secondary">{t.noImagesYet}</Text>
              </Center>
            )}
            {(!previews || isLoading) && (
              <Center>
                <IconRotator />
                <LoaderText>{t.preparingPreview}</LoaderText>
              </Center>
            )}

            {!isLoading && grayImages && grayImages.length > 0 && (
              <Grid $columns={gridColumns}>
                {grayImages.map((img) => (
                  <Thumb key={img.order} onClick={() => pickVariant(Number(img.order))} title={t.selectThisVariant}>
                    <img src={img.url} alt={`${t.variantLabel} ${img.order}`} />
                  </Thumb>
                ))}
              </Grid>
            )}
          </>
        )}
      </Modal>
      {!is3DPrintMode && (
        <ToggleButton
          type="text"
          onClick={() => setIsCollapsed(!isCollapsed)}
          $collapsed={isCollapsed}
          disabled={modalOpen || isLoading || isMeshLoading}
          title={isCollapsed ? t.showPanel : t.hidePanel}
          aria-label={isCollapsed ? t.showPanel : t.hidePanel}
        >
          <ArrowIcon $collapsed={isCollapsed} data-theme={theme}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M10 12L6 8L10 4"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </ArrowIcon>
        </ToggleButton>
      )}
    </SidebarWrapper>
  );
};

const SidebarWrapper = styled.div<{ $collapsed?: boolean }>`
  width: ${({ $collapsed }) => ($collapsed ? '0' : '240px')};
  min-width: 0;
  max-width: none;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: visible;
  z-index: ${({ $collapsed }) => ($collapsed ? '1' : '3')};
`;

const Aside = styled.aside<{ $collapsed?: boolean }>`
  width: 100%;
  min-width: 0;
  max-width: none;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  position: relative;
  box-sizing: border-box;
  will-change: transform;
  transform: ${({ $collapsed }) => ($collapsed ? 'translate3d(-100%, 0, 0)' : 'translate3d(0, 0, 0)')};
  overflow: visible;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);

  [data-theme='dark'] & {
    background-color: rgba(23, 23, 23, 0.5);
  }

  [data-theme='light'] & {
    background-color: rgba(255, 255, 255, 0);
  }
`;

const ToggleButton = styled(Button)<{ $collapsed?: boolean }>`
  position: absolute;
  right: ${({ $collapsed }) => ($collapsed ? '-40px' : '-32px')};
  top: 12px;
  left: auto;
  width: 24px;
  height: 32px;
  min-width: 24px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 30%;
  z-index: 10;
  transition: background 0.15s ease-out, border-color 0.15s ease-out;
  backdrop-filter: blur(1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  pointer-events: auto;
  will-change: right;

  [data-theme='dark'] & {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.92);
  }

  [data-theme='light'] & {
    background: rgba(8, 8, 8, 0.04);
    border: 1px solid rgba(8, 8, 8, 0.08);
    color: #0e0e0e;
  }

  &:hover {
    [data-theme='dark'] & {
      background: rgba(255, 255, 255, 0.12);
      border-color: rgba(255, 255, 255, 0.16);
    }
    [data-theme='light'] & {
      background: rgba(8, 8, 8, 0.08);
      border-color: rgba(8, 8, 8, 0.12);
    }
  }

  &:focus-visible {
    outline: 2px solid rgba(64, 128, 255, 0.35);
    outline-offset: 2px;
  }
`;

const ArrowIcon = styled.div<{ $collapsed?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  will-change: transform;
  transform: ${({ $collapsed }) => ($collapsed ? 'rotate(180deg)' : 'rotate(0deg)')};
  color: inherit;

  svg {
    width: 16px;
    height: 16px;
    display: block;
    color: inherit;
  }
`;

const Slot = styled.div<{ $collapsed?: boolean }>`
  padding: 10px 5px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  --ls-text: #0e0e0e;
  --ls-text-dim: rgba(0, 0, 0, 0.65);
  --ls-placeholder-color: rgba(8, 8, 8, 0.28);
  overflow: ${({ $collapsed }) => ($collapsed ? 'hidden' : 'visible')};
  opacity: ${({ $collapsed }) => ($collapsed ? '0' : '1')};
  [data-theme='dark'] & {
    --ls-text: #f5f5f5;
    --ls-text-dim: rgba(255, 255, 255, 0.7);
    --ls-placeholder-color: rgba(255, 255, 255, 0.28);
  }
`;

const Row2 = styled.div`
  display: grid;
  grid-template-columns: 1fr auto;
  align-items: center;
  gap: 8px;
`;
const FieldLabelWithArrow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--ls-text);
  opacity: 0.95;
  user-select: none;
  white-space: nowrap;
  line-height: 1;
`;

const ArrowDownIcon = styled.div<{ $isOpen: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s ease;
  transform: ${({ $isOpen }) => ($isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  color: var(--ls-text-dim);
  opacity: 0.7;
  line-height: 1;
  vertical-align: middle;

  svg {
    width: 12px;
    height: 12px;
    display: block;
  }

  &:hover {
    opacity: 1;
  }
`;
const FlatTextArea = Input.TextArea;

const FlatNumber = styled(InputNumber)`
  width: 65px;
  max-width: 65px;
  text-align: center;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  color: ${secondary};
  font-size: 12px !important;
  font-family: 'SB Sans Text';
  .ant-input-number-input {
    text-align: center;
    color: ${secondary};
    background: transparent !important;
    font-size: 12px !important;
    font-family: 'SB Sans Text';
  }
  &:hover,
  &:focus-within {
    border: none !important;
    box-shadow: none !important;
  }
`;

const Center = styled.div`
  padding: 24px 0;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LoaderText = styled.div`
  margin-top: 12px;
  opacity: 0.85;
`;

const Grid = styled.div<{ $columns?: number }>`
  display: grid;
  grid-template-columns: repeat(${({ $columns = 4 }) => $columns}, 1fr);
  gap: 12px;

  @media (max-width: 720px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const Thumb = styled.button`
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border: 1px solid var(--search-border-color);
  background: var(--search-bg-mobile);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  padding: 0;

  &:hover {
    outline: 2px solid var(--active-fv-border);
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;
