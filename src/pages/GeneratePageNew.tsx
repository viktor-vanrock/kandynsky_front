import { ChangeEvent, FC, KeyboardEvent, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { BackgroundGradients } from '../components/background-gradients';
import { MainInput } from '../components/main-input';
import { ModeBar } from '../components/mode-bar';
import { Suggestions } from '../components/suggestions';
import { GenerationSettings } from '../components/generation-settings';
import { useTheme } from '../context';
import { useGeneratePreviewMutation, MeshModels, FrontGenerationType } from '../graphql/graphQlApiHooks.ts';
import { useIframeToken } from '../hooks/useIframeToken.ts';
import { useInIframe } from '../hooks/useInIframe.ts';
import { getSessionToken } from '../utils/session.ts';
import PreviewsPage from './PreviewsPage';
import { useGameDevStore } from '../store/gamedev.ts';
import { QrUploadModal } from '../components/qr-upload-modal/QrUploadModal';

const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_PROMPT_LENGTH = 2000;

const PageContainer = styled.div`
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 1;
  padding-top: 104px;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (max-width: 768px) {
    padding-top: 64px;
    padding-bottom: calc(88px + env(safe-area-inset-bottom));
    min-height: calc(100dvh - 48px);
    display: flex;
    flex-direction: column;
  }
`;

const ErrorMessage = styled.div<{ visible: boolean }>`
  position: fixed;
  bottom: 120px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(255, 59, 48, 0.9);
  color: white;
  padding: 12px 24px;
  border-radius: 12px;
  font-family: 'SB Sans Text', sans-serif;
  font-size: 14px;
  opacity: ${(props) => (props.visible ? 1 : 0)};
  transition: opacity 0.3s ease;
  pointer-events: none;
  z-index: 10000;

  @media (max-width: 768px) {
    bottom: 160px;
  }
`;

const DrawerOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9998;
  opacity: ${(props) => (props.$isOpen ? 1 : 0)};
  visibility: ${(props) => (props.$isOpen ? 'visible' : 'hidden')};
  transition: opacity 0.3s ease, visibility 0.3s ease;
  backdrop-filter: blur(4px);
`;

const Drawer = styled.div<{ $isOpen: boolean; $theme: 'light' | 'dark' }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80vh;
  background: ${(props) => (props.$theme === 'light' ? '#ffffff' : '#1a1a1a')};
  border-radius: 20px 20px 0 0;
  z-index: 9999;
  transform: translateY(${(props) => (props.$isOpen ? '0' : '100%')});
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.2);
`;

const QrCodeButton = styled.img`
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 1000000;
  transition: 0.5s transform ease;
  cursor: pointer;

  &:hover {
    transform: scale(1.1);
  }
`;

const MobileUploadDrawerOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9998;
  opacity: ${(props) => (props.$isOpen ? 1 : 0)};
  visibility: ${(props) => (props.$isOpen ? 'visible' : 'hidden')};
  transition: opacity 0.3s ease, visibility 0.3s ease;
  backdrop-filter: blur(4px);
`;

const MobileUploadDrawer = styled.div<{ $isOpen: boolean; $theme: 'light' | 'dark' }>`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${(props) => (props.$theme === 'light' ? '#ffffff' : '#1a1a1a')};
  border-radius: 20px 20px 0 0;
  z-index: 9999;
  transform: translateY(${(props) => (props.$isOpen ? '0' : '100%')});
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  padding: 12px 24px 48px;
  gap: 20px;
  box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.2);
`;

const MobileUploadHandler = styled.div`
  width: 32px;
  height: 4px;
  border-radius: 16px;
  background-color: rgba(255, 255, 255, 0.28);
  align-self: center;
  flex-shrink: 0;
  cursor: grab;
`

const MobileUploadTitle = styled.p<{ $theme: 'light' | 'dark' }>`
  margin: 0;
  font-family: 'SB Sans Display', sans-serif;
  font-size: 22px;
  font-weight: 600;
  line-height: 28px;
  color: ${(props) => (props.$theme === 'light' ? 'rgba(8, 8, 8, 0.96)' : 'rgba(255, 255, 255, 0.96)')};
`;

const MobileUploadFormats = styled.div<{ $theme: 'light' | 'dark' }>`
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-family: 'SB Sans Text', sans-serif;
  font-size: 14px;
  line-height: 20px;
  color: ${(props) => (props.$theme === 'light' ? 'rgba(8, 8, 8, 0.56)' : 'rgba(255, 255, 255, 0.56)')};

  ul {
    margin: 4px 0 0;
    padding-left: 20px;
  }
