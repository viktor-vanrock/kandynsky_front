import { MeshReflectorMaterial } from '@react-three/drei';
import { useViewerStore } from '../../store/viewer';
import * as THREE from 'three';
import { useRef } from 'react';

type Props = {
  isMobile: boolean;
};

// Зеркальный пол под моделью
export const ReflectiveFloor: React.FC<Props> = ({ isMobile }) => {
  function generateRadialAlphaTexture(size = 1024) {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      const gradient = ctx.createRadialGradient(size / 2, size / 2, size * 0.2, size / 2, size / 2, size / 2);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.2)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.minFilter = THREE.LinearFilter;
    return texture;
  }

  const alphaMap = useRef<THREE.Texture | null>(null);
  if (!alphaMap.current) {
    alphaMap.current = generateRadialAlphaTexture();
  }

  const { floorPositionY } = useViewerStore();
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -floorPositionY, 0]} receiveShadow>
      <circleGeometry args={isMobile ? [3, 64] : [5, 128]} />
      <MeshReflectorMaterial
        blur={isMobile ? [300, 50] : [600, 200]}
        resolution={isMobile ? 512 : 1024}
        mixBlur={0}
        mixStrength={8}
        roughness={1}
        depthScale={1}
        minDepthThreshold={0.1}
        maxDepthThreshold={1.4}
        color={'#eef4fd'}
        metalness={0}
        transparent={true}
        opacity={0.1}
        mirror={1}
        alphaMap={alphaMap.current}
      />
    </mesh>
  );
};
