import { FC, Suspense, memo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls as DreiOrbitControls } from '@react-three/drei';
import PointCloudFBX2 from './PointCloudFBX2';
import { useTheme } from '../../context';

interface PointCloudCanvasProps {
  cameraDistance?: number;
}

// Мемоизированный компонент - не будет ререндериться если props не изменились
export const PointCloudCanvas: FC<PointCloudCanvasProps> = memo(({ cameraDistance = 4.18 }) => {
  const { theme } = useTheme();
  console.log('[PointCloudCanvas] Rendering with theme:', theme);

  return (
    <Canvas
      frameloop="always"
      camera={{ position: [0, 0, cameraDistance], fov: 40 }}
      style={{
        width: '100%',
        height: '100%',
      }}
    >
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 10]} intensity={1} />
      <DreiOrbitControls
        enableDamping
        dampingFactor={0.05}
        enableZoom={false}
        enablePan={false}
        enableRotate={true}
      />
      <Suspense fallback={null}>
        <PointCloudFBX2 key="fbx-cloud" pointSize={0.0165} opacity={1.0} density={0.2} theme={theme} />
      </Suspense>
    </Canvas>
  );
});

PointCloudCanvas.displayName = 'PointCloudCanvas';
