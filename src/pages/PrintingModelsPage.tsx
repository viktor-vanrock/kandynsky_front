import { useEffect, useState, useRef, useCallback,  } from 'react';
import { Spin, Button } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import styles from './PreviewsPage.module.css';
import printStyles from './PrintingModelsPage.module.css';
import classNames from 'classnames';
import { useNavigate } from 'react-router-dom';
import { useGetPrintingQueueQuery, PrintingQueueEntity } from '../graphql/graphQlApiHooks';
import { useTheme } from '../context';
import { BackgroundGradients } from '../components/background-gradients';
import { ModeType } from '../components/background-gradients/types';

const PrintingModelsPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [page, setPage] = useState<number>(1);
  const [models, setModels] = useState<Array<PrintingQueueEntity>>([]);
  const loaderRef = useRef(null);

  const { data, loading, error, fetchMore } = useGetPrintingQueueQuery({
    variables: {
      pagination: {
        page,
        limit: 20,
      },
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'network-only',
  });

  const hasMore = !data ? false : data?.getPrintingQueue?.page < data?.getPrintingQueue?.total_pages;

  useEffect(() => {
    if (error) console.log(error);

    const queueItems = (data?.getPrintingQueue?.data ?? []) as PrintingQueueEntity[];
    if (queueItems?.length) {
      setModels((prev) => {
        const existingIds = new Set(prev.map((m) => m.id));
        const newItems = queueItems.filter((item) => !existingIds.has(item.id));
        const next = [...prev, ...newItems];
        const limit = 400;
        return next.length > limit ? next.slice(next.length - limit) : next;
      });
    }
  }, [data, error]);

  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !error) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchMore({
            variables: { pagination: { page: nextPage, limit: 20 } },
          });
        }
      },
      { threshold: 1 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [loaderRef, hasMore, loading, error, fetchMore, page]);

  const handleDownload = useCallback((url: string, format: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `model.${format}`;
    link.click();
  }, []);

  const getPreviewImage = useCallback((item: PrintingQueueEntity) => {
    const meshRequest = item?.meshRequest;
    const imageEntity = meshRequest?.image;
    const preview = imageEntity?.preview;

    if (!preview?.images?.length) return null;

    // Ищем PNG изображение (order 100) или берем первое серое (0-3)
    const pngImage = preview.images.find((img) => img.order === 100);
    const grayImage = preview.images.find((img) => img.order >= 0 && img.order <= 3);

    return pngImage?.url || grayImage?.url || preview.images[0]?.url;
  }, []);

  const getFormats = useCallback((item: PrintingQueueEntity) => {
    const meshFormats = item?.meshRequest?.meshFormats ?? [];
    const arr = meshFormats
      .filter((f) => Boolean(f?.url) && Boolean(f?.format?.name))
      .map((f) => ({
        id: f.id,
        name: String(f.format?.name ?? '').toLowerCase(),
        url: String(f.url),
      }));
    const order = { glb: 0, obj: 1, stl: 2, ply: 3, usdz: 4 } as const;
    return arr.sort((a, b) => (order[a.name as keyof typeof order] ?? 99) - (order[b.name as keyof typeof order] ?? 99));
  }, []);

  const handleCardClick = useCallback(
    (item: PrintingQueueEntity) => {
      const formats = getFormats(item);
      const glbFormat = formats.find((f) => f.name === 'glb');
      if (glbFormat) {
        navigate('/editor', {
          state: {
            glbUrl: glbFormat.url,
            prompt: item.meshRequest?.previewPrompt || 'Модель для печати',
          },
        });
      }
    },
    [navigate, getFormats],
  );

  return (
    <div className={styles.previewsWrapper}>
      <BackgroundGradients mode={'3dprint' as ModeType}/>
      <div className={classNames(styles.galleryContainer, 'container')}>
        {models.map((item) => {
          const previewUrl = getPreviewImage(item);
          const formats = getFormats(item);

          return (
            <div key={item.id} className={printStyles.printCard} data-theme={theme}>
              <div className={printStyles.imageWrapper} onClick={() => handleCardClick(item)}>
                {previewUrl ? (
                  <img src={previewUrl} alt={item.meshRequest?.previewPrompt || 'preview'} className={printStyles.previewImage} />
                ) : (
                  <div className={printStyles.noImage}>Нет изображения</div>
                )}
              </div>

              <div className={printStyles.cardFooter}>
                <div className={printStyles.cardInfo}>
                  <span className={printStyles.cardStatus} data-status={item.status}>
                    {item.status}
                  </span>
                  <span className={printStyles.cardDate}>
                    {new Date(item.addedAt).toLocaleDateString('ru-RU')} {new Date(item.addedAt).toLocaleDateString('ru-RU', {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>

                <div className={printStyles.downloadButtons}>
                  {formats.map((format) => (
                    <Button
                      key={format.id}
                      size="small"
                      type="text"
                      icon={<DownloadOutlined />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload(format.url, format.name);
                      }}
                      title={`Скачать ${format.name.toUpperCase()}`}
                      className={printStyles.downloadButton}
                    >
                      {format.name.toUpperCase()}
                    </Button>
                  ))}
                </div>

                {item.notes && (
                  <div className={printStyles.notes}>
                    <small>{item.notes}</small>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {!loading && !error && models.length === 0 && (
          <div style={{ width: '100%', textAlign: 'center', margin: '60px 0', fontSize: 18, color: '#888' }}>
            Очередь печати пуста
          </div>
        )}
      </div>

      {loading && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Spin />
        </div>
      )}

      <div ref={loaderRef} style={{ height: '1px', visibility: 'hidden' }} />
    </div>
  );
};

export default PrintingModelsPage;
