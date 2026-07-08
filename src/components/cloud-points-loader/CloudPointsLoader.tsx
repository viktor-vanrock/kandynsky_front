// TODO: облако точек для suspend во время генерации @vsgribov
// import { FC, useEffect, useMemo, useRef } from 'react';
// import { useFrame } from '@react-three/fiber';
// import * as THREE from 'three';

// interface CloudPointsLoaderProps {
//   modelUrl?: string;
//   autoRotate?: boolean;
// }

// export const CloudPointsLoader: FC<CloudPointsLoaderProps> = ({
//   autoRotate = true
// }) => {
//   const groupRef = useRef<THREE.Group>(null);
//   const baseScaleRef = useRef<number>(1);

//   // Создаем процедурное облако точек в форме куба
//   const pointCloud = useMemo(() => {
//     const particleCount = 8000;
//     const positions = new Float32Array(particleCount * 3);

//     for (let i = 0; i < particleCount; i++) {
//       const i3 = i * 3;

//       // Создаем точки в форме куба с небольшим шумом
//       const size = 1;
//       positions[i3] = (Math.random() - 0.5) * size;
//       positions[i3 + 1] = (Math.random() - 0.5) * size;
//       positions[i3 + 2] = (Math.random() - 0.5) * size;
//     }

//     const geometry = new THREE.BufferGeometry();
//     geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

//     const material = new THREE.PointsMaterial({
//       size: 0.015,
//       color: 0x3f81fd,
//       transparent: true,
//       opacity: 0.8,
//       sizeAttenuation: true,
//     });

//     return new THREE.Points(geometry, material);
//   }, []);

//   useEffect(() => {
//     if (groupRef.current) {
//       groupRef.current.add(pointCloud);
//       baseScaleRef.current = 1.5;
//       groupRef.current.scale.setScalar(baseScaleRef.current);
//     }

//     return () => {
//       pointCloud.geometry.dispose();
//       (pointCloud.material as THREE.Material).dispose();
//     };
//   }, [pointCloud]);

//   // Анимация вращения и пульсации
//   useFrame((state) => {
//     if (groupRef.current && autoRotate) {
//       groupRef.current.rotation.y += 0.005;

//       // Пульсация масштаба
//       const pulse = Math.sin(state.clock.elapsedTime * 2) * 0.05 + 1;
//       groupRef.current.scale.setScalar(baseScaleRef.current * pulse);
//     }
//   });

//   return (
//     <group ref={groupRef} position={[0, 0, 0]} />
//   );
// };

// // Создаем компонент для отображения облака точек из GLB модели
// interface ModelCloudPointsProps {
//   modelUrl: string;
// }

// export const ModelCloudPoints: FC<ModelCloudPointsProps> = ({ modelUrl }) => {
//   const groupRef = useRef<THREE.Group>(null);

//   useEffect(() => {
//     if (!modelUrl) return;

//     const loader = new THREE.GLTFLoader();

//     loader.load(
//       modelUrl,
//       (gltf) => {
//         if (!groupRef.current) return;

//         // Очищаем группу
//         while (groupRef.current.children.length > 0) {
//           groupRef.current.remove(groupRef.current.children[0]);
//         }

//         const model = gltf.scene;

//         // Конвертируем все меши в point cloud
//         model.traverse((child) => {
//           if (child instanceof THREE.Mesh) {
//             const geometry = child.geometry;

//             const pointsGeometry = new THREE.BufferGeometry();
//             pointsGeometry.setAttribute('position', geometry.getAttribute('position'));

//             const pointsMaterial = new THREE.PointsMaterial({
//               size: 0.008,
//               color: 0x34C759,
//               transparent: true,
//               opacity: 0.9,
//               sizeAttenuation: true,
//             });

//             const points = new THREE.Points(pointsGeometry, pointsMaterial);
//             points.position.copy(child.position);
//             points.rotation.copy(child.rotation);
//             points.scale.copy(child.scale);

//             if (groupRef.current) {
//               groupRef.current.add(points);
//             }
//           }
//         });

//         // Центрируем
//         const box = new THREE.Box3().setFromObject(groupRef.current);
//         const center = box.getCenter(new THREE.Vector3());
//         groupRef.current.position.sub(center);

//         const size = box.getSize(new THREE.Vector3());
//         const maxDim = Math.max(size.x, size.y, size.z);
//         const scale = 1.5 / maxDim;
//         groupRef.current.scale.setScalar(scale);
//       },
//       undefined,
//       (error) => {
//         console.error('Error loading model for point cloud:', error);
//       }
//     );
//   }, [modelUrl]);

//   useFrame(() => {
//     if (groupRef.current) {
//       groupRef.current.rotation.y += 0.008;
//     }
//   });

//   return <group ref={groupRef} position={[0, 0, 0]} />;
// };
