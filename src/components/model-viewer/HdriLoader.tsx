import { useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import { useViewerStore } from '../../store/viewer';
import { getCachedHdri, preloadHdri } from '../../utils/hdriCache';

export const HdriLoader = () => {
  const { gl, scene } = useThree();
  const { hdrMap } = useViewerStore();
  const localCache = useRef<Map<string, THREE.Texture>>(new Map());
  const glRef = useRef(gl);

  // оистка локального кэша при смене контекста
  useEffect(() => {
    if (glRef.current !== gl) {
      localCache.current.forEach((t) => t.dispose());
      localCache.current.clear();
      glRef.current = gl;
    }
  }, [gl]);

  useEffect(() => {
    const url = hdrMap.value;
    if (!url) {
      scene.environment = null;
      return;
    }

    if (localCache.current.has(url)) {
      const texture = localCache.current.get(url)!;
      if (scene.environment !== texture) {
        scene.environment = texture;
      }
      return;
    }
    let isMounted = true;
    const cached = getCachedHdri(url);

    const applyTexture = (texture: THREE.Texture) => {
      if (!isMounted) {
        return;
      }
      localCache.current.set(url, texture);
      scene.environment = texture;
    };

    if (cached) {
      applyTexture(cached);
    } else {
      preloadHdri(url)
        .then((texture) => {
          applyTexture(texture);
        })
        .catch((err) => {
          console.warn('[HdriLoader] Load failed', err);
        });
    }

    return () => {
      isMounted = false;
    };
  }, [hdrMap.value, gl, scene]);

  useEffect(() => {
    const cache = localCache.current;
    return () => {
      cache.forEach((t) => t.dispose());
      cache.clear();
    };
  }, []);

  return null;
};
