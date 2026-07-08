import React, { FC, Suspense, useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { SoftShadows, TransformControls } from '@react-three/drei';
import { OptimizedGrid } from './OptimizedGrid';
import * as THREE from 'three';
import type { TransformControls as TransformControlsImpl } from 'three-stdlib';

import styles from './ModelViewer.module.css';
import { ErrorBoundary } from '../error-boundary';
import { ReflectiveFloor } from './ReflectiveFloor';
import { LoadedModel } from './LoadedModel';
import { CustomOrbitControls } from './CustomOrbitControls';
import { HdriLoader } from './HdriLoader';

import { useViewerStore } from '../../store/viewer';
import { OrbitControls } from 'three-stdlib';
import { DashedSectionLines } from './DashedSectionLines';
import { useTheme } from '../../context/ThemeContext';
import { MeshRequestEntity } from '../../graphql/graphQlApiHooks';

type SceneProps = {
  isCameraOn: boolean;
  autoRotate: boolean;
  modelUrl?: string;
  isMobile: boolean;
  modelGroupRef: React.MutableRefObject<THREE.Group | null>;
  controlsRef: React.MutableRefObject<OrbitControls | null>;
  webglCanvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  videoElRef: React.MutableRefObject<HTMLVideoElement | null>;
  onAnalyze: (minY: number, polygonCount: number) => void;
  onRenderError: () => void;
  onRendered?: () => void;
  exposure?: number;
  showGrid?: boolean;
  noCanvasOffset?: boolean;
  modelOffsetY?: number;
  showThickAxes?: boolean;
  transformMode?: 'translate' | 'rotate' | 'scale' | undefined;
  transformSpace?: 'world' | 'local';
  restoreOnCameraOff?: boolean;
  isModelReady?: boolean;
  lodLevel?: number;
  onLodLevelsDetected?: (levels: number[]) => void;
  onPolygonCountChange?: (polygonCount: number) => void;
  modelInfo?: MeshRequestEntity | null;
  doQuadrification?: boolean;
  isGameDevMode?: boolean;
};

export const Scene: FC<SceneProps> = ({
  isCameraOn,
  autoRotate,
  modelUrl,
  isMobile,
  modelGroupRef,
  controlsRef,
  webglCanvasRef,
  videoElRef,
  onAnalyze,
  onRenderError,
  onRendered,
  exposure = 1.0,
  showGrid = false,
  noCanvasOffset = false,
  modelOffsetY = 0,
  showThickAxes = true,
  transformMode,
  transformSpace = 'world',
  restoreOnCameraOff = false,
  isModelReady = true,
  lodLevel,
  onLodLevelsDetected,
  onPolygonCountChange,
  modelInfo,
  doQuadrification,
  isGameDevMode = false,
}) => {
  const { theme } = useTheme();
  const [gridVars, setGridVars] = useState({
    gridColor: '#707070',
    sectionColor: '#707070',
    dashedColor: '#727272',
    axisX: '#ff0000',
    axisY: '#34C759',
    axisZ: '#0A84FF',
  });
  const hdrMap = useViewerStore((s) => s.hdrMap);
  const [placing, setPlacing] = useState(false);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const raycasterRef = useRef(new THREE.Raycaster());
  const ndcRef = useRef(new THREE.Vector2());
  const hitRef = useRef(new THREE.Vector3());
  const pointerDownXY = useRef<{ x: number; y: number } | null>(null);
  const prevModeRef = useRef<typeof transformMode>();
  const isRotatingRef = useRef(false);
  const prevModelUrlRef = useRef<string | undefined>(undefined);
  const modelOffsetYSetRef = useRef<boolean>(false);
  const modelOffsetYRef = useRef<number>(modelOffsetY);
  const [modelScaleVec, setModelScaleVec] = useState<[number, number, number]>([1, 1, 1]);
  const [modelPosition, setModelPosition] = useState<[number, number, number]>([0, 0, 0]);
  const [modelRotation, setModelRotation] = useState<[number, number, number]>([0, 0, 0]);
  const savedTransformRef = useRef<{
    pos: [number, number, number];
    rot: [number, number, number];
    scale: [number, number, number];
    has: boolean;
  }>({ pos: [0, 0, 0], rot: [0, 0, 0], scale: [1, 1, 1], has: false });

  const ambientRef = useRef<THREE.AmbientLight>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const baseExposure = useMemo(() => (hdrMap.value ? 1.0 : 1.5), [hdrMap.value]);

  const readThemeVars = useCallback(() => {
    // берём ближайший контейнер с data-theme вокруг canvas
    const canvasEl = rendererRef.current?.domElement as HTMLCanvasElement | undefined;
    const host =
      (canvasEl?.parentElement?.closest('[data-theme]') as HTMLElement) ||
      (document.querySelector('[data-theme]') as HTMLElement) ||
      document.body;

    const cs = getComputedStyle(host);
    const val = (name: string, fb: string) => cs.getPropertyValue(name).trim() || fb;

    setGridVars({
      gridColor: val('--grid-color', '#707070'),
      sectionColor: val('--grid-section', '#707070'),
      dashedColor: val('--grid-dash', '#727272'),
      axisX: val('--axis-x', '#ff0000'),
      axisY: val('--axis-y', '#34C759'),
      axisZ: val('--axis-z', '#0A84FF'),
    });
  }, []);

  useEffect(() => {
    readThemeVars();
  }, [theme, readThemeVars]);

  const ROTATE_SENS = 0.008;
  const CLICK_THRESHOLD_PX = 4;

  const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
  const groundPlane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);

  const screenParallelPlane = useCallback(() => {
    if (!cameraRef.current) return groundPlane;
    const camDir = new THREE.Vector3();
    cameraRef.current.getWorldDirection(camDir).normalize();
    const plane = new THREE.Plane();
    plane.setFromNormalAndCoplanarPoint(camDir, new THREE.Vector3(...modelPosition));
    return plane;
  }, [groundPlane, modelPosition]);

  useEffect(() => {
    if (ambientRef.current) {
      ambientRef.current.intensity = hdrMap.value ? 1.6 : 1.0;
    }
  }, [hdrMap.value]);

  useEffect(() => {
    if (!rendererRef.current) return;
    rendererRef.current.toneMappingExposure = baseExposure * exposure;
  }, [baseExposure, exposure]);

  // отключаем OrbitControls если активен TransformControls
  useEffect(() => {
    if (!controlsRef.current) return;
    controlsRef.current.enabled = !transformMode && !isCameraOn && !placing;
  }, [transformMode, isCameraOn, placing, controlsRef]);

  useEffect(() => {
    if (!modelUrl) return;
    if (prevModelUrlRef.current !== modelUrl) {
      const wasUrlChanged = prevModelUrlRef.current !== undefined;
      prevModelUrlRef.current = modelUrl;
      modelOffsetYSetRef.current = false;
      if (!wasUrlChanged || (!modelOffsetYSetRef.current && modelOffsetYRef.current === 0)) {
        setModelPosition([0, 0, 0]);
        setModelRotation([0, 0, 0]);
        setModelScaleVec([0.6, 0.6, 0.6]);
        if (controlsRef.current?.target) {
          controlsRef.current.target.set(0, 0, 0);
          controlsRef.current.update?.();
        }
      }
    }
  }, [modelUrl, controlsRef]);

  useEffect(() => {
    const onOffsetSet = () => {
      modelOffsetYSetRef.current = true;
    };
    window.addEventListener('model-offset-set', onOffsetSet);
    return () => window.removeEventListener('model-offset-set', onOffsetSet);
  }, []);

  // синхронизируем пространство трансформации
  useEffect(() => {
    if (!transformRef.current) return;
    transformRef.current.setSpace?.(transformSpace); // 'world' | 'local'
  }, [transformSpace]);

  useEffect(() => {
    if (!modelGroupRef?.current) return;
    modelGroupRef.current.up.set(0, 1, 0);
  }, [modelGroupRef]);

  useEffect(() => {
    const model = modelGroupRef.current;

    if (!transformMode) {
      setTcObject(null);
      return;
    }

    if (!model) {
      setTcObject(null);
      return;
    }

    // Всегда привязываем gizmo к модели
    setTcObject(model);
  }, [transformMode, modelUrl, modelGroupRef]);

  // Сохраняем трансформацию вокруг режима камеры
  useEffect(() => {
    if (!restoreOnCameraOff) return;
    if (isCameraOn) {
      savedTransformRef.current = {
        pos: [...modelPosition],
        rot: [...modelRotation],
        scale: [...modelScaleVec],
        has: true,
      };
    } else if (savedTransformRef.current.has) {
      const { pos, rot, scale } = savedTransformRef.current;
      setModelPosition(pos);
      setModelRotation(rot);
      setModelScaleVec([...scale]);
      controlsRef.current?.target?.set(0, 0, 0);
      controlsRef.current?.update?.();
    }
  }, [isCameraOn, restoreOnCameraOff, modelPosition, modelRotation, modelScaleVec, controlsRef]);

  useEffect(() => {
    if (!transformMode) return;
    const obj = modelGroupRef.current;
    if (!obj) return;
    obj.position.set(modelPosition[0], modelPosition[1] + modelOffsetY, modelPosition[2]);
    obj.rotation.set(modelRotation[0], modelRotation[1], modelRotation[2]);
    obj.scale.set(modelScaleVec[0], modelScaleVec[1], modelScaleVec[2]);
  }, [transformMode, modelPosition, modelRotation, modelScaleVec, modelOffsetY, modelGroupRef]);

  // Обновляем ref при изменении modelOffsetY
  useEffect(() => {
    modelOffsetYRef.current = modelOffsetY;
  }, [modelOffsetY]);

  const commitFromObject = useCallback(() => {
    const model = modelGroupRef.current;
    if (!model) return;

    if (!modelOffsetYSetRef.current && modelOffsetYRef.current !== 0) {
      return;
    }

    const currentY = model.position.y;
    const baseY = currentY - modelOffsetYRef.current;
    setModelPosition([model.position.x, baseY, model.position.z]);
    setModelRotation([model.rotation.x, model.rotation.y, model.rotation.z]);
    const clamp01 = (v: number) => Math.min(4, Math.max(0.001, v));
    setModelScaleVec([clamp01(model.scale.x), clamp01(model.scale.y), clamp01(model.scale.z)]);
  }, [modelGroupRef]);

  // коммит по Esc
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') commitFromObject();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [commitFromObject]);

  // коммит пользовательскому событию из EditorPage
  useEffect(() => {
    const onCommit = () => commitFromObject();
    window.addEventListener('commit-transform', onCommit);
    return () => window.removeEventListener('commit-transform', onCommit);
  }, [commitFromObject]);

  useEffect(() => {
    const was = prevModeRef.current;
    if (was && !transformMode) {
      commitFromObject();
    }
    prevModeRef.current = transformMode;
  }, [transformMode, commitFromObject]);

  const transformRef = useRef<TransformControlsImpl | null>(null);
  const worldWrapperRef = useRef<THREE.Group | null>(null);
  const [tcObject, setTcObject] = useState<THREE.Object3D | null>(null);

  // блочим хоткеи TransformControls (Q/E/W/R/X/Y/Z/Space)
  // чтобы не конфликтовало с вводом в textarea
  useEffect(() => {
    const isTyping = (t: EventTarget | null) => {
      const el = t as HTMLElement | null;
      return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
    };

    const blockKeys = (e: KeyboardEvent) => {
      // если пользователь печатает в поле ввода то не блокируем
      if (isTyping(e.target)) return;
      const k = e.key.toLowerCase();
      if (k === 'q' || k === 'e' || k === 'w' || k === 'r' || k === 'x' || k === 'y' || k === 'z' || k === ' ') {
        e.preventDefault();
        e.stopImmediatePropagation?.();
        e.stopPropagation();
      }
    };
    document.addEventListener('keydown', blockKeys, true);
    document.addEventListener('keyup', blockKeys, true);
    return () => {
      document.removeEventListener('keydown', blockKeys, true);
      document.removeEventListener('keyup', blockKeys, true);
    };
  }, []);

  const VideoBackground = ({ isOn, forwardRef }: { isOn: boolean; forwardRef: React.RefObject<HTMLVideoElement> }) => {
    const streamRef = useRef<MediaStream | null>(null);
    const isStand = typeof localStorage !== 'undefined' ? localStorage.getItem('demonstration') : null;

    useEffect(() => {
      if (!isStand) return;

      const start = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1920 },
              height: { ideal: 1080 },
              aspectRatio: { ideal: 16 / 9 },
              resizeMode: 'none',
              frameRate: { ideal: 30 },
            },
            audio: false,
          });
          const [track] = stream.getVideoTracks();
          const caps = track.getCapabilities?.() ?? {};
          if (caps && 'zoom' in caps) {
            try {
              await track.applyConstraints({ advanced: [{ zoom: 1 }] });
            } catch (e) {
              console.log('unable to apply zoom contraints');
            }
          }

          streamRef.current = stream;
          if (forwardRef.current) {
            forwardRef.current.srcObject = stream;
            await forwardRef.current.play();
          }
        } catch (e) {
          console.error('camera error', e);
        }
      };

      const stop = () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
        if (forwardRef.current) {
          forwardRef.current.srcObject = null;
        }
      };

      if (isOn) start();
      else stop();

      return () => stop();
    }, [isOn, forwardRef, isStand]);

    if (!isStand || !isOn) return null;

    return (
      <video
        id="ar-video-bg"
        ref={forwardRef}
        autoPlay
        muted
        playsInline
        className={styles.arVideoBg}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
          zIndex: 0,
          willChange: 'transform, opacity',
          transform: 'translateZ(0)',
          pointerEvents: 'none',
        }}
      />
    );
  };

  const AXIS_COLORS = { X: gridVars.axisX, Y: gridVars.axisY, Z: gridVars.axisZ };
  const AxisRays: FC<{ length?: number; thickness?: number }> = ({ length = 2, thickness = 0.02 }) => (
    <group>
      {/* Ось X */}
      <mesh position={[length / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[thickness, thickness, length, 16]} />
        <meshStandardMaterial color={AXIS_COLORS.X} />
      </mesh>
      {/* Ось Y */}
      <mesh position={[0, length / 2, 0]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[thickness, thickness, length, 16]} />
        <meshStandardMaterial color={AXIS_COLORS.Y} />
      </mesh>
      {/* Ось Z */}
      <mesh position={[0, 0, length / 2]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[thickness, thickness, length, 16]} />
        <meshStandardMaterial color={AXIS_COLORS.Z} />
      </mesh>
    </group>
  );

  return (
    <ErrorBoundary onError={onRenderError}>
      <Suspense fallback={null}>
        <VideoBackground isOn={isCameraOn} forwardRef={videoElRef} />

        <Canvas
          dpr={[1, 1.5]}
          shadows
          className={styles.canvas}
          style={{
            background: 'transparent',
            position: 'relative',
            zIndex: 0,
            cursor: 'grab',
            transform: noCanvasOffset ? 'none' : undefined,
          }}
          camera={{ position: [0, 1.5, 3.8], fov: 40 }}
          onPointerDown={(e) => {
            if (!cameraRef.current || !isCameraOn) return;
            isRotatingRef.current = false;
            pointerDownXY.current = { x: e.clientX, y: e.clientY };
          }}
          onPointerMove={(e) => {
            if (!isCameraOn || !modelGroupRef.current || !pointerDownXY.current) return;
            const dx = e.clientX - pointerDownXY.current.x;
            const dy = e.clientY - pointerDownXY.current.y;
            if (!isRotatingRef.current && Math.hypot(dx, dy) > CLICK_THRESHOLD_PX) {
              isRotatingRef.current = true;
            }
            if (isRotatingRef.current) {
              modelGroupRef.current.rotation.y += dx * ROTATE_SENS;
              const nextX = modelGroupRef.current.rotation.x - dy * ROTATE_SENS * 0.5;
              modelGroupRef.current.rotation.x = THREE.MathUtils.clamp(nextX, -Math.PI / 2, Math.PI / 2);
              pointerDownXY.current = { x: e.clientX, y: e.clientY };
            }
          }}
          onWheel={(e) => {
            if (!isCameraOn) return;
            const factor = Math.exp(-e.deltaY * 0.001);
            setModelScaleVec(([sx, sy, sz]) => {
              const nx = clamp(sx * factor, 0.2, 4);
              const ny = clamp(sy * factor, 0.2, 4);
              const nz = clamp(sz * factor, 0.2, 4);
              return [nx, ny, nz];
            });
            e.preventDefault();
          }}
          onPointerUp={(e) => {
            if (!cameraRef.current || !isCameraOn) {
              pointerDownXY.current = null;
              isRotatingRef.current = false;
              return;
            }
            pointerDownXY.current = null;
            const didRotate = isRotatingRef.current;
            isRotatingRef.current = false;

            if (!didRotate) {
              const canvasEl = rendererRef.current?.domElement;
              if (!canvasEl) return;
              const rect = canvasEl.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
              const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
              ndcRef.current.set(x, y);
              raycasterRef.current.setFromCamera(ndcRef.current, cameraRef.current);

              const plane = screenParallelPlane();
              const hit = raycasterRef.current.ray.intersectPlane(plane, hitRef.current);

              if (hit) {
                setModelPosition([hit.x, hit.y, hit.z]);
                setPlacing(true);
                requestAnimationFrame(() => setPlacing(false));
              }
            }
          }}
          gl={{
            alpha: true,
            antialias: true,
            premultipliedAlpha: true,
            // preserveDrawingBuffer: true,
            powerPreference: 'high-performance',
          }}
          onCreated={({ gl, camera }) => {
            gl.setClearColor(0x000000, 0);

            rendererRef.current = gl;
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = baseExposure * exposure;

            cameraRef.current = camera;
            webglCanvasRef.current = gl.domElement as HTMLCanvasElement;
            queueMicrotask(() => readThemeVars());

            const canvas = gl.domElement;

            const handleContextLost = (event: Event) => {
              event.preventDefault();
              console.warn('[Scene] WebGL context lost - preventing default to allow recovery');
            };

            const handleContextRestored = () => {
              console.log('[Scene] WebGL context restored');
              // Восстанавливаем настройки renderer после восстановления контекста
              if (rendererRef.current) {
                rendererRef.current.setClearColor(0x000000, 0);
                rendererRef.current.toneMapping = THREE.ACESFilmicToneMapping;
                rendererRef.current.toneMappingExposure = baseExposure * exposure;
              }
            };

            canvas.addEventListener('webglcontextlost', handleContextLost, false);
            canvas.addEventListener('webglcontextrestored', handleContextRestored, false);

            return () => {
              canvas.removeEventListener('webglcontextlost', handleContextLost, false);
              canvas.removeEventListener('webglcontextrestored', handleContextRestored, false);
            };
          }}
        >
          <HdriLoader />

          <CustomOrbitControls
            ref={controlsRef}
            autoRotate={autoRotate}
            enablePan
            enabled={!isCameraOn && !placing && !transformMode}
            enableZoom
          />

          <ambientLight ref={ambientRef} intensity={1.3} />
          <directionalLight position={[10, 10, 10]} intensity={1.2} />
          <directionalLight position={[-10, 10, 10]} intensity={0.8} />
          <directionalLight position={[0, 10, -10]} intensity={0.6} />

          {modelUrl && (
            <>
              {showThickAxes && isModelReady && <AxisRays length={2.5} thickness={0.002} />}
              {/* Оболочка для world-scale */}
              <group ref={worldWrapperRef}>
                <group
                  ref={modelGroupRef}
                  position={[modelPosition[0], modelPosition[1] + modelOffsetY, modelPosition[2]]}
                  rotation={modelRotation}
                  scale={modelScaleVec}
                >
                  <LoadedModel
                    key={modelUrl}
                    url={modelUrl}
                    onAnalyze={onAnalyze}
                    onRendered={() => onRendered?.()}
                    lodLevel={lodLevel}
                    onLodLevelsDetected={onLodLevelsDetected}
                    onPolygonCountChange={onPolygonCountChange}
                    modelInfo={modelInfo}
                    doQuadrification={doQuadrification}
                    isGameDevMode={isGameDevMode}
                  />
                </group>
              </group>
              {transformMode && tcObject && isModelReady && (
                <TransformControls
                  ref={(ctrl) => {
                    transformRef.current = ctrl as unknown as TransformControlsImpl;
                  }}
                  object={tcObject}
                  mode={transformMode}
                  space={transformSpace}
                  size={1.1}
                  onMouseDown={() => {
                    if (controlsRef.current) controlsRef.current.enabled = false;
                  }}
                  onMouseUp={() => {
                    if (controlsRef.current) controlsRef.current.enabled = !isCameraOn && !placing && !transformMode;
                    commitFromObject();
                  }}
                />
              )}

              {!isCameraOn && !showGrid && isModelReady && <ReflectiveFloor isMobile={isMobile} />}
            </>
          )}
          {!isCameraOn && showGrid && (
            <>
              <OptimizedGrid
                args={[100, 100]}
                cellSize={0.1}
                cellThickness={0}
                sectionSize={0.5}
                sectionThickness={1}
                cellColor={gridVars.gridColor}
                sectionColor={gridVars.sectionColor}
                infiniteGrid
                fadeDistance={isMobile ? 20 : 40}
                fadeStrength={isMobile ? 2.0 : 3.2}
                position={[0, 0, 0]}
              />
              <DashedSectionLines
                size={50}
                y={0.001}
                color={gridVars.dashedColor}
                fadeDistance={isMobile ? 20 : 40}
                fadeStrength={isMobile ? 2.0 : 3.2}
              />
              <axesHelper args={[2.5]} />
            </>
          )}

          <SoftShadows />
        </Canvas>
      </Suspense>
    </ErrorBoundary>
  );
};
