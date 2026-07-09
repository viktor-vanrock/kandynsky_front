import { getLocalizedLoadingTexts } from "../utils/const";
import type { Translations } from "../context/LocaleContext";

export const isMobileDevice = () => {
  return (
    /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
    window.matchMedia('(hover: none) and (pointer: coarse)').matches
  );
};

export const testViewerPage = (pathname: string) => {
  const regex = /^\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/\d+$/i;
  return regex.test(pathname);
};

export function getRandomLoadingText(t: Translations) {
  const texts = getLocalizedLoadingTexts(t);
  const randomIndex = Math.floor(Math.random() * texts.length);
  return texts[randomIndex];
}