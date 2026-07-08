import { useEffect, useState, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Spin } from 'antd';
import classNames from 'classnames';

import {
  GenerationStatus,
  GetGeneratedPreviewsQuery,
  useGetGeneratedPreviewsQuery,
} from '../graphql/graphQlApiHooks.ts';
import { getSessionToken } from '../utils/session.ts';
import { PreviewBlock } from '../components/preview-block';
import { BackgroundGradients } from '../components/background-gradients/index.ts';

import styles from './PreviewsPage.module.css';

type PreviewModel = GetGeneratedPreviewsQuery['getGeneratedPreviews']['data'][0];
type PreviewImage = GetGeneratedPreviewsQuery['getGeneratedPreviews']['data'][0]['images'][0];
type Props = {
  onMain?: boolean;
};

const PreviewsPage = ({ onMain }: Props) => {
  const [page, setPage] = useState<number>(1);
  const [models, setModels] = useState<Array<PreviewModel>>([]);
  const loaderRef = useRef(null);

  const sessionToken = getSessionToken();
  const { data, loading, error, fetchMore } = useGetGeneratedPreviewsQuery({
    variables: {
      sessionToken: onMain ? '' : sessionToken,
      pagination: {
        page,
        limit: 20,
      },
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'network-only',
  });

  const hasMore = !data ? false : data?.getGeneratedPreviews?.page < data?.getGeneratedPreviews?.total_pages;

  // подмешиваем большие превьюшки для сгенерированных мешей и мешей в процессе
  const mixReadyMeshes = useCallback((previews: Array<PreviewModel>): Array<PreviewModel> => {
    const mixedPreviews: Array<PreviewModel> = [];
    // превьюшки без дублей
    const added = new Set<string>();

    previews.forEach((preview: PreviewModel) => {
      preview.images.forEach((image: PreviewImage) => {
        const hasMesh = image.meshRequests?.some(
          ({ status }) => status === GenerationStatus.Ready || status === GenerationStatus.Pending,
        );
        const key = `${preview.id}_${image.order}`;
        if (hasMesh && !added.has(key)) {
          mixedPreviews.push({
            ...preview,
            images: [image],
          });
          added.add(key);
        }
      });
    });

    return mixedPreviews;
  }, []);

  const filterEmpty = (previews: Array<PreviewModel>): Array<PreviewModel> => {
    return previews.filter((preview: PreviewModel) => preview.images.length);
  };

  const filterGalleryOnly = (previews: Array<PreviewModel>): Array<PreviewModel> => {
    return previews.filter((preview: PreviewModel) => preview.gallery);
  };

  const filterUserOnly = (previews: Array<PreviewModel>): Array<PreviewModel> => {
    return previews.filter((preview: PreviewModel) => !preview.gallery);
  };

  useEffect(() => {
    if (error) {
      console.log(error);
    }
    let previews = data?.getGeneratedPreviews?.data as Array<PreviewModel>;
    if (previews) {
      previews = filterEmpty(previews);
      previews = onMain ? filterGalleryOnly(previews) : filterUserOnly(previews);
      setModels((prevModels) => [...prevModels, ...previews]);
    }
  }, [data, error, mixReadyMeshes, onMain]);

  useEffect(() => {
    const current = loaderRef.current;
    if (!current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !error) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchMore({
            variables: {
              pagination: {
                page: nextPage,
                limit: 20,
              },
            },
          });
        }
      },
      { threshold: 1 },
    );

    observer.observe(current);
    return () => {
      observer.unobserve(current);
    };
  }, [loaderRef, loading, error, fetchMore, hasMore, page]);

  return (
    <div className={styles.previewsWrapper}>
      {!onMain && <BackgroundGradients mode="standard" />}
      <div
        className={classNames(
          styles.galleryContainer,
          'container',
          onMain && styles.galleryContainer_main,
          models.length > 0 && models.length <= 3 && styles.galleryContainer_few2,
          models.length > 0 && models.length === 3 && styles.galleryContainer_few3,
        )}
      >
        {models.map((model, index) => (
          <PreviewBlock key={index} model={model} loading={loading} />
        ))}
      </div>

      {!loading && !error && models.length === 0 && !onMain && (
        <div style={{ width: '100%', textAlign: 'center', margin: '60px 0', fontSize: 18, color: '#888' }}>
          <div>Вы ещё не создали ни одной модели. </div>
          <Link to="/" className={styles.createFirstLink}>
            Перейдите на главную страницу сервиса и попробуйте что-нибудь сгенерировать
          </Link>
        </div>
      )}

      {loading && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Spin />
        </div>
      )}
      <div ref={loaderRef} style={{ height: '1px', visibility: 'hidden' }} />
    </div>
  );
};

export default PreviewsPage;
