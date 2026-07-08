import React, { useState, useEffect, useCallback } from 'react';
import './kiosk.css';
import {
  GenerationStatus,
  MeshModels,
  FrontGenerationType,
  useGeneratePreviewMutation,
  useOnPreviewStatusChangedSubscription,
  useOnMeshStatusChangedSubscription,
} from '../../graphql/graphQlApiHooks.ts';
import { getSessionToken } from '../../utils/session.ts';
import { uploadGcode, startPrint } from './components/klipper.js';
import { AmbientBG } from './components/ambient-bg.jsx';
import { ScreenTransition } from './components/screen-transition.jsx';
import { GlobalPrinterStatus } from './components/global-status.jsx';
import HomeScreen from './screens/screens-home.jsx';
import GenerateScreen from './screens/screens-generate.jsx';
import GeneratingScreen from './screens/screens-generating.jsx';
import PreviewScreen from './screens/screens-preview.jsx';
import SentScreen from './screens/screens-sent.jsx';
import { PrintingScreen, DoneScreen } from './screens/screens-print.jsx';

type KioskScreen = 'home' | 'generate' | 'generating' | 'preview' | 'sent' | 'printing' | 'done';

const ACCENT = '#3DDC84';
const SIZE_MINS: Record<string, number> = { S: 55, M: 90, L: 145 };

