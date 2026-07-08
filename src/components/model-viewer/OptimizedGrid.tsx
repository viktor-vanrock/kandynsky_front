import { FC, useRef, useState } from 'react';
import { Grid } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

type OptimizedGridProps = {
  args?: [number, number];
  cellSize?: number;
  cellThickness?: number;
  sectionSize?: number;
  sectionThickness?: number;
  cellColor?: string;
  sectionColor?: string;
  infiniteGrid?: boolean;
  fadeDistance?: number;
  fadeStrength?: number;
  position?: [number, number, number];
};

export const OptimizedGrid: FC<OptimizedGridProps> = (props) => {
  const { camera } = useThree();
  const prevCamPosRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const prevCamRotRef = useRef<THREE.Euler>(new THREE.Euler());
  const movementThreshold = 0.005; // увеличен порог для уменьшения чувствительности
  const stopFramesRef = useRef(0);
  const STOP_FRAMES_THRESHOLD = 10; // увеличено количество кадров для полной остановки
  const [isCameraMoving, setIsCameraMoving] = useState(true);

  useFrame(() => {
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
      stopFramesRef.current = 0;
      if (!isCameraMoving) {
        setIsCameraMoving(true);
      }
    } else {
      stopFramesRef.current++;
      if (stopFramesRef.current >= STOP_FRAMES_THRESHOLD && isCameraMoving) {
        setIsCameraMoving(false);
      }
    }

    prevCamPosRef.current.copy(camPos);
    prevCamRotRef.current.copy(camRot);
  });

  const gridProps = {
    ...props,
    infiniteGrid: isCameraMoving ? props.infiniteGrid : false,
  };

  return <Grid {...gridProps} />;
};
