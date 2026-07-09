import { Suspense, useMemo, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { useGLTF, OrbitControls, Stage, Environment, Html, ContactShadows } from '@react-three/drei';
import type { GLTF } from 'three-stdlib';
import * as THREE from 'three';
import { useGameDevStore } from '../../store/gamedev';
import { useLocale } from '../../context';

const MODEL_PATH = '/previewModel/preview.glb';
const HDR_DIR = '/hdrMaps/';
const HDR_FILE = 'studio_small_08_1k.hdr';

const getObjPathForLod = (lodLevel: number): string => {
  return `/previewModel/preview_lod${lodLevel}.obj`;
};

const getDesiredLodFromPolyCount = (polyCount: number): number => {
  if (polyCount < 20000) return 7;
  if (polyCount < 40000) return 5;
  if (polyCount < 100000) return 4;
  if (polyCount < 150000) return 2;
  return 0;
};

const Loader = () => {
  const { t } = useLocale();
  return (
    <Html center>
      <div
        style={{
          padding: '8px 16px',
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
            border: '2px solid #fff',
            borderTopColor: 'transparent',
            display: 'inline-block',
            animation: 'spin .8s linear infinite',
          }}
        />
        <span>{t.loading}</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </Html>
  );
};

const buildQuadLinesFromOBJ = (text: string, lodLevel?: number): THREE.LineSegments | null => {
  console.log(`[PreviewScene] Строим квады для LOD ${lodLevel}, длина текста: ${text.length}`);

  if (text.trim().startsWith('<!DOCTYPE html>') || text.trim().startsWith('<html')) {
    console.error(`[PreviewScene] Проверьте наличие файла LOD ${lodLevel}.`);
    return null;
  }

  const verts: number[] = [];
  const edges: number[] = [];
  const lines = text.split(/\r?\n/);
  let warned = false;

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
      } else if (idx.length === 3) {
        if (!warned) {
          console.warn(
            `[PreviewScene] OBJ файл содержит треугольники (LOD ${
              lodLevel ?? 'unknown'
            }). Для квадратной сетки нужна квад-топология (4 вершины для каждой грани)`,
          );
          warned = true;
        }
      }
    }
  }

  console.log(`[PreviewScene] Parsed OBJ: ${verts.length / 3} vertices, ${edges.length / 2} edges`);

  if (edges.length < 2 || verts.length < 3) {
    console.warn('[PreviewScene] Не достаточно ребер или вершин для квадов');
    return null;
  }

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
  g.center();

  const m = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.25,
    depthTest: false,
  });
  const linesObj = new THREE.LineSegments(g, m);
  linesObj.renderOrder = 20;
  return linesObj;
};

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

const applyMaterialSettings = (
  scene: THREE.Object3D,
  opacity: number,
  pbrMode: 'albedo' | 'metall' | 'plastic' | 'pbr' = 'pbr',
) => {
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      try {
        const materials = Array.isArray(child.material) ? child.material : [child.material];
        const clonedMaterials = materials.map((m) => {
          if (m && typeof m.clone === 'function') {
            return m.clone();
          }
          return m;
        });

        clonedMaterials.forEach((material) => {
          if (material instanceof THREE.Material) {
            material.transparent = true;
            material.opacity = opacity;
            // Применяем PBR параметры
            applyPbrSettings(material, pbrMode);
          }
        });

        child.material = Array.isArray(child.material) ? clonedMaterials : clonedMaterials[0];
      } catch (err) {
        console.error('Error applying material settings:', err);
      }
    }
  });
};

