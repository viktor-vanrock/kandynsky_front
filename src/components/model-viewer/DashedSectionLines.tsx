import { FC, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

type Props = {
  size?: number; // размер сетки
  step?: number; // шаг между линиями
  offset?: number; // смещение линий
  y?: number; // высота над плоскостью
  color?: string;
  fadeDistance?: number;
  fadeStrength?: number;
};

export const DashedSectionLines: FC<Props> = ({
  size = 50,
  y = 0.001,
  color = '#727272',
  fadeDistance = 30,
  fadeStrength = 3.0,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  const material = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color,
        transparent: true,
        opacity: 1.0,
        linewidth: 0.7,
      }),
    [color],
  );

  const lines = useMemo(() => {
    const group = new THREE.Group();
    const addLine = (p1: THREE.Vector3, p2: THREE.Vector3) => {
      const geom = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const line = new THREE.Line(geom, material);
      // Сохраняем центр линии для правильного вычисления расстояния
      const center = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      line.userData.center = center;
      group.add(line);
    };

    // генерим линии в центрах квадратов сплошной сетки (n + 0.5)
    for (let v = -Math.floor(size); v <= Math.floor(size); v += 1) {
      const pos = v + 0.5;
      if (Math.abs(pos) > size) continue;
      addLine(new THREE.Vector3(-size, y, pos), new THREE.Vector3(size, y, pos));
      addLine(new THREE.Vector3(pos, y, -size), new THREE.Vector3(pos, y, size));
    }

    return group;
  }, [size, y, material]);

  useEffect(() => {
    return () => {
      material.dispose();
      lines.children.forEach((child) => {
        if (child instanceof THREE.Line) {
          child.geometry.dispose();
        }
      });
    };
  }, [lines, material]);

  const prevCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const prevCamRotRef = useRef<THREE.Euler>(new THREE.Euler());
  const isMovingRef = useRef(false);
  const movementThreshold = 0.005;
  const stopFramesRef = useRef(0);
  const STOP_FRAMES_THRESHOLD = 10; // увеличено количество кадров для полной остановки

  useFrame(() => {
    if (!groupRef.current) return;
    const camPos = camera.position;
    const camRot = camera.rotation;

    // Проверяем движение камеры (позиция и вращение)
    const posDelta = camPos.distanceTo(prevCamPosRef.current);
    const rotDelta =
      Math.abs(camRot.x - prevCamRotRef.current.x) +
      Math.abs(camRot.y - prevCamRotRef.current.y) +
      Math.abs(camRot.z - prevCamRotRef.current.z);
    const isMoving = posDelta > movementThreshold || rotDelta > movementThreshold;

    if (isMoving) {
      isMovingRef.current = true;
      stopFramesRef.current = 0;
    } else {
      stopFramesRef.current++;
      // Прекращаем обновления только после нескольких кадров без движения
      if (stopFramesRef.current >= STOP_FRAMES_THRESHOLD) {
        isMovingRef.current = false;
        // Не обновляем сетку, если камера полностью остановилась
        return;
      }
    }

    prevCamPosRef.current.copy(camPos);
    prevCamRotRef.current.copy(camRot);

    const fadeStart = fadeDistance;
    const fadeEnd = fadeDistance * fadeStrength;

    groupRef.current.children.forEach((child) => {
      const line = child as THREE.Line;
      // Используем центр линии для более точного вычисления расстояния
      const center = line.userData.center as THREE.Vector3 | undefined;
      const dist = center ? camPos.distanceTo(center) : camPos.distanceTo(line.position);
      let alpha = 1.0;
      if (dist > fadeStart) {
        alpha = Math.max(0, 1 - (dist - fadeStart) / (fadeEnd - fadeStart));
      }
      const mat = line.material as THREE.LineBasicMaterial;
      // Обновляем только если значение изменилось, чтобы избежать мерцания
      if (Math.abs(mat.opacity - alpha) > 0.01) {
        mat.opacity = alpha;
        mat.needsUpdate = true;
      }
    });
  });

  return <primitive ref={groupRef} object={lines} />;
};

export default DashedSectionLines;
