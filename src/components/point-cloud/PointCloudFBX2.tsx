"use client"
import { useEffect, useState, useMemo, useRef, FC } from 'react';
import { useFBX } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
// import { FBXLoader } from 'three-stdlib';
import * as THREE from 'three';

interface PointCloudFBX2Props {
  position?: [number, number, number];
  pointSize?: number;
  opacity?: number;
  density?: number;
  color?: string;
  theme?: 'light' | 'dark';
}

const PointCloudFBX2: FC<PointCloudFBX2Props> = ({
  position = [0, 0.4, 0],
  pointSize = 0.01,
  opacity = 1.0,
  density = 1.0,
  theme = 'dark',
}) => {
  const fbx = useFBX('/K3D_more_slices.fbx');
  const [pointCloudGeometry, setPointCloudGeometry] = useState<THREE.BufferGeometry | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Создаем круглую текстуру для точек
  const circleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.5)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  // Обновляем время для анимации точек
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniformsNeedUpdate = true;
    }
  });

  useEffect(() => {
    if (fbx) {
      console.log('Processing FBX2 model...');

      // Извлекаем центры треугольников из FBX модели
      const positions: number[] = [];
      const colors: number[] = [];
      const sizes: number[] = [];

      fbx.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const geometry = mesh.geometry as THREE.BufferGeometry;
          const positionAttribute = geometry.attributes.position;

          if (positionAttribute) {
            // Если есть индексы, используем их
            if (geometry.index) {
              const indices = geometry.index.array;

              // Проходим по каждому треугольнику (каждые 3 индекса)
              for (let i = 0; i < indices.length; i += 3) {
                const idx1 = indices[i];
                const idx2 = indices[i + 1];
                const idx3 = indices[i + 2];

                // Получаем координаты трех вершин треугольника
                const v1x = positionAttribute.getX(idx1);
                const v1y = positionAttribute.getY(idx1);
                const v1z = positionAttribute.getZ(idx1);

                const v2x = positionAttribute.getX(idx2);
                const v2y = positionAttribute.getY(idx2);
                const v2z = positionAttribute.getZ(idx2);

                const v3x = positionAttribute.getX(idx3);
                const v3y = positionAttribute.getY(idx3);
                const v3z = positionAttribute.getZ(idx3);

                // Вычисляем центр треугольника (центроид)
                const centerX = (v1x + v2x + v3x) / 3;
                const centerY = (v1y + v2y + v3y) / 3;
                const centerZ = (v1z + v2z + v3z) / 3;

                // Используем density для прореживания точек
                if (Math.random() < density) {
                  positions.push(centerX, centerY, centerZ);
                  // Цвет точек зависит от темы: белый для темной темы, черный для светлой
                  const pointColor = theme === 'dark' ? 1 : 0;
                  colors.push(pointColor, pointColor, pointColor);
                  sizes.push(0.001 + Math.random() * 0.002);
                }
              }
            } else {
              // Если нет индексов, вершины идут последовательно
              for (let i = 0; i < positionAttribute.count; i += 3) {
                const v1x = positionAttribute.getX(i);
                const v1y = positionAttribute.getY(i);
                const v1z = positionAttribute.getZ(i);

                const v2x = positionAttribute.getX(i + 1);
                const v2y = positionAttribute.getY(i + 1);
                const v2z = positionAttribute.getZ(i + 1);

                const v3x = positionAttribute.getX(i + 2);
                const v3y = positionAttribute.getY(i + 2);
                const v3z = positionAttribute.getZ(i + 2);

                // Вычисляем центр треугольника
                const centerX = (v1x + v2x + v3x) / 3;
                const centerY = (v1y + v2y + v3y) / 3;
                const centerZ = (v1z + v2z + v3z) / 3;

                // Используем density для прореживания точек
                if (Math.random() < density) {
                  positions.push(centerX, centerY, centerZ);
                  // Цвет точек зависит от темы: белый для темной темы, черный для светлой
                  const pointColor = theme === 'dark' ? 1 : 0;
                  colors.push(pointColor, pointColor, pointColor);
                  sizes.push(0.001 + Math.random() * 0.002);
                }
              }
            }
          }
        }
      });

      console.log('FBX2 Total points:', positions.length / 3);

      // Создаем BufferGeometry
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
      geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

      // Вычисляем границы
      geometry.computeBoundingBox();
      const boundingBox = geometry.boundingBox;
      if (!boundingBox) return;

      const center = new THREE.Vector3();
      boundingBox.getCenter(center);

      const size = new THREE.Vector3();
      boundingBox.getSize(size);

      // Центрируем
      geometry.translate(-center.x, -center.y, -center.z);

      // Нормализуем размер
      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 2 / maxDim; // Уменьшаем до 2 единиц

      const positionsArray = geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < positionsArray.length; i++) {
        positionsArray[i] *= scale;
      }
      geometry.attributes.position.needsUpdate = true;

      console.log('FBX2 Point cloud ready!');
      setPointCloudGeometry(geometry);
    }
  }, [fbx, density, theme]);

  if (!pointCloudGeometry || !circleTexture) return null;

  return (
    <group position={position} rotation={[Math.PI / 2, 0, 0]}>
      <points>
        <primitive object={pointCloudGeometry} attach="geometry" />
        <shaderMaterial
          ref={materialRef}
          uniforms={{
            uTime: { value: 0 },
            uSize: { value: pointSize },
            uTexture: { value: circleTexture },
            uOpacity: { value: opacity },
          }}
          vertexShader={`
            uniform float uTime;
            uniform float uSize;
            varying vec3 vColor;

            // Функция для генерации псевдослучайного числа
            float random(vec3 pos) {
              return fract(sin(dot(pos, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
            }

            void main() {
              vColor = color;

              vec3 pos = position;

              // Вычисляем расстояние от центра
              float dist = length(position);

              // Цикл: 2 секунды волна + 1 секунда пауза = 3 секунды
              float cycleTime = mod(uTime, 3.0);

              // Плавное затухание в конце цикла
              float fade = 1.0;
              if (cycleTime > 1.5) {
                fade = 1.0 - smoothstep(1.5, 2.0, cycleTime);
              }

              // Волна активна только там, где она уже "дошла"
              // Скорость распространения волны
              float waveFront = cycleTime * 0.6;
              float edgeFade = smoothstep(waveFront + 0.3, waveFront, dist);

              // Волна начинается с центра (используем cos для максимума в центре)
              // Волна распространяется от центра наружу по мере увеличения cycleTime
              float wave = cos(dist * 5.0 - cycleTime * 3.0);

              // Преобразуем волну в положительное значение для расширения
              float pulse = max(0.0, wave) * 0.03 * fade * edgeFade;

              // Нормализуем направление от центра
              vec3 direction = normalize(position);

              // Применяем пульс - расширяем точки от центра
              pos += direction * pulse;

              // Добавляем небольшую дополнительную вариативность
              float rand = random(position);
              pos += direction * sin(uTime * 0.5 + rand * 6.28) * 0.01;

              vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
              gl_Position = projectionMatrix * mvPosition;

              // Размер точки с учетом расстояния
              gl_PointSize = uSize * 300.0 * (1.0 / -mvPosition.z);
            }
          `}
          fragmentShader={`
            uniform sampler2D uTexture;
            uniform float uOpacity;
            varying vec3 vColor;

            void main() {
              vec4 textureColor = texture2D(uTexture, gl_PointCoord);
              gl_FragColor = vec4(vColor, textureColor.a * uOpacity);
            }
          `}
          transparent={true}
          depthWrite={false}
          vertexColors={true}
        />
      </points>
    </group>
  );
};

export default PointCloudFBX2;
