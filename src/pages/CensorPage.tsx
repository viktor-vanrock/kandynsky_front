import { Button, Tabs } from 'antd';
import { useMemo, useState } from 'react';
import {
  GenerationStatus,
  GetCensorCheckingPreviewsQuery,
  useGetCensorCheckingPreviewsQuery,
} from '../graphql/graphQlApiHooks.ts';
import styles from './CensorPage.module.css';

const MAX_IMAGE_COLUMNS = 4;
const TOTAL_TABLE_COLUMNS = MAX_IMAGE_COLUMNS + 3;

const sortImages = <T extends { order: number }>(images: T[]) => [...images].sort((a, b) => a.order - b.order);

const imageExtensions = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'];

type PreviewEntity = GetCensorCheckingPreviewsQuery['getCensorCheckingPreviews'][number];
const isImagePrompt = (value?: string | null): boolean => {
  if (!value) return false;
  const trimmed = value.trim();
  if (!trimmed) return false;

  if (trimmed.startsWith('data:image/')) {
    return true;
  }

  try {
    const url = new URL(trimmed);
    const ext = url.pathname.split('.').pop()?.toLowerCase();
    if (ext && imageExtensions.includes(ext)) {
      return true;
    }
  } catch {
    // not a valid URL
  }

  return false;
};

type TabKey = 'text' | 'images';

