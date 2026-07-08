import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useInIframe } from './useInIframe.ts';
import { useGameDevStore } from '../store/gamedev.ts';

const DEFAULT_MESSAGE_TYPE = 'height';
const DEFAULT_RESET_HEIGHT = 900;
const getTargetOrigin = () => import.meta.env.VITE_PARENT_ORIGIN?.trim() || 'https://developers.sber.ru';

export const postIframeScrollUp = (context?: string) => {
  if (typeof window === 'undefined') return;
  const targetOrigin = getTargetOrigin();
  console.log('[iframe-scroll-up]', { context, targetOrigin, pathname: window.location?.pathname });
  window.parent.postMessage({ type: 'scrollUp' }, targetOrigin);
};

export const useIframeAutoResize = () => {
  const inIframe = useInIframe();
  const location = useLocation();
  const selectedMode = useGameDevStore((state) => state.selectedMode);

  const heightCacheRef = useRef<Record<string, number>>({});
  const prevModeRef = useRef<string>(selectedMode);
  const resetTimeoutRef = useRef<number | null>(null);
  const modeJustChangedRef = useRef<boolean>(false);
  const modeForcePostsLeftRef = useRef<number>(0);

  useEffect(() => {
    if (!inIframe || location.pathname !== '/') {
      return;
    }

    if (prevModeRef.current !== selectedMode) {
      modeJustChangedRef.current = true;
      modeForcePostsLeftRef.current = 2;
      prevModeRef.current = selectedMode;

      const targetOrigin = getTargetOrigin();

      window.parent.postMessage({ type: DEFAULT_MESSAGE_TYPE, height: DEFAULT_RESET_HEIGHT }, targetOrigin);

      delete heightCacheRef.current[selectedMode];

      console.log('[iframe-resize-mode-reset]', {
        prevMode: prevModeRef.current,
        newMode: selectedMode,
        resetHeight: DEFAULT_RESET_HEIGHT,
        clearedCache: selectedMode,
      });

      setTimeout(() => {
        modeJustChangedRef.current = false;
      }, 1500);
    }

    return () => {
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
        resetTimeoutRef.current = null;
      }
    };
  }, [inIframe, location.pathname, selectedMode]);

  useEffect(() => {
    if (!inIframe) {
      return;
    }

    const targetOrigin = getTargetOrigin();

    let lastHeight = modeJustChangedRef.current ? 0 : (heightCacheRef.current[selectedMode] || 0);
    let rafId: number | null = null;
    let debounceTimer: number | null = null;
    const timeouts: number[] = [];

    const html = document.documentElement;
    const body = document.body;

    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;

    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';

    const getDocumentHeight = (pathname: string) => {
      const { body, documentElement } = document;
      if (!body || !documentElement) return 0;

      const isModelPage = /^\/[^/]+\/\d+\/?$/.test(pathname);
      const isEditorPage = pathname.startsWith('/editor');
      if (isEditorPage || isModelPage) return 980;

      const prevBodyHeight = body.style.height;
      const prevHtmlHeight = html.style.height;

      body.style.height = 'auto';
      html.style.height = 'auto';

      const height = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        documentElement.scrollHeight,
        documentElement.offsetHeight,
      );

      body.style.height = prevBodyHeight;
      html.style.height = prevHtmlHeight;

      console.log('[iframe-resize-measured]', {
        mode: selectedMode,
        height,
        bodyScrollHeight: body.scrollHeight,
        bodyOffsetHeight: body.offsetHeight,
        docScrollHeight: documentElement.scrollHeight,
        docOffsetHeight: documentElement.offsetHeight,
      });

      return height;
    };

    const postHeight = (nextHeight: number, forcePost = false) => {
      if (!nextHeight) {
        console.log('[iframe-resize-post-blocked]', { reason: 'height is 0', nextHeight, mode: selectedMode });
        return;
      }

      const heightDiff = Math.abs(nextHeight - lastHeight);
      const threshold = 10;

      if (!forcePost && lastHeight > 0 && heightDiff < threshold) {
        console.log('[iframe-resize-post-blocked]', {
          reason: 'too small change',
          nextHeight,
          lastHeight,
          diff: heightDiff,
          mode: selectedMode,
        });
        return;
      }

      const prevHeight = lastHeight;
      heightCacheRef.current[selectedMode] = nextHeight;
      lastHeight = nextHeight;

      console.log('[iframe-resize-post-sent]', {
        height: nextHeight,
        mode: selectedMode,
        prevHeight,
        diff: heightDiff,
        forcePost,
      });
      if (forcePost && modeForcePostsLeftRef.current > 0) {
        modeForcePostsLeftRef.current -= 1;
      }
      window.parent.postMessage({ type: DEFAULT_MESSAGE_TYPE, height: nextHeight }, targetOrigin);
    };

    const measureAndPost = (force = false) => {
      const cachedHeight = heightCacheRef.current[selectedMode];
      const forcePost = modeForcePostsLeftRef.current > 0;

      if (!force && cachedHeight) {
        console.log('[iframe-resize-cached]', { mode: selectedMode, cachedHeight });
        postHeight(cachedHeight, forcePost);
        return;
      }

      const height = getDocumentHeight(location.pathname);
      postHeight(height, forcePost);
    };

    const scheduleMeasure = (force = false) => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        rafId = null;
        measureAndPost(force);
      });
    };

    const debouncedScheduleMeasure = () => {
      if (modeJustChangedRef.current) {
        console.log('[iframe-resize-observer-ignored]', { reason: 'mode just changed', mode: selectedMode });
        return;
      }
      
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = window.setTimeout(() => {
        debounceTimer = null;
        console.log('[iframe-resize-observer-triggered]', { mode: selectedMode });
        scheduleMeasure(true);
      }, 100);
    };

    const resizeObserver =
      typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => debouncedScheduleMeasure()) : null;

    if (resizeObserver) {
      resizeObserver.observe(document.body);
    }

    const mutationObserver =
      !resizeObserver && typeof MutationObserver !== 'undefined'
        ? new MutationObserver(() => scheduleMeasure(true))
        : null;

    if (mutationObserver) {
      const targetNode = document.body || document.documentElement || document;
      mutationObserver.observe(targetNode, { attributes: true, childList: true, subtree: true });
    }

    const resizeHandler = () => scheduleMeasure(true);
    const loadHandler = () => scheduleMeasure(true);
    const orientationHandler = () => scheduleMeasure(true);

    window.addEventListener('resize', resizeHandler);
    window.addEventListener('orientationchange', orientationHandler);
    window.addEventListener('load', loadHandler);

    const initialDelay = modeJustChangedRef.current ? 350 : 0;

    if (initialDelay > 0) {
      resetTimeoutRef.current = window.setTimeout(() => {
        console.log('[iframe-resize-measure-after-reset]', { mode: selectedMode, delay: initialDelay });
        scheduleMeasure(true);
        resetTimeoutRef.current = null;
      }, initialDelay);
    } else {
      scheduleMeasure(false);
    }

    const additionalDelays = modeJustChangedRef.current
      ? [initialDelay + 150, initialDelay + 350, initialDelay + 600, initialDelay + 1000]
      : [160, 400];

    additionalDelays.forEach((delay) => {
      const id = window.setTimeout(() => {
        console.log('[iframe-resize-additional-measure]', { mode: selectedMode, delay });
        scheduleMeasure(true);
      }, delay);
      timeouts.push(id);
    });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (debounceTimer) clearTimeout(debounceTimer);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      window.removeEventListener('resize', resizeHandler);
      window.removeEventListener('orientationchange', orientationHandler);
      window.removeEventListener('load', loadHandler);
      timeouts.forEach(clearTimeout);
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, [inIframe, location.pathname, location.search, location.hash, selectedMode]);
};