const KioskPage: React.FC = () => {
  const [screen, setScreen] = useState<KioskScreen>('home');
  const [prompt, setPrompt] = useState('');
  const [previewId, setPreviewId] = useState<string | null>(null);
  const [meshRequestId, setMeshRequestId] = useState<string | null>(null);
  const [stlUrl, setStlUrl] = useState<string | null>(null);
  const [glbUrl, setGlbUrl] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [estimationSeconds, setEstimationSeconds] = useState<number | null>(null);
  const [slicing, setSlicing] = useState(false);
  const [slicingError, setSlicingError] = useState<string | null>(null);
  const [printJob, setPrintJob] = useState<{ startTime: number; size: string; printMins: number } | null>(null);
  const [requestConnect, setRequestConnect] = useState(false);

  const [generatePreview] = useGeneratePreviewMutation();

  const { data: previewData } = useOnPreviewStatusChangedSubscription({
    variables: { id: previewId || '' },
    skip: !previewId || screen !== 'generating',
  });

  const { data: meshData } = useOnMeshStatusChangedSubscription({
    variables: { id: meshRequestId || '' },
    skip: !meshRequestId || screen !== 'generating',
  });

  // Extract meshRequestId from preview subscription
  useEffect(() => {
    const preview = previewData?.previewStatusChanged;
    if (!preview) return;

    if (
      preview.status === GenerationStatus.Cancelled ||
      preview.status === GenerationStatus.CancelledValidation
    ) {
      setGenError(preview.errorMessage || 'Генерация была отменена');
      return;
    }

    if (preview.readyEstimationSeconds) {
      setEstimationSeconds(preview.readyEstimationSeconds);
    }

    const firstMesh = preview.images[0]?.meshRequests?.[0];
    if (firstMesh?.id && !meshRequestId) {
      setMeshRequestId(firstMesh.id);
      if (firstMesh.readyEstimationSeconds) {
        setEstimationSeconds(firstMesh.readyEstimationSeconds);
      }
    }
  }, [previewData, meshRequestId]);

  // Handle mesh status changes → transition to preview when Ready
  useEffect(() => {
    const mesh = meshData?.meshStatusChanged;
    if (!mesh) return;

    if (
      mesh.status === GenerationStatus.Cancelled ||
      mesh.status === GenerationStatus.CancelledValidation
    ) {
      setGenError(mesh.errorMessage || 'Генерация модели была отменена');
      return;
    }

    if (mesh.readyEstimationSeconds) {
      setEstimationSeconds(mesh.readyEstimationSeconds);
    }

    if (mesh.status === GenerationStatus.Ready && mesh.meshFormats) {
      const glb = mesh.meshFormats.find((f) => f.format.name === 'glb')?.url ?? null;
      const stl = mesh.meshFormats.find((f) => f.format.name === 'stl')?.url ?? null;
      setGlbUrl(glb);
      setStlUrl(stl);
      setScreen('preview');
    }
  }, [meshData]);

  const resetGenerationState = useCallback(() => {
    setPreviewId(null);
    setMeshRequestId(null);
    setStlUrl(null);
    setGlbUrl(null);
    setGenError(null);
    setEstimationSeconds(null);
  }, []);

  const resetAll = useCallback(() => {
    setPrompt('');
    resetGenerationState();
    setSlicing(false);
    setSlicingError(null);
    setPrintJob(null);
  }, [resetGenerationState]);

  const handleGenerate = useCallback(async (text: string) => {
    setPrompt(text);
    resetGenerationState();
    setScreen('generating');

    try {
      const sessionToken = getSessionToken() ?? '';
      const { data, errors } = await generatePreview({
        variables: {
          input: {
            prompt: text,
            token: 'captchaToken',
            sessionToken,
            mode: MeshModels.TextToGeometry,
            generationType: FrontGenerationType.Print,
            modelFormats: ['glb', 'stl'],
            num_target_faces: 1000000,
          },
        },
      });

      if (errors) {
        setGenError(errors[0]?.message || 'Ошибка при запуске генерации');
        return;
      }

      if (data?.generatePreview?.id) {
        setPreviewId(data.generatePreview.id);
        if (data.generatePreview.readyEstimationSeconds) {
          setEstimationSeconds(data.generatePreview.readyEstimationSeconds);
        }
      }
    } catch (e: unknown) {
      const err = e as { message?: string };
      setGenError(err.message || 'Ошибка соединения с сервером');
    }
  }, [generatePreview, resetGenerationState]);

  const handleSendToPrint = useCallback(async (size: string) => {
    const printerIp = localStorage.getItem('k3d_printer_ip');
    if (!printerIp) {
      setRequestConnect(true);
      return;
    }

    if (!stlUrl) {
      setSlicingError('STL-файл недоступен');
      return;
    }

    setSlicing(true);
    setSlicingError(null);

    try {
      const slicerUrl = (import.meta as { env: Record<string, string> }).env.VITE_SLICER_URL || 'https://178.170.195.13:8080';
      const resp = await fetch(`${slicerUrl}/slice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: stlUrl }),
      });

      if (!resp.ok) {
        throw new Error(`Слайсер вернул ошибку ${resp.status}`);
      }

      const gcodeBlob = await resp.blob();
      const printerPort = localStorage.getItem('k3d_printer_port') || '7125';

      await uploadGcode(printerIp, printerPort, gcodeBlob, 'print.gcode');
      await startPrint(printerIp, printerPort, 'print.gcode');

      const printMins = SIZE_MINS[size] ?? 90;
      setPrintJob({ startTime: Date.now(), size, printMins });
      setScreen('sent');
    } catch (e: unknown) {
      const err = e as { message?: string };
      setSlicingError(err.message || 'Не удалось подключиться к слайсеру');
    } finally {
      setSlicing(false);
    }
  }, [stlUrl]);

  const renderScreen = useCallback((s: string) => {
    switch (s) {
      case 'home':
        return <HomeScreen onGenerate={() => setScreen('generate')} onPick={() => {}} accent={ACCENT} />;

      case 'generate':
        return (
          <GenerateScreen
            onBack={() => setScreen('home')}
            onSubmit={handleGenerate}
            accent={ACCENT}
          />
        );

      case 'generating':
        return (
          <GeneratingScreen
            prompt={prompt}
            estimationSeconds={estimationSeconds}
            error={genError}
            onBack={genError ? () => handleGenerate(prompt) : () => setScreen('generate')}
            accent={ACCENT}
          />
        );

      case 'preview':
        return (
          <PreviewScreen
            prompt={prompt}
            glbUrl={glbUrl}
            onBack={() => setScreen('generate')}
            onPrint={handleSendToPrint}
            slicing={slicing}
            slicingError={slicingError}
            onRetryPrint={() => setSlicingError(null)}
            accent={ACCENT}
          />
        );

      case 'sent':
        return (
          <SentScreen
            prompt={prompt}
            size={printJob?.size ?? 'M'}
            printMins={printJob?.printMins ?? 90}
            onHome={() => { setScreen('home'); resetAll(); }}
            accent={ACCENT}
          />
        );

      case 'printing':
        return (
          <PrintingScreen
            prompt={prompt}
            startTime={printJob?.startTime}
            printMins={printJob?.printMins ?? 90}
            onDone={() => setScreen('done')}
            onHome={() => { setScreen('home'); resetAll(); }}
            onCancel={() => { setScreen('home'); resetAll(); }}
            accent={ACCENT}
          />
        );

      case 'done':
        return (
          <DoneScreen
            prompt={prompt}
            onHome={() => { setScreen('home'); resetAll(); }}
            accent={ACCENT}
          />
        );

      default:
        return null;
    }
  }, [
    prompt, estimationSeconds, genError, glbUrl,
    slicing, slicingError, printJob,
    handleGenerate, handleSendToPrint, resetAll,
  ]);

  return (
    <div className="kiosk-root">
      <AmbientBG />
      <GlobalPrinterStatus
        screen={screen}
        printing={screen === 'printing'}
        requestConnect={requestConnect}
        onRequestConnectHandled={() => setRequestConnect(false)}
      />
      <ScreenTransition screen={screen} model={null}>
        {renderScreen}
      </ScreenTransition>
    </div>
  );
};

export default KioskPage;