const CensorPage = () => {
  const controlToken =
    typeof window !== 'undefined'
      ? localStorage.getItem('control-token') || sessionStorage.getItem('control-token')
      : null;
  const hasAccess = Boolean(controlToken);
  const [activeTab, setActiveTab] = useState<TabKey>('text');

  const { data, loading, error, refetch } = useGetCensorCheckingPreviewsQuery({
    variables: { limit: 500 },
    fetchPolicy: 'network-only',
    skip: !hasAccess,
    context: hasAccess
      ? {
          headers: {
            authorization: controlToken ?? '',
          },
        }
      : undefined,
  });

  const previews = useMemo<PreviewEntity[]>(() => {
    const previewsWithSortedImages = (data?.getCensorCheckingPreviews ?? []).map((preview) => ({
      ...preview,
      images: sortImages(preview.images),
    }));

    return previewsWithSortedImages.sort((a, b) => {
      const getTimestamp = (value: string | null | undefined) => {
        if (!value) return 0;
        const time = new Date(value).getTime();
        return Number.isNaN(time) ? 0 : time;
      };

      // Сортировка по убыванию: новые записи сверху
      return getTimestamp(b.updatedAt) - getTimestamp(a.updatedAt);
    });
  }, [data]);

  const resolveStatusClass = (status: GenerationStatus) => {
    if (status === GenerationStatus.Ready) {
      return `${styles.statusBadge} ${styles.statusReady}`;
    }
    if (status === GenerationStatus.Pending) {
      return `${styles.statusBadge} ${styles.statusPending}`;
    }
    return `${styles.statusBadge} ${styles.statusDefault}`;
  };

  const textPreviews = useMemo(
    () => previews.filter((preview) => !isImagePrompt(preview.prompt) && preview.modelName !== 'xr:3d_mesh'),
    [previews],
  );

  const imagePreviews = useMemo(() => {
    // Фильтруем только те previews, у которых есть images с meshRequests с censorChecking=true
    return previews.filter((preview) =>
      preview.images.some((image) => image.meshRequests?.some((mesh) => mesh?.censorChecking)),
    );
  }, [previews]);

  const textualContent = (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>Query ID</th>
            <th>Статус</th>
            <th>Промт</th>
            {Array.from({ length: MAX_IMAGE_COLUMNS }).map((_, index) => (
              <th key={index}>Изображение {index + 1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td className={styles.loadingCell} colSpan={TOTAL_TABLE_COLUMNS + 1}>
                Загружаем превью...
              </td>
            </tr>
          )}

          {!loading && textPreviews.length === 0 && (
            <tr>
              <td className={styles.empty} colSpan={TOTAL_TABLE_COLUMNS + 1}>
                Пока нет текстовых превью с флагом censor_checking.
              </td>
            </tr>
          )}

          {!loading &&
            textPreviews.map((preview, index) => (
              <tr key={preview.id}>
                <td>{index + 1}</td>
                <td>{preview.queryId}</td>
                <td className={styles.statusCell}>
                  <span className={resolveStatusClass(preview.status)}>
                    {preview.status.toLowerCase().replace(/_/g, ' ')}
                  </span>
                </td>
                <td className={styles.promptCell}>
                  {isImagePrompt(preview.prompt) ? (
                    <img src={preview.prompt} alt="Prompt preview" className={styles.promptImage} />
                  ) : (
                    <div className={styles.prompt}>{preview.prompt}</div>
                  )}
                </td>
                {Array.from({ length: MAX_IMAGE_COLUMNS }).map((_, index) => {
                  const image = preview.images[index];
                  return (
                    <td key={index}>
                      {image ? (
                        <a href={image.url} target="_blank" rel="noreferrer noopener" className={styles.previewLink}>
                          <img src={image.url} alt={`Изображение ${index + 1}`} className={styles.previewImage} />
                        </a>
                      ) : (
                        <span className={styles.noImage}>—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );

  const imagesContent = (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>#</th>
            <th>Query ID</th>
            <th>Статус</th>
            <th>Промт</th>
            <th>Изображение 1 (png)</th>
            <th>Изображение 2 (gif)</th>
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr>
              <td className={styles.loadingCell} colSpan={6}>
                Загружаем превью...
              </td>
            </tr>
          )}

          {!loading && imagePreviews.length === 0 && (
            <tr>
              <td className={styles.empty} colSpan={6}>
                Пока нет превью, созданных по изображениям с флагом censor_checking.
              </td>
            </tr>
          )}

          {!loading &&
            imagePreviews.map((preview, index) => {
              // Находим первый meshRequest с censorChecking=true для получения имени файла
              const meshWithCensorChecking = preview.images
                .flatMap((image) => image.meshRequests || [])
                .find((mesh) => mesh?.censorChecking);
              const fileName = meshWithCensorChecking?.prompt || '—';

              return (
                <tr key={preview.id}>
                  <td>{index + 1}</td>
                  <td>{preview.queryId}</td>
                  <td className={styles.statusCell}>
                    <span className={resolveStatusClass(preview.status)}>
                      {preview.status.toLowerCase().replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className={styles.promptCell}>
                    <div className={styles.prompt}>{fileName}</div>
                  </td>
                  <td>
                    {preview.images[0] ? (
                      <a
                        href={preview.images[0].url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className={styles.previewLink}
                      >
                        <img src={preview.images[0].url} alt="Изображение 1" className={styles.previewImage} />
                      </a>
                    ) : (
                      <span className={styles.noImage}>—</span>
                    )}
                  </td>
                  <td>
                    {preview.images[1] ? (
                      <a
                        href={preview.images[1].url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className={styles.previewLink}
                      >
                        <img src={preview.images[1].url} alt="Изображение 2" className={styles.previewImage} />
                      </a>
                    ) : (
                      <span className={styles.noImage}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
        </tbody>
      </table>
    </div>
  );

  const isUnauthorizedError =
    error?.graphQLErrors?.some(({ message, extensions }) => {
      const normalized = (message || '').toLowerCase();
      const originalMessage = (extensions as Record<string, unknown> | undefined)?.originalError as
        | { message?: string }
        | undefined;
      return (
        normalized === 'unauthorized' || originalMessage?.message === 'Unauthorized' || extensions?.code === 'FORBIDDEN'
      );
    }) || error?.message?.toLowerCase() === 'unauthorized';

  if (!hasAccess || isUnauthorizedError) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Проверка цензуры</h1>
          <p className={styles.subtitle}>
            Выводятся последние превью с флагом censor_checking в статусах pending и ready.
          </p>
        </div>
        <Button type="primary" onClick={() => refetch()} loading={loading}>
          Обновить
        </Button>
      </div>
      {error && !isUnauthorizedError && (
        <div className={styles.error}>Не удалось загрузить данные: {error.message}</div>
      )}

      <div className={styles.tabsWrapper}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as TabKey)}
          items={[
            { key: 'text', label: 'Текстовые', children: textualContent },
            { key: 'images', label: 'Изображения', children: imagesContent },
          ]}
        />
      </div>
    </div>
  );
};

export default CensorPage;