const Model = () => {
  const { topology, polyCount, lod, pbrMode } = useGameDevStore();
  const gltf = useGLTF(MODEL_PATH) as GLTF;
  const [quadLines, setQuadLines] = useState<THREE.LineSegments | null>(null);
  const [isLoadingQuads, setIsLoadingQuads] = useState(false);
  const [currentLodForQuads, setCurrentLodForQuads] = useState<number | null>(null);

  const desiredLod = useMemo(() => getDesiredLodFromPolyCount(polyCount), [polyCount]);

  // Разбираем GLTF на LOD-ы
  const lodMap = useMemo(() => {
    const map = new Map<number, THREE.Mesh[]>();
    const regexes = [/^lod(\d)$/i];

    if (!gltf || !gltf.scene) {
      return map;
    }

    try {
      gltf.scene.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;

        let current: THREE.Object3D | null = child;
        let level: number | null = null;

        // ищем лоды
        while (current) {
          const name = current.name;
          if (typeof name === 'string' && name.length) {
            for (const regex of regexes) {
              const match = name.match(regex);
              if (match) {
                const parsed = parseInt(match[1], 10);
                if (Number.isFinite(parsed)) {
                  level = parsed;
                  break;
                }
              }
            }
          }
          if (level !== null) break;
          current = current.parent ?? null;
        }

        if (level !== null) {
          const safeLevel = Math.floor(level);
          if (!map.has(safeLevel)) {
            map.set(safeLevel, []);
          }
          map.get(safeLevel)!.push(child);
        }
      });
    } catch (err) {
      console.error('Error processing GLTF scene:', err);
    }

    return map;
  }, [gltf]);

  // определяем ближайший доступный уровень для основного объекта
  const mainTargetLevel = useMemo(() => {
    const levels = Array.from(lodMap.keys()).sort((a, b) => a - b);
    if (levels.length === 0) return null;
    return levels.reduce((prev, curr) => {
      return Math.abs(curr - desiredLod) < Math.abs(prev - desiredLod) ? curr : prev;
    });
  }, [lodMap, desiredLod]);

  // загрузка квадов
  useEffect(() => {
    console.log(
      '[PreviewScene] Quad effect triggered. Topology:',
      topology,
      'MainTargetLevel:',
      mainTargetLevel,
      'CurrentLodForQuads:',
      currentLodForQuads,
      'IsLoading:',
      isLoadingQuads,
    );

    if (topology === 'quads' && mainTargetLevel !== null) {
      if (mainTargetLevel !== currentLodForQuads && !isLoadingQuads) {
        console.log('[PreviewScene] Starting to load quads for LOD', mainTargetLevel);
        setIsLoadingQuads(true);
        setCurrentLodForQuads(mainTargetLevel);

        const objPath = getObjPathForLod(mainTargetLevel);
        fetch(objPath)
          .then((res) => {
            if (!res.ok) throw new Error(`Failed to load ${objPath}: ${res.statusText}`);
            return res.text();
          })
          .then((text) => {
            const lines = buildQuadLinesFromOBJ(text, mainTargetLevel);
            console.log('[PreviewScene] Quad lines built:', lines ? 'Success' : 'Failed (null)');
            setQuadLines(lines || null);
          })
          .catch((err) => console.error('[PreviewScene] Failed to load quads:', err))
          .finally(() => setIsLoadingQuads(false));
      }
    } else {
      if (currentLodForQuads !== null) {
        console.log('[PreviewScene] Clearing quads');
        setQuadLines(null);
        setCurrentLodForQuads(null);
      }
    }
  }, [topology, mainTargetLevel, currentLodForQuads, isLoadingQuads]);

  // рендер основного объекта
  const mainObject = useMemo(() => {
    const group = new THREE.Group();

    if (mainTargetLevel === null) {
      // fallback
      if (lodMap.size === 0 && gltf?.scene) {
        try {
          const sceneClone = gltf.scene.clone();
          sceneClone.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              const clone = child.clone();
              clone.position.set(0, 0, 0);
              group.add(clone);
            }
          });
          if (topology === 'triangles') {
            applyMaterialSettings(group, 0.75, pbrMode);
            const meshesToWireframe: THREE.Mesh[] = [];
            group.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                meshesToWireframe.push(child);
              }
            });
            meshesToWireframe.forEach((mesh) => {
              try {
                const wireframeMaterial = new THREE.MeshBasicMaterial({
                  color: 0xffffff,
                  wireframe: true,
                  transparent: true,
                  opacity: 0.5,
                  polygonOffset: true,
                  polygonOffsetFactor: -1,
                  polygonOffsetUnits: -1,
                });
                const wireframe = new THREE.Mesh(mesh.geometry, wireframeMaterial);
                wireframe.name = 'wireframe-overlay';
                mesh.add(wireframe);
              } catch (err) {
                console.error('Error creating wireframe:', err);
              }
            });
          }
        } catch (err) {
          console.error('Error creating fallback scene:', err);
        }
      }
      return group;
    }

    const meshes = lodMap.get(mainTargetLevel);

    if (meshes && meshes.length > 0) {
      meshes.forEach((mesh) => {
        try {
          const clone = mesh.clone();
          clone.position.set(0, 0, 0);
          clone.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              child.castShadow = true;
            }
          });
          group.add(clone);
        } catch (err) {
          console.error('Error cloning mesh:', err);
        }
      });

      // применяем прозрачность и сетку
      if (topology === 'quads') {
        applyMaterialSettings(group, 0.85, pbrMode);
        if (quadLines) {
          console.log('[PreviewScene] Adding quad lines to scene');
          try {
            group.add(quadLines.clone());
          } catch (err) {
            console.error('Error cloning quadLines:', err);
          }
        } else {
          console.log('[PreviewScene] No quad lines available to add');
        }
      } else if (topology === 'triangles') {
        applyMaterialSettings(group, 0.75, pbrMode);
        const meshesToWireframe: THREE.Mesh[] = [];
        group.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            meshesToWireframe.push(child);
          }
        });
        meshesToWireframe.forEach((mesh) => {
          try {
            const wireframeMaterial = new THREE.MeshBasicMaterial({
              color: 0xffffff,
              wireframe: true,
              transparent: true,
              opacity: 0.5,
              polygonOffset: true,
              polygonOffsetFactor: -1,
              polygonOffsetUnits: -1,
            });
            const wireframe = new THREE.Mesh(mesh.geometry, wireframeMaterial);
            wireframe.name = 'wireframe-overlay';
            mesh.add(wireframe);
          } catch (err) {
            console.error('Error creating wireframe:', err);
          }
        });
      }
    }
    return group;
  }, [lodMap, mainTargetLevel, topology, quadLines, gltf, pbrMode]);

  // рендер окружающих объектов (LOD > 0)
  const surroundingObjects = useMemo(() => {
    if (lod <= 0) return null;

    const group = new THREE.Group();
    const levels = Array.from(lodMap.keys()).sort((a, b) => a - b);
    if (levels.length === 0) return null;
    const count = lod;

    // размер круга для окружающих объектов
    const radius = 2.9;

    for (let i = 0; i < count; i++) {
      const targetLodLevel = i + 1;
      const targetLod = levels.reduce((prev, curr) => {
        return Math.abs(curr - targetLodLevel) < Math.abs(prev - targetLodLevel) ? curr : prev;
      });

      const meshes = lodMap.get(targetLod);
      if (!meshes || meshes.length === 0) continue;

      // встаньте лоды, встаньте в круг
      const angle = (i / count) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const instanceGroup = new THREE.Group();
      instanceGroup.position.set(x, 0, z);
      // чуть уменьшим размер
      instanceGroup.scale.set(0.7, 0.7, 0.7);

      meshes.forEach((mesh) => {
        try {
          const clone = mesh.clone();
          clone.position.set(0, 0, 0);

          // применяем полупрозрачность к материалам
          clone.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              const materials = Array.isArray(child.material) ? child.material : [child.material];
              const clonedMaterials = materials.map((m) => {
                if (m && typeof m.clone === 'function') {
                  return m.clone();
                }
                return m;
              });

              clonedMaterials.forEach((material) => {
                if (material instanceof THREE.Material) {
                  material.transparent = true;
                  material.opacity = 0.6;
                  // применяем PBR параметры
                  applyPbrSettings(material, pbrMode);
                }
              });

              child.material = Array.isArray(child.material) ? clonedMaterials : clonedMaterials[0];
            }
          });

          instanceGroup.add(clone);
        } catch (err) {
          console.error('Error cloning mesh for surrounding object:', err);
        }
      });

      if (instanceGroup.children.length > 0) {
        group.add(instanceGroup);
      }
    }

    return group.children.length > 0 ? group : null;
  }, [lodMap, lod, pbrMode]);

  const hasMainObject = useMemo(() => {
    return mainObject && mainObject.children.length > 0;
  }, [mainObject]);

  return (
    <>
      {hasMainObject && <primitive object={mainObject} />}
      {surroundingObjects && <primitive object={surroundingObjects} />}
      {isLoadingQuads && <Loader />}
    </>
  );
};

export const PreviewScene = () => {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas shadows dpr={[1, 2]} camera={{ fov: 50, position: [2, 1, 2] }}>
        <Suspense fallback={<Loader />}>
          <Environment path={HDR_DIR} files={HDR_FILE} />
          {/* источник света для теней */}
          <directionalLight
            position={[5, 10, 5]}
            intensity={0.8}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={50}
            shadow-camera-left={-20}
            shadow-camera-right={20}
            shadow-camera-top={20}
            shadow-camera-bottom={-20}
          />
          <Stage intensity={0.6} shadows={false} environment={null} adjustCamera={false}>
            <Model />
          </Stage>
          <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={500} blur={2.5} far={200} />
        </Suspense>
        <OrbitControls autoRotate enableZoom={false} enabled={true} />
      </Canvas>
    </div>
  );
};