`;

const MobileUploadFormatsHighlight = styled.span<{ $theme: 'light' | 'dark' }>`
  color: ${(props) => (props.$theme === 'light' ? 'rgba(8, 8, 8, 0.96)' : '#ffffff')};
`;

const MobileUploadButton = styled.label`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 56px;
  border-radius: 10px;
  background: #3F81FD;
  color: #ffffff;
  font-family: 'SB Sans Text', sans-serif;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
`;

const PrinterDemoModal = styled.div<{ $visible: boolean }>`
  position: fixed;
  inset: 0;
  z-index: 10001;
  background: #111118;
  display: flex;
  flex-direction: column;
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  pointer-events: ${(props) => (props.$visible ? 'auto' : 'none')};
  transition: opacity 0.3s ease;
  overflow-y: auto;
`;

const PrinterDemoClose = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 36px;
  height: 36px;
  border: none;
  background: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.72);
  padding: 0;
`;

const PrinterDemoContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 24px 20px 24px;
  gap: 0;
`;

const PrinterDemoTitle = styled.h2`
  margin: 0 0 28px;
  font-family: 'SB Sans Display', sans-serif;
  font-size: 28px;
  font-weight: 600;
  line-height: 34px;
  color: rgba(255, 255, 255, 0.96);
  max-width: 260px;
`;

const PrinterDemoStep = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);

  &:last-child {
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  }
`;

const PrinterDemoStepImg = styled.img`
  width: 120px;
  height: 88px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
`;

const PrinterDemoStepText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

const PrinterDemoStepTitle = styled.span`
  font-family: 'SB Sans Text', sans-serif;
  font-size: 17px;
  font-weight: 600;
  line-height: 22px;
  color: rgba(255, 255, 255, 0.96);
`;

const PrinterDemoStepDesc = styled.span`
  font-family: 'SB Sans Text', sans-serif;
  font-size: 15px;
  font-weight: 400;
  line-height: 20px;
  color: rgba(255, 255, 255, 0.48);
`;

const PrinterDemoFooter = styled.div`
  padding: 16px 20px calc(32px + env(safe-area-inset-bottom));
  flex-shrink: 0;
`;

const PrinterDemoButton = styled.button`
  width: 100%;
  height: 56px;
  border: none;
  border-radius: 14px;
  background: #3F81FD;
  color: #ffffff;
  font-family: 'SB Sans Text', sans-serif;
  font-size: 17px;
  font-weight: 600;
  cursor: pointer;
`;

const PRINTER_DEMO = import.meta.env.VITE_PRINTER_DEMO === 'true';

