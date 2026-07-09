import { useGLTF, Html } from '@react-three/drei';
import { useEffect, useLayoutEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as THREE from 'three';
import { useViewerStore } from '../../store/viewer';
import { useGameDevStore } from '../../store/gamedev';
import { useTheme } from '../../context/ThemeContext.ts';
import { useLocale } from '../../context';
import { useFrame, useThree } from '@react-three/fiber';
import { mergeVertices } from 'three-stdlib';
import { MeshRequestEntity } from '../../graphql/graphQlApiHooks.ts';

const STEP_ROTATION = 0.1 as const;

enum MESH_COLOR {
  WHITE = 0xffffff,
  BLACK = 0x4d4d4d,
  GREEN = 0x00ff00,
}

const useMovement = () => {
  const moveFieldByKey = useCallback((key: string): string => {
    const keys: Record<string, string> = {
      KeyQ: 'left',
      KeyE: 'right',
    };
    return keys[key] ?? '';
  }, []);

  const [movement, setMovement] = useState({ left: false, right: false });

  const setMovementStatus = (code: string, status: boolean) => {
    if (!code) return;
    setMovement((m) => ({ ...m, [code]: status }));
  };

  useEffect(() => {
    const handleKeyDown = ({ code, target }: KeyboardEvent) => {
      const el = target as HTMLElement | null;
      const isTyping = el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
      if (isTyping) return;
      setMovementStatus(moveFieldByKey(code), true);
    };
    const handleKeyUp = ({ code }: KeyboardEvent) => setMovementStatus(moveFieldByKey(code), false);

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [moveFieldByKey]);

  return movement;
};

type ModelProps = {
  url: string;
  onAnalyze: (minY: number, polygonCount: number) => void;
  onRendered?: () => void;
  modelInfo?: MeshRequestEntity | null;
  lodLevel?: number;
  onLodLevelsDetected?: (levels: number[]) => void;
  onPolygonCountChange?: (polygonCount: number) => void;
  doQuadrification?: boolean;
};

function ensureArray<T>(mat: T | T[] | null): T[] {
  if (!mat) return [];
  return Array.isArray(mat) ? mat : [mat];
}

const applyPbrSettings = (material: THREE.Material, pbrMode: 'albedo' | 'metall' | 'plastic' | 'pbr') => {
  if (material instanceof THREE.MeshStandardMaterial || material instanceof THREE.MeshPhysicalMaterial) {
    // Сохраняем оригинальные значения при первом применении
    if (material.userData.originalRoughness === undefined) {
      material.userData.originalRoughness = material.roughness;
    }
    if (material.userData.originalMetalness === undefined) {
      material.userData.originalMetalness = material.metalness;
    }

    if (pbrMode === 'pbr') {
      // Восстанавливаем оригинальные значения из модели
      material.roughness = material.userData.originalRoughness;
      material.metalness = material.userData.originalMetalness;
    } else if (pbrMode === 'metall') {
      material.roughness = 0;
      material.metalness = 1;
    } else if (pbrMode === 'plastic') {
      material.roughness = 1;
      material.metalness = 1;
    } else if (pbrMode === 'albedo') {
      material.roughness = 1;
      material.metalness = 0;
    }
  }
};

export const LoadedModel = ({
  url,
  onAnalyze,
  onRendered,
  modelInfo,
  lodLevel,
  onLodLevelsDetected,
  onPolygonCountChange,
  doQuadrification,
}: ModelProps & { isGameDevMode?: boolean }) => {
  const { theme } = useTheme();
  const { t } = useLocale();
  const { left, right } = useMovement();
  const [meshColor, setMeshColor] = useState(theme === 'dark' ? MESH_COLOR.WHITE : MESH_COLOR.BLACK);
  const isShowTexture = useViewerStore((state) => state.isShowTexture);
  const showMesh = useViewerStore((state) => state.showMesh);
  const { pbrMode } = useGameDevStore();

  const [textureToggleKey, setTextureToggleKey] = useState(0);
  const prevIsShowTextureRef = useRef(isShowTexture);

  useFrame(() => {
    const currentValue = useViewerStore.getState().isShowTexture;
    if (prevIsShowTextureRef.current !== currentValue) {
      prevIsShowTextureRef.current = currentValue;
      setTextureToggleKey((prev) => prev + 1);
    }
  });

  const groupRef = useRef<THREE.Group>(null);
  const quadLinesRef = useRef<THREE.LineSegments | null>(null);
  const [isQuadOverlay, setIsQuadOverlay] = useState(false);
  const [isQuadLoading, setIsQuadLoading] = useState(false);
  const [checkedForQuads, setCheckedForQuads] = useState(false);
  const analyzedSceneRef = useRef<THREE.Object3D | null>(null);
  const analyzedUrlRef = useRef<string | null>(null);
  const lodMapRef = useRef<Map<number, THREE.Mesh[]>>(new Map());
  const lodFallbackMeshesRef = useRef<THREE.Mesh[]>([]);
  const lodLevelsSignatureRef = useRef<string>('');
  const defaultLodPositionRef = useRef<THREE.Vector3 | null>(null);
  const originalPositionsRef = useRef<Map<THREE.Mesh, THREE.Vector3>>(new Map());

  const objUrl = modelInfo?.meshFormats?.find((m) => m.format?.name?.toLowerCase() === 'obj')?.url ?? null;

  useLayoutEffect(() => {
    const isSquare = doQuadrification ?? !!modelInfo?.doQuadrification;
    const needCheck = !!showMesh && isSquare && !!objUrl && !checkedForQuads && !quadLinesRef.current;
    if (isQuadLoading !== needCheck) setIsQuadLoading(needCheck);
  }, [showMesh, objUrl, checkedForQuads, isQuadLoading, modelInfo?.doQuadrification, doQuadrification]);

  useEffect(() => {
    if (!showMesh || !objUrl) {
      setCheckedForQuads(false);
      setIsQuadLoading(false);
      setIsQuadOverlay(false);
      if (quadLinesRef.current && groupRef.current) {
        groupRef.current.remove(quadLinesRef.current);
        quadLinesRef.current.geometry?.dispose();
        (quadLinesRef.current.material as THREE.Material | undefined)?.dispose?.();
      }
      quadLinesRef.current = null;
    }
  }, [showMesh, objUrl]);

  const urlObj = new URL(url);
  const staticUrl = urlObj.pathname + urlObj.search + urlObj.hash;
  const { scene: originalScene } = useGLTF(staticUrl);
  const clonedSceneRef = useRef<THREE.Object3D | null>(null);
  const staticUrlRef = useRef<string>(staticUrl);
  const sceneUuidRef = useRef<string | null>(null);
  const processedSceneUuidRef = useRef<string | null>(null);

  useEffect(() => {
    if (staticUrlRef.current !== staticUrl) {
      staticUrlRef.current = staticUrl;
      clonedSceneRef.current = null;
      sceneUuidRef.current = null;
      processedSceneUuidRef.current = null; // Сбрасываем также флаг обработки
    }
  }, [staticUrl]);

  const scene = useMemo(() => {
    if (!originalScene) {
      return clonedSceneRef.current || null;
    }
    const currentUuid = originalScene.uuid;
    if (sceneUuidRef.current === currentUuid && clonedSceneRef.current) {
      return clonedSceneRef.current;
    }
    if (sceneUuidRef.current !== null && sceneUuidRef.current !== currentUuid) {
      console.log('[LoadedModel] Scene UUID changed:', sceneUuidRef.current, '->', currentUuid);
    }

    sceneUuidRef.current = currentUuid;

    const s = originalScene.clone();
    s.visible = true;
    s.traverse((child) => {
      child.visible = true;
      if (child instanceof THREE.Mesh && child.userData.originalMaterial) {
        child.material = child.userData.originalMaterial;
      }
    });
    console.log('[LoadedModel] Cloned scene, reset visibility. Children:', s.children.length, 'UUID:', currentUuid);
    clonedSceneRef.current = s;
    return s;
  }, [originalScene]);

  const detectLodLevel = useCallback((object: THREE.Object3D): number | null => {
    // ищем лоды для корневых объектов LOD0, LOD1, и тд
    const regexes = [/^lod(\d)$/i];
    let current: THREE.Object3D | null = object;
    while (current) {
      const name = current.name;
      if (typeof name === 'string' && name.length) {
        for (const regex of regexes) {
          const match = name.match(regex);
          if (match) {
            const parsed = parseInt(match[1], 10);
            if (Number.isFinite(parsed)) {
              return parsed;
            }
          }
        }
      }
      current = current.parent ?? null;
    }
    return null;
  }, []);

  const countPolygons = useCallback((meshes: THREE.Mesh[]): number => {
    let totalPolygons = 0;
    meshes.forEach((mesh) => {
      if (mesh.geometry && mesh.visible) {
        const geometry = mesh.geometry;
        if (geometry.index) {
          // индексированная геометрия
          totalPolygons += geometry.index.count / 3;
        } else {
          // неиндексированная геометрия
          const positionAttribute = geometry.getAttribute('position');
          if (positionAttribute) {
            totalPolygons += positionAttribute.count / 3;
          }
        }
      }
    });
    return Math.floor(totalPolygons);
  }, []);

  const applyLodVisibility = useCallback(
    (targetLevel: number) => {
      const lodMap = lodMapRef.current;
      const fallbackMeshes = lodFallbackMeshesRef.current;

      if (!lodMap.size) {
        fallbackMeshes.forEach((mesh) => {
          mesh.visible = true;
        });
        return;
      }

      const sortedLevels = Array.from(lodMap.keys()).sort((a, b) => a - b);
      const normalizedLevel = sortedLevels.includes(targetLevel) ? targetLevel : sortedLevels[0];

      // сохраняем позицию дефолтного лода
      if (defaultLodPositionRef.current === null) {
        const defaultLevel = sortedLevels.includes(0) ? 0 : sortedLevels[0];
        const defaultMeshes = lodMap.get(defaultLevel);
        if (defaultMeshes && defaultMeshes.length > 0) {
          defaultLodPositionRef.current = defaultMeshes[0].position.clone();

          lodMap.forEach((meshes) => {
            meshes.forEach((mesh) => {
              if (!originalPositionsRef.current.has(mesh)) {
                originalPositionsRef.current.set(mesh, mesh.position.clone());
              }
            });
          });
        }
      }

      lodMap.forEach((meshes) => {
        meshes.forEach((mesh) => {
          mesh.visible = false;
          const originalPos = originalPositionsRef.current.get(mesh);
          if (originalPos) {
            mesh.position.copy(originalPos);
          }
        });
      });

      // применяем позицию дефолтного лода
      const targetMeshes = lodMap.get(normalizedLevel);
      const defaultPosition = defaultLodPositionRef.current;
      if (targetMeshes && defaultPosition) {
        targetMeshes.forEach((mesh) => {
          if (!originalPositionsRef.current.has(mesh)) {
            originalPositionsRef.current.set(mesh, mesh.position.clone());
          }
          mesh.position.copy(defaultPosition);
          mesh.visible = true;
        });

        // пересчитываем количество полигонов для видимых мешей
        requestAnimationFrame(() => {
          const polygonCount = countPolygons(targetMeshes);
          onPolygonCountChange?.(polygonCount);
        });
      }

      fallbackMeshes.forEach((mesh) => {
        mesh.visible = false;
      });
    },
    [countPolygons, onPolygonCountChange],
  );

  useEffect(() => {
    analyzedSceneRef.current = null;
    analyzedUrlRef.current = null;
  }, []);

  useEffect(() => {
    if (!scene) return;

    const sceneUuid = scene.uuid;
    if (processedSceneUuidRef.current === sceneUuid) {
      return;
    }
    processedSceneUuidRef.current = sceneUuid;

    const lodMap = new Map<number, THREE.Mesh[]>();
    const fallbackMeshes: THREE.Mesh[] = [];

    scene.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;

      const level = detectLodLevel(child);
      if (level === null) {
        fallbackMeshes.push(child);
        return;
      }

      const safeLevel = Math.floor(level);
      if (!lodMap.has(safeLevel)) {
        lodMap.set(safeLevel, []);
      }
      lodMap.get(safeLevel)!.push(child);
    });

    lodMapRef.current = lodMap;
    lodFallbackMeshesRef.current = fallbackMeshes;

    const levels = lodMap.size ? Array.from(lodMap.keys()).sort((a, b) => a - b) : fallbackMeshes.length ? [1] : [];
    const signature = levels.join(',');
    if (lodLevelsSignatureRef.current !== signature) {
      lodLevelsSignatureRef.current = signature;
      onLodLevelsDetected?.(levels);
    }

    // сохраняем позицию дефолтного лода
    if (defaultLodPositionRef.current === null && lodMap.size > 0) {
      const defaultLevel = levels.length ? (levels.includes(0) ? 0 : levels[0]) : 1;
      const defaultMeshes = lodMap.get(defaultLevel);
      if (defaultMeshes && defaultMeshes.length > 0) {
        defaultLodPositionRef.current = defaultMeshes[0].position.clone();
        lodMap.forEach((meshes) => {
          meshes.forEach((mesh) => {
            if (!originalPositionsRef.current.has(mesh)) {
              originalPositionsRef.current.set(mesh, mesh.position.clone());
            }
          });
        });
      }
    }

    const defaultLevel = levels.length ? (levels.includes(0) ? 0 : levels[0]) : 1;
    applyLodVisibility(defaultLevel);

    // пересчет полигонов
    if (lodMap.size > 0) {
      const defaultMeshes = lodMap.get(defaultLevel);
      if (defaultMeshes) {
        requestAnimationFrame(() => {
          const polygonCount = countPolygons(defaultMeshes);
          onPolygonCountChange?.(polygonCount);
        });
      }
    }
  }, [scene, detectLodLevel, onLodLevelsDetected, applyLodVisibility, countPolygons, onPolygonCountChange]);

  useEffect(() => {
    if (!scene) return;
    const lodMap = lodMapRef.current;
    const fallbackMeshes = lodFallbackMeshesRef.current;
    if (!lodMap.size && !fallbackMeshes.length) return;

    const sortedLevels = lodMap.size ? Array.from(lodMap.keys()).sort((a, b) => a - b) : [1];
    const fallbackLevel = sortedLevels.length ? (sortedLevels.includes(0) ? 0 : sortedLevels[0]) : 1;
    const targetLevel = lodLevel ?? fallbackLevel;
    applyLodVisibility(targetLevel);

    // Пересчитываем полигоны после переключения LOD
    const targetMeshes = lodMap.get(targetLevel);
    if (targetMeshes) {
      requestAnimationFrame(() => {
        const polygonCount = countPolygons(targetMeshes);
        onPolygonCountChange?.(polygonCount);
      });
    }
  }, [lodLevel, applyLodVisibility, scene, countPolygons, onPolygonCountChange]);

  useEffect(() => {
    if (analyzedUrlRef.current !== url) {
      analyzedSceneRef.current = null;
      analyzedUrlRef.current = null;
      // сбрасываем позиции при загрузке нового меша
      defaultLodPositionRef.current = null;
      originalPositionsRef.current.clear();
    }
  }, [url]);

  useEffect(() => {
    setMeshColor(theme === 'dark' ? MESH_COLOR.WHITE : MESH_COLOR.BLACK);
  }, [theme]);

  const renderedSceneRef = useRef<THREE.Object3D | null>(null);
  useLayoutEffect(() => {
    if (scene && onRendered && renderedSceneRef.current !== scene) {
      renderedSceneRef.current = scene;
      onRendered();
    }
  }, [scene, onRendered]);

  useEffect(() => {
    let aborted = false;

    const removeQuadLines = () => {
      if (quadLinesRef.current && groupRef.current) {
        try {
          groupRef.current.remove(quadLinesRef.current);
          quadLinesRef.current.geometry?.dispose();
          (quadLinesRef.current.material as THREE.Material | undefined)?.dispose?.();
        } catch (e) {
          console.log(e);
        }
      }
      quadLinesRef.current = null;
      setIsQuadOverlay(false);
    };

    if (!showMesh) {
      removeQuadLines();
      setIsQuadLoading(false);
      setCheckedForQuads(false);
      return;
    }

    const isSquare = doQuadrification ?? !!modelInfo?.doQuadrification;
    if (!isSquare) {
      setIsQuadLoading(false);
      removeQuadLines();
      setCheckedForQuads(false);
      return;
    }

    if (!objUrl || !groupRef.current) {
      setIsQuadLoading(false);
      removeQuadLines();
      setCheckedForQuads(false);
      return;
    }

    // уже построено
    if (quadLinesRef.current) return;

    const buildQuadLinesFromOBJ = (text: string): THREE.LineSegments | null => {
      const verts: number[] = [];
      const edges: number[] = [];
      const lines = text.split(/\r?\n/);

      for (let line of lines) {
        line = line.trim();
        if (!line || line.startsWith('#')) continue;
        if (line.startsWith('v ')) {
          const parts = line.split(/\s+/);
          const x = parseFloat(parts[1]),
            y = parseFloat(parts[2]),
            z = parseFloat(parts[3]);
          if (Number.isFinite(x) && Number.isFinite(y) && Number.isFinite(z)) verts.push(x, y, z);
        } else if (line.startsWith('f ')) {
          const parts = line.split(/\s+/).slice(1);
          const idx = parts
            .map((p) => parseInt(p.split('/')[0], 10))
            .filter((n) => Number.isInteger(n))
            .map((n) => n - 1);
          if (idx.length === 4) {
            edges.push(idx[0], idx[1], idx[1], idx[2], idx[2], idx[3], idx[3], idx[0]);
          }
        }
      }
      if (edges.length < 2 || verts.length < 3) return null;

      const posArr: number[] = [];
      for (let i = 0; i < edges.length; i += 2) {
        const a = edges[i],
          b = edges[i + 1];
        const ax = verts[a * 3],
          ay = verts[a * 3 + 1],
          az = verts[a * 3 + 2];
        const bx = verts[b * 3],
          by = verts[b * 3 + 1],
          bz = verts[b * 3 + 2];
        if ([ax, ay, az, bx, by, bz].every((v) => Number.isFinite(v))) posArr.push(ax, ay, az, bx, by, bz);
      }
      if (posArr.length < 6) return null;

      const g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(posArr, 3));
      const m = new THREE.LineBasicMaterial({
        color: meshColor,
        transparent: true,
        opacity: 0.95,
        depthTest: false, // рисуем поверх
      });
      const linesObj = new THREE.LineSegments(g, m);
      linesObj.renderOrder = 20;
      linesObj.frustumCulled = false;
      return linesObj;
    };

    (async () => {
      try {
        const res = await fetch(objUrl);
        if (!res.ok) return;
        const text = await res.text();
        if (aborted) return;
        const quadLines = buildQuadLinesFromOBJ(text);
        if (quadLines && groupRef.current) {
          quadLinesRef.current = quadLines;
          groupRef.current.add(quadLines);
          setIsQuadOverlay(true);
        } else {
          setIsQuadOverlay(false);
        }
      } catch (e) {
        console.log(e);
      } finally {
        setCheckedForQuads(true);
        setIsQuadLoading(false);
      }
    })();

    return () => {
      aborted = true;
      removeQuadLines();
    };
  }, [showMesh, url, modelInfo?.meshFormats, objUrl, meshColor, modelInfo?.doQuadrification, doQuadrification]);

  useEffect(() => {
    if (quadLinesRef.current) {
      const mat = quadLinesRef.current.material as THREE.LineBasicMaterial | undefined;
      if (mat) {
        mat.color.set(meshColor);
        mat.needsUpdate = true;
      }
    }
  }, [meshColor]);

  const { gl } = useThree();
  const glRef = useRef(gl);

  // Обновляем glRef только если gl действительно изменился
  useEffect(() => {
    glRef.current = gl;
  }, [gl]);

  useLayoutEffect(() => {
    if (!scene) return;
    const sceneUuid = scene.uuid;
    if (analyzedSceneRef.current === scene && analyzedUrlRef.current === url) return;
    if (analyzedSceneRef.current?.uuid === sceneUuid && analyzedUrlRef.current === url) return;

    let cancelled = false;
    let frameId2: number | null = null;

    const frameId1 = requestAnimationFrame(() => {
      if (cancelled) return;
      // доп кадр для гарантии полной загрузки геометрии
      frameId2 = requestAnimationFrame(() => {
        if (cancelled) return;
        if (analyzedSceneRef.current === scene && analyzedUrlRef.current === url) return;
        if (analyzedSceneRef.current?.uuid === sceneUuid && analyzedUrlRef.current === url) return;

        // проверяем, не потерян ли WebGL контекст перед выполнением операций
        const currentGl = glRef.current;
        if (currentGl) {
          const webglContext = currentGl.getContext() as WebGLRenderingContext | WebGL2RenderingContext | null;
          if (webglContext && webglContext.isContextLost()) {
            console.warn('[LoadedModel] WebGL context lost, skipping analysis');
            return;
          }
        }

        analyzedSceneRef.current = scene;
        analyzedUrlRef.current = url;

        const worldPositions: number[] = [];
        let polygonCount = 0;

        scene.traverse((child) => {
          if (cancelled) return;
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;

            if (cancelled) return;

            mesh.updateWorldMatrix(true, false);

            let geometry = mesh.geometry as THREE.BufferGeometry | undefined;
            if (!geometry || !geometry.attributes?.position) return;

            // подсчёт полигонов
            polygonCount += geometry.index ? geometry.index.count / 3 : geometry.attributes.position.count / 3;

            if (!geometry.attributes.normal && !cancelled) {
              try {
                if (!geometry.index) {
                  const merged = mergeVertices(geometry);
                  if (merged && !cancelled) {
                    geometry = merged;
                    mesh.geometry = merged;
                  }
                }
                if (!cancelled && geometry) {
                  geometry.computeVertexNormals();
                  const normalAttr = geometry.attributes.normal;
                  if (normalAttr) {
                    (normalAttr as THREE.BufferAttribute).needsUpdate = true;
                  }
                }
              } catch (e) {
                console.log('Не удалось смержить/пересчитать нормали', e);
              }
            }

            // сбор всех мировых Y для minY
            const position = geometry.attributes.position as THREE.BufferAttribute;
            const v = new THREE.Vector3();
            for (let i = 0; i < position.count; i++) {
              v.fromBufferAttribute(position, i).applyMatrix4(mesh.matrixWorld);
              worldPositions.push(v.y);
            }
          }
        });

        if (worldPositions.length > 0) {
          const minY = worldPositions.reduce((min, y) => Math.min(min, y), Infinity);
          console.log('[LoadedModel] Analyzing scene, minY:', minY, 'url:', url, 'polygons:', polygonCount);
          onAnalyze(minY, polygonCount);
        } else {
          onAnalyze(0, polygonCount || 0);
        }
      });
    });

    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId1);
      if (frameId2 !== null) {
        cancelAnimationFrame(frameId2);
      }
    };
  }, [scene, onAnalyze, url]);

  useEffect(() => {
    if (!scene) return;
    scene.traverse((child: unknown) => {
      if (!(child instanceof THREE.Mesh)) return;
      const mesh = child;

      if (showMesh) {
        const waitingForQuads =
          !!objUrl && isQuadLoading && !quadLinesRef.current && !isQuadOverlay && !checkedForQuads;

        if (waitingForQuads) {
          if (!mesh.userData.originalMaterial) mesh.userData.originalMaterial = mesh.material;
          mesh.material = mesh.userData.originalMaterial;
          return;
        }

        if (isQuadOverlay) {
          if (!mesh.userData.originalMaterial) mesh.userData.originalMaterial = mesh.material;

          if (!mesh.userData.invisibleMaterial) {
            mesh.userData.invisibleMaterial = new THREE.MeshBasicMaterial({ visible: false });
          }
          mesh.material = mesh.userData.invisibleMaterial;
          return;
        }

        if (!mesh.userData.originalMaterial) mesh.userData.originalMaterial = mesh.material;
        if (!mesh.userData.wireframeMaterials) {
          mesh.userData.wireframeMaterials = ensureArray(mesh.userData.originalMaterial).map(() => {
            const basic = new THREE.MeshBasicMaterial({ wireframe: true, color: meshColor });
            basic.needsUpdate = true;
            return basic;
          });
        } else {
          ensureArray(mesh.userData.wireframeMaterials).forEach((m: THREE.MeshBasicMaterial) => {
            m.color.set(meshColor);
            m.needsUpdate = true;
          });
        }
        const basics = ensureArray(mesh.userData.wireframeMaterials) as THREE.MeshBasicMaterial[];
        mesh.material = basics.length === 1 ? basics[0] : basics;
        return;
      }

      if (mesh.userData.originalMaterial) {
        mesh.material = mesh.userData.originalMaterial;
        delete mesh.userData.originalMaterial;
        if (Array.isArray(mesh.material)) {
          mesh.material.forEach((m) => (m.needsUpdate = true));
        } else if (mesh.material) {
          (mesh.material as THREE.Material).needsUpdate = true;
        }
      }

      const materials = ensureArray(mesh.material);
      materials.forEach((m) => {
        if (!(m instanceof THREE.MeshStandardMaterial)) return;

        if (m.userData.originalMap === undefined) {
          m.userData.originalMap = m.map;
        }

        const targetMap = isShowTexture ? m.userData.originalMap : null;
        const currentMap = m.map;
        const shouldUpdate = currentMap !== targetMap;

        if (shouldUpdate) {
          m.map = targetMap;
          m.needsUpdate = true;
        }

        m.flatShading = false;
        applyPbrSettings(m, pbrMode);
        if (!m.needsUpdate) {
          m.needsUpdate = true;
        }
      });
    });
  }, [
    scene,
    isShowTexture,
    showMesh,
    isQuadOverlay,
    objUrl,
    isQuadLoading,
    checkedForQuads,
    meshColor,
    pbrMode,
    textureToggleKey,
  ]);

  useEffect(() => {
    scene?.traverse((child: unknown) => {
      if (child instanceof THREE.Mesh) {
        const materials = ensureArray(child.material);
        materials.forEach((m) => {
          if (m instanceof THREE.MeshBasicMaterial || m instanceof THREE.LineBasicMaterial) {
            m.color.set(meshColor);
            m.needsUpdate = true;
          }
        });
      }
    });
  }, [scene, meshColor]);

  useFrame((state) => {
    if (left) state.scene.rotation.y = state.scene.rotation.y + STEP_ROTATION;
    if (right) state.scene.rotation.y = state.scene.rotation.y - STEP_ROTATION;
  });

  return (
    <group ref={groupRef}>
      {scene && <primitive object={scene} />}
      {/* Лоадер на время построения quad-оверлея */}
      {showMesh && isQuadLoading && (
        <Html center style={{ pointerEvents: 'none' }}>
          <div
            style={{
              padding: '8px 40px',
              minWidth: 240,
              borderRadius: 8,
              background: 'rgba(0,0,0,0.6)',
              color: '#fff',
              fontSize: 12,
              backdropFilter: 'blur(2px)',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                border: `2px solid #${meshColor.toString(16).padStart(6, '0')}`,
                borderTopColor: 'transparent',
                display: 'inline-block',
                animation: 'spin .8s linear infinite',
              }}
            />
            <span>{t.meshLoading}</span>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        </Html>
      )}
    </group>
  );
};
