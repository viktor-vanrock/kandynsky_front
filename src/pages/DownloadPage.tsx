import { useEffect, useState, FC } from 'react';
import { useParams } from 'react-router-dom';
import { useGetMeshByIdQuery } from '../graphql/graphQlApiHooks.ts';
import styles from './DownloadPage.module.css';
import { BodyS, H2 } from '@salutejs/plasma-giga';

const DownloadPage: FC = () => {
  const { meshId } = useParams<{ meshId: string }>();

  const { data, loading, error } = useGetMeshByIdQuery({
    variables: { id: meshId || '' },
    skip: !meshId,
  });

  const [message, setMessage] = useState('Определяем устройство...');
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
        setMessage('Просмотр 3D-модели в AR на устройстве Apple');
        return;
      }

      // на андроидах показываем model-viewer
      if (/Android/.test(userAgent) && glb) {
        setShowModelViewer(true);
        setMessage('Просмотр 3D-модели на Android');
        return;
      }

      // если это непонятная платформа даем скачать файл
      setShowModelViewer(false);
      setMessage('Не удалось определить устройство. Выберите формат для скачивания:');
    }
  }, [data]);

  if (loading) return <div>Загрузка...</div>;
  if (error || !data?.getMeshById) return <div>Ошибка загрузки модели</div>;

  const formats = data.getMeshById.meshFormats || [];
  const glb = formats.find((mesh) => mesh.format.name === 'glb');
  const usdz = formats.find((mesh) => mesh.format.name === 'usdz');

  return (
    <div style={{ textAlign: 'center', padding: 40 }}>
      <H2>Скачать 3D-модель</H2>
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
            Открыть в AR (iPhone/iPad)
          </a>
          <div style={{ marginTop: 14, color: '#888', fontSize: 14 }}>
            Нажмите кнопку для просмотра 3D-модели в AR на вашем устройстве
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
            alt="3D модель"
            loading="eager"
            ios-src={usdz?.url}
          >
            <div className={styles.fallbackText}>Ваш браузер не поддерживает просмотр 3D-модели</div>
          </model-viewer>
          <div style={{ marginTop: 20 }}>
            <a href={glb.url} download style={{ fontSize: 18 }}>
              Скачать .glb
            </a>
          </div>
        </div>
      )}
      {!showModelViewer && !showIosButton && message.includes('Выберите формат') && (
        <div style={{ marginTop: 20 }}>
          {usdz && (
            <a href={usdz.url} style={{ margin: 10, fontSize: 18 }} download>
              Скачать для iPhone/iPad (USDZ)
            </a>
          )}
          {glb && (
            <a href={glb.url} style={{ margin: 10, fontSize: 18 }} download>
              Скачать для Android (GLB)
            </a>
          )}
        </div>
      )}
    </div>
  );
};

export default DownloadPage;
