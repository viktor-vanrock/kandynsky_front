import { RGBELoader } from 'three-stdlib';
import * as THREE from 'three';
import { hdriMaps } from '../store/viewer';

const textureCache = new Map<string, THREE.Texture>();
const loadingPromises = new Map<string, Promise<THREE.Texture>>();

/**
 * Предзагружает HDRI карту и сохраняет в память
 * @param url URL HDRI карты
 * @returns Promise с загруженной текстурой
 */
export function preloadHdri(url: string): Promise<THREE.Texture> {
  if (textureCache.has(url)) {
    return Promise.resolve(textureCache.get(url)!);
  }

  if (loadingPromises.has(url)) {
    return loadingPromises.get(url)!;
  }

  const loader = new RGBELoader();
  const promise = new Promise<THREE.Texture>((resolve, reject) => {
    loader.load(
      url,
      (texture) => {
        texture.mapping = THREE.EquirectangularReflectionMapping;

        // Сохраняем в кэш
        textureCache.set(url, texture);
        loadingPromises.delete(url);

        resolve(texture);
      },
      undefined,
      (error) => {
        loadingPromises.delete(url);
        reject(error);
      },
    );
  });

  loadingPromises.set(url, promise);
  return promise;
}

/**
 * Получает текстуру из кэша
 * @param url URL HDRI карты
 * @returns Текстура или null, если не загружена
 */
export function getCachedHdri(url: string): THREE.Texture | null {
  return textureCache.get(url) || null;
}

// предзагружает все HDRI карты из списка
export async function preloadAllHdri(): Promise<void> {
  const urls = hdriMaps.map((map) => map.value).filter(Boolean);

  // загружаем последовательно с небольшой задержкой между запросами
  for (const url of urls) {
    try {
      await preloadHdri(url);
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.warn(`Failed to preload HDR: ${url}`, error);
    }
  }
}

/**
 * Очистка кэша
 */
export function clearHdriCache(): void {
  textureCache.forEach((texture) => texture.dispose());
  textureCache.clear();
  loadingPromises.clear();
}
