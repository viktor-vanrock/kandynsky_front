import { useEffect, useState, FC } from 'react';
import { useParams } from 'react-router-dom';
import { useGetMeshByIdQuery } from '../graphql/graphQlApiHooks.ts';
import styles from './DownloadPage.module.css';
import { BodyS, H2 } from '@salutejs/plasma-giga';
import { useLocale } from '../context';

const DownloadPage: FC = () => {
  const { meshId } = useParams<{ meshId: string }>();
  const { t } = useLocale();

  const { data, loading, error } = useGetMeshByIdQuery({
    variables: { id: meshId || '' },
    skip: !meshId,
  });

  const [message, setMessage] = useState('');
  const [showFallback, setShowFallback] = useState(false);
  const [showModelViewer, setShowModelViewer] = useState(false);
  const [showIosButton, setShowIosButton] = useState(false);
  const [iosUrl, setIosUrl] = useState<string | undefined>();

  useEffect(() => {
    if (data?.getMeshById?.meshFormats) {
      const formats = data.getMeshById.meshFormats;
      const glb = formats.find((mesh) => mesh.format.name === 'glb');
      const usdz = formats.find((mesh) => mesh.format.name === 'usdz');
      const userAgent = navigator.userAgent;

      if (/iPad|iPhone|iPod/.test(userAgent) && usdz) {
        setShowIosButton(true);
        setIosUrl(usdz.url);
        setMessage(t.viewArApple);
        return;
      }

      // на андроидах показываем model-viewer
      if (/Android/.test(userAgent) && glb) {
        setShowModelViewer(true);
        setMessage(t.viewAndroid);
        return;
      }

      // если это непонятная платформа даем скачать файл
      setShowModelViewer(false);
      setShowFallback(true);
      setMessage(t.deviceNotDetected);
    }
  }, [data]);

  if (loading) return <div>{t.loading}</div>;
  if (error || !data?.getMeshById) return <div>{t.errorLoadingModel}</div>;

  const formats = data.getMeshById.meshFormats || [];
  const glb = formats.find((mesh) => mesh.format.name === 'glb');
  const usdz = formats.find((mesh) => mesh.format.name === 'usdz');

  return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <H2>{t.downloadModel3D}</H2>
      <BodyS>{message}</BodyS>
      {/* для ios */}
      {showIosButton && iosUrl && (
        <div style={{ margin: 32 }}>
          <a
            href={iosUrl}
            rel="ar"
            style={{
              padding: '16px 40px',
              background: '#2d72fd',
              color: '#fff',
              fontSize: 20,
              borderRadius: 22,
              textDecoration: 'none',
              fontWeight: 600,
              display: 'inline-block',
            }}
          >
            {t.openInAr}
          </a>
          <div style={{ marginTop: 14, color: '#888', fontSize: 14 }}>
            {t.openArHint}
          </div>
        </div>
      )}
      {/* для андроида */}
      {showModelViewer && glb && (
        <div style={{ margin: '30px 0' }}>
          <model-viewer
            src={glb.url}
            ar
            ar-modes="scene-viewer webxr"
            camera-controls
            auto-rotate
            style={{ width: '100%', height: 360, background: 'transparent' }}
            alt={t.downloadModel3D}
            loading="eager"
            ios-src={usdz?.url}
          >
            <div className={styles.fallbackText}>{t.browserNoSupport}</div>
          </model-viewer>
          <div style={{ marginTop: 20 }}>
            <a href={glb.url} download style={{ fontSize: 18 }}>
              {t.downloadGlb}
            </a>
          </div>
        </div>
      )}
      {!showModelViewer && !showIosButton && showFallback && (
        <div style={{ marginTop: 20 }}>
          {usdz && (
            <a href={usdz.url} style={{ margin: 10, fontSize: 18 }} download>
              {t.downloadUsdz}
            </a>
          )}
          {glb && (
            <a href={glb.url} style={{ margin: 10, fontSize: 18 }} download>
              {t.downloadGlbAndroid}
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default DownloadPage;
