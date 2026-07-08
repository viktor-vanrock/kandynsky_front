import { useEffect, useRef, useState } from 'react';

export function useIdleWarning(timeoutMs: number) {
  const [isIdle, setIsIdle] = useState(false);
  const lastActiveRef = useRef(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const resetTimer = () => {
      lastActiveRef.current = Date.now();
      if (isIdle) setIsIdle(false);
    };

    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('click', resetTimer);

    // проверяем раз в минуту, были ли какие-то действия
    const checkInterval = 60 * 1000;

    timeoutRef.current = setInterval(() => {
      if (Date.now() - lastActiveRef.current > timeoutMs) {
        setIsIdle(true);
      }
    }, checkInterval);

    return () => {
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('click', resetTimer);
      if (timeoutRef.current) clearInterval(timeoutRef.current);
    };
  }, [timeoutMs, isIdle]);

  return isIdle;
}
