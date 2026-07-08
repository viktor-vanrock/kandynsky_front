import { useFrame, useThree } from '@react-three/fiber';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { OrbitControls as DreiOrbitControls } from '@react-three/drei';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';

type Props = {
  autoRotate: boolean;
  enablePan: boolean;
  enabled?: boolean;
  enableZoom?: boolean;
  minPolarAngle?: number;
  maxPolarAngle?: number;
};

export const CustomOrbitControls = forwardRef<OrbitControlsImpl, Props>(function CustomOrbitControls(
  { autoRotate, enablePan, enabled = true, enableZoom, minPolarAngle, maxPolarAngle },
  ref,
) {
  const localRef = useRef<OrbitControlsImpl>(null);
  useImperativeHandle(ref, () => localRef.current as OrbitControlsImpl, []);
  const { camera, gl } = useThree();

  useFrame(() => {
    const controls = localRef.current;
    if (controls?.enabled) {
      const target = controls.target;
      target.x = THREE.MathUtils.clamp(target.x, -2.5, 2.5); // горизонтальное ограничение на перетаскивание
      target.y = THREE.MathUtils.clamp(target.y, -0.5, 2); // вертикальное ограничение
      target.z = THREE.MathUtils.clamp(target.z, -2.5, 2.5); // ограничение глубины
    }
  }, -2);

  return (
    <DreiOrbitControls
      ref={localRef}
      args={[camera, gl.domElement]}
      enabled={enabled}
      enableZoom={enableZoom}
      autoRotate={autoRotate}
      autoRotateSpeed={2.5}
      enableDamping={true}
      enablePan={enablePan ?? true}
      minDistance={0.5}
      maxDistance={35}
      minPolarAngle={minPolarAngle}
      maxPolarAngle={maxPolarAngle}
    />
  );
});
