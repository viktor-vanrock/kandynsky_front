import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useModelStatusAndGenerate } from '../../hooks';
import { ModelViewer } from '../model-viewer';
import { GetGeneratedPreviewsQuery, useGetPreviewByIdQuery } from '../../graphql/graphQlApiHooks.ts';
import { validateAndParseIndex } from '../../hooks/useModelStatusAndGenerate.tsx';
import { useViewerStore } from '../../store/viewer.ts';
import { useGameDevStore } from '../../store/gamedev.ts';
import { BackgroundGradients } from '../background-gradients';
import { useInIframe } from '../../hooks/useInIframe.ts';
import { postIframeScrollUp } from '../../hooks/useIframeAutoResize.ts';

export const Model = () => {
  const { id, index } = useParams<{ id: string; index: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isGameDevMode } = useGameDevStore();
  const inIframe = useInIframe();

  const [previews, setPreviews] = useState<GetGeneratedPreviewsQuery['getGeneratedPreviews']['data'][0] | null>(null);
  const { setHdrMap } = useViewerStore();

  const { data: queryData, refetch: refetchPreview } = useGetPreviewByIdQuery({
    variables: { id: id || '' },
    skip: !id,
    fetchPolicy: 'cache-and-network',
  });

  useEffect(() => {
    console.log('Preview id:', id);
    if (id) {
      refetchPreview();
    }
  }, [id, index, refetchPreview]);

  useEffect(() => {
    if (!inIframe) return;
    postIframeScrollUp('model');
  }, [inIframe, id, index]);

  useEffect(() => {
    if (queryData?.getPreviewById) {
      setPreviews(queryData.getPreviewById);
    }
    setHdrMap(0);
  }, [queryData, setHdrMap]);

  // редирект в редактор если выбрали режим gamedev
  useEffect(() => {
    if (isGameDevMode && id && index) {
      // const normalizedOrder = Number(index) === 101 ? 100 : Number(index);
      navigate('/editor', {
        state: {
          previewId: id,
          order: 0,
          isGameDevMode: true,
        },
        replace: true,
      });
    }
  }, [isGameDevMode, id, index, navigate]);

  const { modelInfo, fetchOrGenerateMesh } = useModelStatusAndGenerate(id, index);

  useEffect(() => {
    if (id && index) {
      // В gamedev режиме не вызываем fetchOrGenerateMesh сразу
      // Ждём пока preview станет READY
      if (isGameDevMode && previews?.status !== 'READY') {
        console.log('[Model] Waiting for preview to be READY in gamedev mode, current status:', previews?.status);
        return;
      }

      const sourceImageIndex = validateAndParseIndex(index);
      if (sourceImageIndex !== null) {
        fetchOrGenerateMesh(sourceImageIndex);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key, isGameDevMode, previews?.status]);

  if (!id || !index) {
    console.error('Missing or invalid id or index:', { id, index });
    return null;
  }

  if (isGameDevMode) {
    return null;
  }

  const shouldShowPointCloud = modelInfo !== null && modelInfo.status !== 'READY';

  return (
    <>
      <BackgroundGradients mode="standard" />
      <ModelViewer
        key={`${id}-${index}-${location.key || 'default'}`}
        modelInfo={modelInfo}
        preview={previews}
        sourceImageIndex={validateAndParseIndex(index)}
        fetchOrGenerateMesh={fetchOrGenerateMesh}
        showPointCloud={shouldShowPointCloud}
      />
    </>
  );
};
