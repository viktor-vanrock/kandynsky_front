import { FC, useEffect, useMemo, useRef, useState } from 'react';
import { CenteredContent } from '../centered-content';
import styled from 'styled-components';
import IconRotator from '../icons-rotator/IconsRotator';
import { ErrorBoundary } from '../error-boundary';
import { ModelViewerTools } from '../model-viewer-tools';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GetGeneratedPreviewsQuery, MeshRequestEntity } from '../../graphql/graphQlApiHooks.ts';

const Container = styled.div<{ isDragging: boolean }>`
  position: fixed;
  top: 0;
  display: inline-block;
  cursor: ${({ isDragging }) => (isDragging ? 'grabbing' : 'grab')};
  width: 100%;
  height: 100%;
`;

const ContainerBlock = styled.div<{ isLoading: boolean }>`
  background: linear-gradient(180deg, #d9dae1 0%, #bcc8d7 100%);1px solid #0808081f;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: ${({ isLoading }) => (isLoading ? 'blur(8px)' : 'none')};
  height: 100%;
  width: 100%;
  position: relative;
`;

const LoadingContainer = styled.div`
  width: 50%;
  height: 30dvh;
  min-height: 350px;
  max-width: 350px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  text-align: center;
  transform: translateY(-20%);
`;

const LoadingText = styled.div`
  color: #000000;
  margin-top: 20px;
  font-size: 16px;
  line-height: 20px;
  font-weight: 400;
`;

interface ModelViewerProps {
  modelInfo: MeshRequestEntity | null;
  preview: GetGeneratedPreviewsQuery['getGeneratedPreviews']['data'][0] | null;
}

export const ModelViewerThree: FC<ModelViewerProps> = ({ modelInfo, preview }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isLoadingModel, setIsLoadingModel] = useState(false);

  const rotationRef = useRef<[number, number, number]>([0, 0, 0]);
  const targetRotationRef = useRef<[number, number, number]>([0, 0, 0]);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'q' || event.key.toLowerCase() === 'й') {
        targetRotationRef.current = [
          targetRotationRef.current[0],
          targetRotationRef.current[1] + 0.3,
          targetRotationRef.current[2],
        ];
      } else if (event.key.toLowerCase() === 'e' || event.key.toLowerCase() === 'у') {
        targetRotationRef.current = [
          targetRotationRef.current[0],
          targetRotationRef.current[1] - 0.3,
          targetRotationRef.current[2],
        ];
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (['q', 'й', 'e', 'у'].includes(event.key.toLowerCase())) {
        targetRotationRef.current = [...rotationRef.current];
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    const glbFormat = modelInfo?.meshFormats?.find((format) => format.format.name === 'glb');
    const glbUrl = glbFormat?.url;

    if (glbUrl) {
      let model: THREE.Group;
      let frameId: number;

      const container = containerRef.current;
      if (!container) return;

      setIsLoadingModel(true);

      // Initialize scene
      const scene = new THREE.Scene();

      // Initialize camera
      const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
      camera.position.set(0, 10, 20);
      camera.lookAt(0, 0, 0);

      // Initialize renderer
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      container.appendChild(renderer.domElement);

      // Handle context loss
      renderer.domElement.addEventListener('webglcontextlost', (event) => {
        event.preventDefault();
        console.warn('WebGL context lost');
        setIsLoadingModel(false);
      });

      // Initialize controls
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.minDistance = 5;
      controls.maxDistance = 100;
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;

      // Add lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(10, 20, 10);
      scene.add(directionalLight);

      // Load model
      const loader = new GLTFLoader();
      loader.load(
        glbUrl,
        (gltf) => {
          model = gltf.scene;
          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              if ((mesh.material as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
                const material = mesh.material as THREE.MeshStandardMaterial;
                material.metalness = 0;
              }
            }
          });
          scene.add(model);

          // Center and scale model
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3()).length();
          const center = box.getCenter(new THREE.Vector3());

          model.position.x += model.position.x - center.x;
          model.position.y += model.position.y - center.y;
          model.position.z += model.position.z - center.z;

          camera.near = size / 100;
          camera.far = size * 100;
          camera.updateProjectionMatrix();
          controls.maxDistance = size * 10;
          camera.position.copy(center.clone().add(new THREE.Vector3(0, size / 2.0, size * 2)));
          controls.update();

          setIsLoadingModel(false);
        },
        undefined,
        (error) => {
          console.error('Error loading model', error);
          setIsLoadingModel(false);
        },
      );

      // Handle window resize
      const handleResize = () => {
        if (container) {
          camera.aspect = container.clientWidth / container.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(container.clientWidth, container.clientHeight);
        }
      };
      window.addEventListener('resize', handleResize);

      // Animation
      const rotationSpeed = 0.01;

      const animate = () => {
        frameId = requestAnimationFrame(animate);

        // Update rotation values
        for (let i = 0; i < 3; i++) {
          rotationRef.current[i] += (targetRotationRef.current[i] - rotationRef.current[i]) * rotationSpeed;
        }

        if (model) {
          model.rotation.x = rotationRef.current[0];
          model.rotation.y = rotationRef.current[1];
          model.rotation.z = rotationRef.current[2];
        }

        controls.update();
        renderer.render(scene, camera);
      };
      animate();

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize);
        if (controls) controls.dispose();
        if (renderer) {
          renderer.dispose();
          renderer.forceContextLoss();
          // @ts-expect-error ашипка
          renderer.domElement = null;
        }
        if (container && renderer.domElement) container.removeChild(renderer.domElement);
        if (frameId) cancelAnimationFrame(frameId);
      };
    }
  }, [modelInfo]);

  const isLoading = useMemo(() => !modelInfo?.meshFormats || isLoadingModel, [modelInfo, isLoadingModel]);

  return (
    <CenteredContent>
      <Container isDragging={isDragging}>
        <ContainerBlock isLoading={isLoading}>
          {isLoading ? (
            <LoadingContainer>
              <IconRotator color={'transparent'} />
              <LoadingText>
                Creating interactive model. <span style={{ color: 'rgba(0, 0, 0, 0.5)' }}>Just a moment...</span>
              </LoadingText>
            </LoadingContainer>
          ) : (
            <ErrorBoundary>
              <div
                ref={containerRef}
                onPointerDown={() => setIsDragging(true)}
                onPointerUp={() => setIsDragging(false)}
                onPointerOut={() => setIsDragging(false)}
                style={{
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                }}
              />
            </ErrorBoundary>
          )}
        </ContainerBlock>

        <ModelViewerTools modelInfo={modelInfo} isLoading={isLoading} preview={preview} />
      </Container>
    </CenteredContent>
  );
};
