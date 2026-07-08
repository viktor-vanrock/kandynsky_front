import { forwardRef, useCallback, useImperativeHandle, useState } from 'react';
import styled from 'styled-components';
import { getServerUrl, getPublicBaseUrl } from '../../utils/serverUrl';
import { Modal, QRCode, Spin, notification } from 'antd';

export type ScreenshotManagerHandle = {
  takeScreenshot: () => Promise<void>;
};

type Props = {
  isCameraOn: boolean;
  webglCanvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  videoElRef: React.MutableRefObject<HTMLVideoElement | null>;
  onSavingChange?: (saving: boolean) => void;
};

export const ScreenshotManager = forwardRef<ScreenshotManagerHandle, Props>(
  ({ isCameraOn, webglCanvasRef, videoElRef, onSavingChange }, ref) => {
    const [qrVisible, setQrVisible] = useState(false);
    const [shortUrl, setShortUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const setSaving = useCallback(
      (v: boolean) => {
        setIsSaving(v);
        onSavingChange?.(v);
      },
      [onSavingChange],
    );

    const uploadSnapshot = useCallback(async (blob: Blob) => {
      const fd = new FormData();
      fd.append('file', blob, `snapshot-${Date.now()}-${Math.random().toString(36).slice(2)}.png`);
      const apiUrl = `${getServerUrl()}/snapshots`;
      const res = await fetch(apiUrl, { method: 'POST', body: fd });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      return res.json() as Promise<{ shortUrl: string; code: string }>;
    }, []);

    async function waitVideoFrame(v: HTMLVideoElement): Promise<void> {
      if (v.requestVideoFrameCallback) {
        await new Promise<void>((resolve) => v.requestVideoFrameCallback!(() => resolve()));
      } else {
        if (v.readyState < 2 || !v.videoWidth || !v.videoHeight) {
          await new Promise<void>((resolve) => v.addEventListener('loadedmetadata', () => resolve(), { once: true }));
        }
        if (v.paused) {
          await new Promise<void>((resolve) => v.addEventListener('playing', () => resolve(), { once: true }));
        }
      }
    }

    const takeScreenshot = useCallback(async () => {
      const webgl = webglCanvasRef.current;
      if (!webgl) return;

      const video = videoElRef.current;
      const pixelW = webgl.width;
      const pixelH = webgl.height;
      if (!pixelW || !pixelH) return;

      const mix = document.createElement('canvas');
      mix.width = pixelW;
      mix.height = pixelH;
      const ctx = mix.getContext('2d', { alpha: true });
      if (!ctx) return;

      if (isCameraOn && video) {
        await waitVideoFrame(video);
        const vw = video.videoWidth || 0;
        const vh = video.videoHeight || 0;
        if (vw && vh) {
          const scale = Math.min(pixelW / vw, pixelH / vh);
          const dw = vw * scale;
          const dh = vh * scale;
          const dx = (pixelW - dw) / 2;
          const dy = (pixelH - dh) / 2;
          ctx.drawImage(video, dx, dy, dw, dh);
        }
      }

      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      ctx.drawImage(webgl, 0, 0, pixelW, pixelH);

      try {
        setSaving(true);
        mix.toBlob(
          async (blob) => {
            if (!blob) {
              setSaving(false);
              return;
            }
            try {
              const { code } = await uploadSnapshot(blob);
              const publicBase = getPublicBaseUrl();
              setShortUrl(`${publicBase}/api/s/${code}`);
              setQrVisible(true);
              notification.success({ message: 'Снимок сохранён', description: 'Сгенерирована короткая ссылка и QR' });
            } catch (err) {
              console.error(err);
              notification.error({ message: 'Не удалось загрузить снимок' });
            } finally {
              setSaving(false);
            }
          },
          'image/png',
          1,
        );
      } catch (e) {
        console.error('Ошибка при создании скриншота', e);
        setSaving(false);
      }
    }, [isCameraOn, uploadSnapshot, videoElRef, webglCanvasRef, setSaving]);

    useImperativeHandle(ref, () => ({ takeScreenshot }));

    return (
      <>
        {isSaving && (
          <Overlay role="alert" aria-live="polite">
            <OverlayText>Сохраняем снимок...</OverlayText>
            <Spin size="large" style={{ color: '#888' }} />
          </Overlay>
        )}

        <Modal open={qrVisible} onCancel={() => setQrVisible(false)} footer={null} title="Ссылка на снимок">
          {shortUrl && (
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <QRCode value={shortUrl} />
              <div style={{ wordBreak: 'break-all' }}>
                <div style={{ fontSize: 12, opacity: 0.7 }}>Короткая ссылка:</div>
                <a href={shortUrl} target="_blank" rel="noreferrer">
                  {shortUrl}
                </a>
              </div>
            </div>
          )}
        </Modal>
      </>
    );
  },
);

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  background: rgba(0, 0, 0, 0.2);
`;

const OverlayText = styled.div`
  margin-top: 12px;
  font-size: 14px;
  color: var(--loading-text-color);
`;

export default ScreenshotManager;
