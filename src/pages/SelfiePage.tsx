import { FC, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled, { css, keyframes } from 'styled-components';
import { useTheme, useLocale } from '../context';
import { BackgroundGradients } from '../components/background-gradients';

const Wrapper = styled.div`
  width: 100%;
  height: calc(100dvh - 72px);
  background: var(--layout-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const CameraContainer = styled.div`
  position: relative;
  width: 91.11%;
  height: 82.55%;
`;

const CameraView = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 20px;
  display: block;
`;

const NoCameraText = styled.p<{ $theme: 'light' | 'dark' }>`
  font-family: 'SB Sans Text', sans-serif;
  font-size: 18px;
  color: ${(props) => (props.$theme === 'dark' ? 'rgba(255,255,255,0.56)' : 'rgba(8,8,8,0.40)')};
  text-align: center;
  margin: 0;
`;

const ButtonsRow = styled.div`
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
`;

const sweepAnim = keyframes`
  0%   { left: -20%; }
  100% { left: 120%; }
`;

const SweepOverlay = styled.div<{ $active: boolean }>`
  position: absolute;
  inset: 0;
  border-radius: 20px;
  pointer-events: none;
  overflow: hidden;
  opacity: ${(props) => (props.$active ? 1 : 0)};

  &::after {
    content: '';
    position: absolute;
    top: -20%;
    left: -20%;
    width: 80px;
    height: 140%;
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0) 15%,
      rgba(255, 255, 255, 0.6) 40%,
      rgba(255, 255, 255, 0.95) 50%,
      rgba(255, 255, 255, 0.6) 60%,
      rgba(255, 255, 255, 0) 85%,
      transparent 100%
    );
    transform: rotate(25deg);
    ${(props) =>
      props.$active &&
      css`
        animation: ${sweepAnim} 2.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
      `}
  }
`;

const RoundButton = styled.button<{ $accent?: boolean }>`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  border: none;
  background: ${(props) => (props.$accent ? '#1A9E32' : '#F9F9F9')};
  color: ${(props) => (props.$accent ? '#fff' : '#000')};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: ${(props) => (props.$accent ? '#178a2b' : 'rgba(255, 255, 255, 0.22)')};
  }
`;

const SelfiePage: FC = () => {
  const { theme } = useTheme();
  const { t } = useLocale();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedTemplate = (location.state as { template?: 'figure' | 'bust' } | null)?.template ?? null;
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraAvailable, setCameraAvailable] = useState<boolean | null>(null);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [sweeping, setSweeping] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        streamRef.current = stream;
        setCameraAvailable(true);
      })
      .catch(() => {
        setCameraAvailable(false);
      });

    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  useEffect(() => {
    if (cameraAvailable && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  }, [cameraAvailable]);

  const takePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/png');
    setPhotoDataUrl(dataUrl);
    setPhotoTaken(true);
    console.log('фотография сделана');
  };

  const retake = () => {
    setPhotoTaken(false);
    setPhotoDataUrl(null);
    setSweeping(false);
    setConfirmed(false);
  };

  return (
    <Wrapper>
      <BackgroundGradients />
      {cameraAvailable === false && (
        <NoCameraText $theme={theme}>{t.cameraDisabled}</NoCameraText>
      )}

      {cameraAvailable === true && (
        <CameraContainer>
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <CameraView ref={videoRef} autoPlay playsInline muted style={{ display: photoTaken ? 'none' : 'block' }} />
          {photoTaken && photoDataUrl && (
            <>
              <CameraView as="img" src={photoDataUrl} style={{ display: 'block' }} />
              <SweepOverlay $active={sweeping} />
            </>
          )}

          {!photoTaken ? (
            <ButtonsRow>
              <RoundButton type="button" onClick={takePhoto} aria-label={t.takePhoto}>
                <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M23 7H19.83L18 5H10L8.17 7H5C3.9 7 3 7.9 3 9V21C3 22.1 3.9 23 5 23H23C24.1 23 25 22.1 25 21V9C25 7.9 24.1 7 23 7ZM23 21H5V9H9.05L10.88 7H17.12L18.95 9H23V21ZM14 10C11.24 10 9 12.24 9 15C9 17.76 11.24 20 14 20C16.76 20 19 17.76 19 15C19 12.24 16.76 10 14 10ZM14 18C12.34 18 11 16.66 11 15C11 13.34 12.34 12 14 12C15.66 12 17 13.34 17 15C17 16.66 15.66 18 14 18Z"
                    fill="currentColor"
                  />
                </svg>
              </RoundButton>
            </ButtonsRow>
          ) : !confirmed ? (
            <ButtonsRow>
              <RoundButton type="button" onClick={retake} aria-label={t.retakePhoto}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </RoundButton>
              <RoundButton
                $accent
                type="button"
                onClick={() => {
                  setSweeping(false);
                  requestAnimationFrame(() => setSweeping(true));
                  setConfirmed(true);
                  setTimeout(() => {
                    navigate('/', { state: { selfieDataUrl: photoDataUrl, template: selectedTemplate } });
                  }, 2000);
                }}
                aria-label={t.confirmPhoto}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 12L9.5 17.5L20 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </RoundButton>
            </ButtonsRow>
          ) : null}
        </CameraContainer>
      )}
    </Wrapper>
  );
};

export default SelfiePage;