const GeneratePageNew: FC = () => {
  console.log('4')
  const navigate = useNavigate();
  const location = useLocation();
  const { theme } = useTheme();
  const [generatePreview] = useGeneratePreviewMutation();
  const inIframe = useInIframe();
  const iframeToken = useIframeToken();
  const {
    selectedMode,
    setSelectedMode,
    setSavedPrompt,
    savedPrompt,
    topology,
    polyCount,
    lod,
    isPolyCountAuto,
    previewNum,
    setPbrMode,
  } = useGameDevStore();

  const [inputValue, setInputValue] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showError, setShowError] = useState('');
  const [isReadyToGenerate] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [selfieTemplate, setSelfieTemplate] = useState<'figure' | 'bust' | null>(null);
  const [isSettingsDrawerOpen, setIsSettingsDrawerOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isMobileUploadDrawerOpen, setIsMobileUploadDrawerOpen] = useState(false);
  const [isPrinterDemoOpen, setIsPrinterDemoOpen] = useState(false);
  const mobileUploadInputRef = useRef<HTMLInputElement>(null);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastSelectedModeRef = useRef<string>('');
  const isDarkTheme = theme === 'dark';

  useEffect(() => {
    const modeChanged = lastSelectedModeRef.current !== selectedMode;
    lastSelectedModeRef.current = selectedMode;

    if (modeChanged && selectedMode === 'gamedev' && savedPrompt) {
      setInputValue((currentValue) => {
        if (!currentValue.trim()) {
          return savedPrompt;
        }
        return currentValue;
      });
    }
  }, [selectedMode, savedPrompt]);

  const handleSetFile = (file: File): boolean => {
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      setShowError('Разрешены только JPG, JPEG, JPE, PNG, GIF лии WEBP');
      setTimeout(() => setShowError(''), 3000);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return false;
    }
    if (file.size > MAX_FILE_SIZE) {
      setShowError(`Максимальный размер файла — ${MAX_FILE_SIZE_MB} МБ`);
      setTimeout(() => setShowError(''), 3000);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return false;
    }
    setSelectedImage(file);
    return true;
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const state = location.state as { selfieDataUrl?: string; template?: 'figure' | 'bust' } | null;
    if (!state?.selfieDataUrl) return;
    fetch(state.selfieDataUrl)
      .then((r) => r.blob())
      .then((blob) => {
        const file = new File([blob], 'selfie.png', { type: 'image/png' });
        setSelectedImage(file);
        if (state.template) setSelfieTemplate(state.template);
        window.history.replaceState({}, '');
      });
  }, [location.state]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('action') === 'mobile-upload' && window.innerWidth <= 768) {
      setIsMobileUploadDrawerOpen(true);
    }
  }, []);

  const adjustTextareaHeight = () => {
    const textarea = inputRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length > MAX_PROMPT_LENGTH) {
      setShowError(`Максимальная длина запроса ${MAX_PROMPT_LENGTH} символов`);
      setInputValue(value.slice(0, MAX_PROMPT_LENGTH));
      setTimeout(() => setShowError(''), 2000);
      return;
    }
    setInputValue(value);
    setShowError('');
    setTimeout(adjustTextareaHeight, 0);

    // сохраняем текст в режиме GameDev
    if (selectedMode === 'gamedev' && value.trim()) {
      setSavedPrompt(value);
    } else if (selectedMode !== 'gamedev') {
      setSavedPrompt(null);
    }
  };

  const getNumTargetFaces = () => {
    if (selectedMode === '3dprint') {
      return 1000000;
    }
    if (selectedMode === 'gamedev') {
      return isPolyCountAuto ? 40000 : polyCount;
    }
    return 40000;
  };

  const getCreateLodValue = () => {
    if (selectedMode === '3dprint') {
      return undefined;
    }
    if (selectedMode === 'gamedev') {
      return lod;
    }
    return 0;
  };

  const shouldQuadrify = () => selectedMode === 'gamedev' && topology === 'quads';

  const doGenerate = async (enableVisualCensor = true, enableTextCensor = true) => {
    const sessionToken = getSessionToken();
    setIsSubmitting(true);
    try {
      const mode = selectedMode === '3dprint' ? MeshModels.TextToGeometry : MeshModels.Xr_3D;
      const numTargetFaces = getNumTargetFaces();
      const createLodValue = getCreateLodValue();
      const previewNumValue = selectedMode === 'gamedev' ? previewNum : undefined;

      const modelFormats = selectedMode === '3dprint' ? ['glb', 'stl'] : undefined;
      const doQuadrification = shouldQuadrify();

      const generationType =
        selectedMode === '3dprint'
          ? FrontGenerationType.Print
          : selectedMode === 'gamedev'
          ? FrontGenerationType.Gamedev
          : FrontGenerationType.Standard;

      const { data, errors } = await generatePreview({
        variables: {
          input: {
            prompt: inputValue,
            token: inIframe ? iframeToken ?? '' : 'captchaToken',
            sessionToken,
            doQuadrification: selectedMode === 'gamedev' ? doQuadrification : undefined,
            num_target_faces: numTargetFaces,
            mode,
            create_lod: createLodValue,
            modelFormats,
            preview_num: previewNumValue,
            generationType,
            enableVisualCensor,
            enableTextCensor,
          },
        },
      });

      if (errors) {
        console.error('[DEBUG GeneratePageNew] GraphQL errors:', errors);
        // Check if this is a censor error with previewId
        const ext = errors[0]?.extensions as
          | { response?: { previewId?: string }; originalError?: { previewId?: string } }
          | undefined;
        const censorPid = ext?.response?.previewId || ext?.originalError?.previewId;
        if (censorPid) {
          setShowError('Сработал фильтр цензуры. Попробуйте перефразировать Ваш запрос.');
          // TODO: add censor popup
          setTimeout(() => setShowError(''), 5000);
          return;
        }
        setShowError('Ошибка при создании превью');
        setTimeout(() => setShowError(''), 3000);
        return;
      }

      if (data?.generatePreview) {
        const previewId = data.generatePreview.id;

        // Для режима 3D печать переходим сразу на /editor с skipPreview
        if (selectedMode === '3dprint') {
          if (PRINTER_DEMO) {
            navigate('/create-print-model', { state: { previewId, prompt: inputValue } });
          } else {
            navigate('/editor', {
              state: {
                previewId,
                order: 0,
                skipPreview: true,
                prompt: inputValue,
                is3DPrintMode: true,
              },
            });
          }
        } else if (selectedMode === 'gamedev') {
          // Для режима GameDev переходим в редактор
          navigate('/editor', {
            state: {
              previewId,
              prompt: inputValue,
              showPreviewModal: previewNum > 1,
              isGameDevMode: true,
            },
          });
        } else {
          navigate(`/${previewId}`);
        }

        setInputValue('');
      } else {
        console.error('[DEBUG GeneratePageNew] No generatePreview in response:', data);
        setShowError('Не удалось получить ID превью');
        setTimeout(() => setShowError(''), 3000);
      }
    } catch (error) {
      console.error('[DEBUG GeneratePageNew] Error in doGenerate:', error);
      // Apollo с errorPolicy='none' бросает ApolloError вместо возврата errors[]
      const gqlExt = (
        error as {
          graphQLErrors?: {
            extensions?: unknown;
          }[];
        }
      )?.graphQLErrors?.[0]?.extensions as
        | { response?: { previewId?: string }; originalError?: { previewId?: string } }
        | undefined;
      const censorPid = gqlExt?.response?.previewId || gqlExt?.originalError?.previewId;
      if (censorPid) {
        setShowError('Сработал фильтр цензуры. Попробуйтеперефразировать Ваш запрос.');
        // TODO: add censor popup
        setTimeout(() => setShowError(''), 5000);
        return;
      }
      setShowError('Ошибка при создании превью');
      setTimeout(() => setShowError(''), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startGeneratePreview = async () => {
    if (!isReadyToGenerate || isSubmitting) return;

    const controlToken = localStorage.getItem('control-token') || sessionStorage.getItem('control-token');
    const enableVisualCensor = controlToken && localStorage.getItem('visualCensor') === 'false' ? false : true;
    const enableTextCensor = controlToken && localStorage.getItem('textCensor') === 'false' ? false : true;

    try {
      if (selectedImage) {
        setIsSubmitting(true);
        const formData = new FormData();
        formData.append('file', selectedImage);

        const sessionToken = getSessionToken();
        formData.append('sessionToken', sessionToken ?? '');
        formData.append('token', inIframe ? iframeToken ?? '' : 'captchaToken');
        formData.append('prompt', inputValue);

        console.log('[DEBUG] Selected mode (image upload):', selectedMode);

        const generationType =
          selectedMode === '3dprint'
            ? FrontGenerationType.Print
            : selectedMode === 'gamedev'
            ? FrontGenerationType.Gamedev
            : FrontGenerationType.Standard;
        formData.append('generationType', generationType);

        // Для режима 3D печати используем xr:image-to-geometry и 1000000 полигонов
        if (selectedMode === '3dprint') {
          formData.append('mode', MeshModels.ImageToGeometry);
          formData.append('numTargetFaces', '1000000');
          formData.append('modelFormats', 'glb');
          formData.append('modelFormats', 'stl');

          console.log('[DEBUG] Appending mode: xr:image-to-geometry, numTargetFaces: 1000000');
        } else if (selectedMode === 'gamedev') {
          formData.append('mode', MeshModels.Xr_3D);
          formData.append('doQuadrification', shouldQuadrify() ? 'true' : 'false');
          const targetFaces = getNumTargetFaces();
          formData.append('numTargetFaces', targetFaces.toString());
          formData.append('createLod', getCreateLodValue()?.toString() ?? '0');
          formData.append('previewNum', previewNum.toString());
        } else {
          formData.append('mode', MeshModels.Xr_3D);
          formData.append('numTargetFaces', '40000');
          formData.append('createLod', '0');
          formData.append('doQuadrification', 'false');
          console.log('[DEBUG] Appending numTargetFaces: 40000');
        }

        formData.append('enableVisualCensor', enableVisualCensor ? 'true' : 'false');
        formData.append('enableTextCensor', enableTextCensor ? 'true' : 'false');

        const res = await fetch(
          `${import.meta.env.VITE_SERVER_URL ? import.meta.env.VITE_SERVER_URL : '/api'}/upload/image`,
          {
            method: 'POST',
            body: formData,
          },
        );

        if (!res.ok) {
          // Check if it's a censor error from image upload
          try {
            const errData = await res.json();
            if (errData?.previewId) {
              setShowError(
                'Сработал фильтр цензуры. Попробуйте перефразировать Ваш запрос или пришлите другое изображение.',
              );
              // TODO: add censor popup
              setTimeout(() => setShowError(''), 5000);
              return;
            }
          } catch (_) {
            // not JSON, fall through
          }
          throw new Error('Ошибка загрузки файла');
        }

        const data = await res.text();
        const parsed = data ? JSON.parse(data) : null;

        if (parsed?.previewId) {
          const previewId = parsed.previewId;

          // Для режима 3D печать переходим сразу на /editor с skipPreview
          if (selectedMode === '3dprint') {
            navigate('/editor', {
              state: {
                previewId,
                order: 0,
                skipPreview: true,
                is3DPrintMode: true,
              },
            });
          } else if (selectedMode === 'gamedev') {
            // Для режима GameDev переходим в редактор
            navigate('/editor', {
              state: {
                previewId,
                showPreviewModal: previewNum > 1,
                isGameDevMode: true,
                order: 0,
                skipPreview: true,
              },
            });
          } else {
            navigate(`/${previewId}/0`);
          }

          setSelectedImage(null);
        }
      } else {
        if (!inputValue.trim()) return;
        await doGenerate(enableVisualCensor, enableTextCensor);
      }
    } catch (err) {
      setShowError('Ошибка при создании');
      console.error(err);
      setTimeout(() => setShowError(''), 2000);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      startGeneratePreview();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    setTimeout(adjustTextareaHeight, 0);
    inputRef.current?.focus();

    // сохраняем текст в режиме gamedev
    if (selectedMode === 'gamedev' && suggestion.trim()) {
      setSavedPrompt(suggestion);
    }
  };

  const handleModeChange = (modeId: string) => {
    setSelectedMode(modeId);
    if (modeId !== 'gamedev') {
      setSavedPrompt(null);
      setPbrMode('pbr');
    } else if (inputValue.trim()) {
      setSavedPrompt(inputValue);
    }
  };

  return (
    <>
      <PageContainer>
        <BackgroundGradients mode={selectedMode as 'standard' | 'gamedev' | '3dprint'} />

        <ContentWrapper>
          <ModeBar selectedMode={selectedMode} onModeChange={handleModeChange} theme={theme} />
          <MainInput
            theme={theme}
            inputValue={inputValue}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            onSubmit={startGeneratePreview}
            onFileChange={handleSetFile}
            onClearImage={() => { handleClearImage(); setSelfieTemplate(null); }}
            selectedImage={selectedImage}
            initialTemplate={selfieTemplate}
            isSubmitting={isSubmitting}
            isReadyToGenerate={isReadyToGenerate}
            hasContent={!!selectedImage}
            inputRef={inputRef}
            fileInputRef={fileInputRef}
            selectedMode={selectedMode}
            onSettingsClick={() => setIsSettingsDrawerOpen(true)}
          >
            {!inputValue && !selectedImage && selectedMode !== 'gamedev' && selectedMode !== '3dprint' && selectedMode !== 'cad' && (
              <Suggestions isMobile={isMobile} onSuggestionClick={handleSuggestionClick} />
            )}
          </MainInput>

          {selectedMode === 'cad' && (
              <iframe
                src={`https://ai-reverse.sberai.dev/?__theme=${theme}`}
                style={{ width: '100%', height: '130vh', border: 'none' }}
                allow="fullscreen"
              />
            )}
        </ContentWrapper>

        <ErrorMessage visible={!!showError}>{showError || ' '}</ErrorMessage>

        {selectedMode === 'gamedev' && <GenerationSettings hasSelectedFile={!!selectedImage} />}

        <PreviewsPage onMain={true} />

        {/* Settings Drawer for Mobile */}
        <DrawerOverlay $isOpen={isSettingsDrawerOpen} onClick={() => setIsSettingsDrawerOpen(false)} />
        <Drawer $isOpen={isSettingsDrawerOpen} $theme={theme}>
          <GenerationSettings
            hideRightBlock={true}
            isInDrawer={true}
            onClose={() => setIsSettingsDrawerOpen(false)}
            hasSelectedFile={!!selectedImage}
          />
        </Drawer>
        {!isMobile && (
          <QrCodeButton
            src={theme === 'light' ? '/img/qr-light.png' : '/img/qr-dark.png'}
            alt="Загрузить с телефона"
            onClick={() => setIsQrModalOpen(true)}
          />
        )}

        {/* Mobile upload drawer (открывается по QR-ссылке на телефоне) */}
        <MobileUploadDrawerOverlay
          $isOpen={isMobileUploadDrawerOpen}
          onClick={() => setIsMobileUploadDrawerOpen(false)}
        />
        <MobileUploadDrawer
          $isOpen={isMobileUploadDrawerOpen}
          $theme={theme}
          onTouchStart={(e) => {
            const startY = e.touches[0].clientY;
            const el = e.currentTarget;
            const onMove = (ev: TouchEvent) => {
              const dy = ev.touches[0].clientY - startY;
              if (dy > 0) el.style.transform = `translateY(${dy}px)`;
            };
            const onEnd = (ev: TouchEvent) => {
              const dy = ev.changedTouches[0].clientY - startY;
              el.style.transform = '';
              if (dy > 80) setIsMobileUploadDrawerOpen(false);
              el.removeEventListener('touchmove', onMove);
              el.removeEventListener('touchend', onEnd);
            };
            el.addEventListener('touchmove', onMove);
            el.addEventListener('touchend', onEnd);
          }}
        >
          <MobileUploadHandler />
          <MobileUploadTitle $theme={theme}>Добавьте вашу модель</MobileUploadTitle>
          <MobileUploadFormats $theme={theme}>
            <MobileUploadFormatsHighlight $theme={theme}>
              Требования к файлам:
              <ul>
                <li>Форматы: JPG (JPEG, JPE), PNG, GIF</li>
                <li>Максимальный размер: 20 МБ</li>
                <li>Максимум 1 файл за раз</li>
              </ul>
            </MobileUploadFormatsHighlight>
            Недопустимы изображения с запрещённым контентом
          </MobileUploadFormats>
          <MobileUploadButton htmlFor="mobile-upload-input">
            Загрузить файл
          </MobileUploadButton>
          <input
            id="mobile-upload-input"
            ref={mobileUploadInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/jpe,image/gif,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && handleSetFile(file)) {
                setIsMobileUploadDrawerOpen(false);
                if (PRINTER_DEMO) {
                  setIsPrinterDemoOpen(true);
                } else {
                  navigate('/printer');
                }
              }
            }}
          />
        </MobileUploadDrawer>
      </PageContainer>

      <QrUploadModal open={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} theme={theme} />

      <PrinterDemoModal $visible={isPrinterDemoOpen}>
        <PrinterDemoClose onClick={() => setIsPrinterDemoOpen(false)} aria-label="Закрыть">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M2 2L18 18M18 2L2 18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
        </PrinterDemoClose>
        <PrinterDemoContent>
          <PrinterDemoTitle>Как получить красивую модель для печати?</PrinterDemoTitle>
          <PrinterDemoStep>
            <PrinterDemoStepImg src="/img/card1.png" alt="Шаг 1" />
            <PrinterDemoStepText>
              <PrinterDemoStepTitle>Шаг 1. Опишите объект</PrinterDemoStepTitle>
              <PrinterDemoStepDesc>или загрузите изображение — нажмите «Сгенерировать»</PrinterDemoStepDesc>
            </PrinterDemoStepText>
          </PrinterDemoStep>
          <PrinterDemoStep>
            <PrinterDemoStepImg src="/img/card2.png" alt="Шаг 2" />
            <PrinterDemoStepText>
              <PrinterDemoStepTitle>Шаг 2. Подождите, пока модель сгенерируется,</PrinterDemoStepTitle>
              <PrinterDemoStepDesc>затем скачайте её в формате STL</PrinterDemoStepDesc>
            </PrinterDemoStepText>
          </PrinterDemoStep>
          <PrinterDemoStep>
            <PrinterDemoStepImg src="/img/card3.png" alt="Шаг 3" />
            <PrinterDemoStepText>
              <PrinterDemoStepTitle>Шаг 3. Отправьте модель на печать</PrinterDemoStepTitle>
              <PrinterDemoStepDesc>в свой 3D-принтер или закажите печать в студиях печати</PrinterDemoStepDesc>
            </PrinterDemoStepText>
          </PrinterDemoStep>
        </PrinterDemoContent>
        <PrinterDemoFooter>
          <PrinterDemoButton onClick={() => { setIsPrinterDemoOpen(false); handleModeChange('3dprint'); }}>
            Попробовать
          </PrinterDemoButton>
        </PrinterDemoFooter>
      </PrinterDemoModal>
    </>
  );
};

export default GeneratePageNew;
