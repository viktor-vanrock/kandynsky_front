import { FC, useMemo, useState, useEffect, useRef } from 'react';
import styles from './GenerationProgress.module.css';

interface GenerationProgressProps {
  estimationSeconds: number | null;
  initialEstimationSeconds: number | null;
  estimationTimestamp?: number;
}

const getSecondsWord = (number: number) => {
  const lastDigit = number % 10;
  const lastTwoDigits = number % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'секунд';
  }
  if (lastDigit === 1) {
    return 'секунда';
  }
  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'секунды';
  }
  return 'секунд';
};

export const GenerationProgress: FC<GenerationProgressProps> = ({
  estimationSeconds,
  initialEstimationSeconds,
  estimationTimestamp,
}) => {
  // Флаг: время истекло (< 2 сек). Необратимо.
  const [isFinishedTime, setIsFinishedTime] = useState(false);
  // Флаг: таймер завис на одном значении. Обратимо.
  const [isStuck, setIsStuck] = useState(false);
  const [isCalculating, setIsCalculating] = useState(true);
  const [hasStartedCountdown, setHasStartedCountdown] = useState(false);
  const prevSecondsRef = useRef<number | null>(null);
  const stuckCounterRef = useRef(0);
  const lastTimestampRef = useRef<number | undefined>(undefined);

  const STUCK_COUNT = 10;

  // сброс расчета
  const resetCalculationState = (fullReset = false) => {
    setIsCalculating(true);
    prevSecondsRef.current = null;
    setHasStartedCountdown(false);
    if (fullReset) {
      stuckCounterRef.current = 0;
      setIsFinishedTime(false);
      setIsStuck(false);
    }
  };

  useEffect(() => {
    if (estimationTimestamp !== undefined && estimationTimestamp !== lastTimestampRef.current) {
      resetCalculationState(true);
      lastTimestampRef.current = estimationTimestamp;
    }
  }, [estimationTimestamp]);

  useEffect(() => {
    if (estimationSeconds === null) {
      resetCalculationState();
      return;
    }

    // проверяем текущее значение с предыдущим
    if (isCalculating) {
      if (prevSecondsRef.current === null) {
        prevSecondsRef.current = estimationSeconds;
        if (estimationSeconds > 0) {
          setIsCalculating(false);
          setHasStartedCountdown(true);
        }
        return;
      }

      if (estimationSeconds === prevSecondsRef.current) {
        return;
      }

      setIsCalculating(false);
      setHasStartedCountdown(true);
      prevSecondsRef.current = estimationSeconds;
    }

    if (!hasStartedCountdown) {
      setHasStartedCountdown(true);
    }

    // если осталось меньше 2 секунд то включаем бесконечную анимацию
    if (estimationSeconds < 2) {
      setIsFinishedTime(true);
      return;
    }

    if (isFinishedTime) return;

    if (estimationSeconds === prevSecondsRef.current) {
      stuckCounterRef.current += 1;
      // включаем анимацию если приходит одно и тоже
      if (stuckCounterRef.current >= STUCK_COUNT) {
        setIsStuck(true);
      }
    } else {
      stuckCounterRef.current = 0;
      setIsStuck(false);
    }

    prevSecondsRef.current = estimationSeconds;
  }, [estimationSeconds, isFinishedTime, isCalculating, estimationTimestamp, hasStartedCountdown]);

  const isIndeterminate = isFinishedTime || isStuck || isCalculating;
  const isFinishing = isIndeterminate && !isCalculating && hasStartedCountdown;

  // вычипрогресса от 0 до 95%
  const progressPercent = useMemo(() => {
    if (!initialEstimationSeconds || !estimationSeconds) {
      return 0;
    }
    if (estimationSeconds <= 2) {
      return 95;
    }
    // вычисляем прогресс
    const elapsed = initialEstimationSeconds - estimationSeconds;
    const progress = (elapsed / initialEstimationSeconds) * 95;
    // ограничиваем максимум 95%
    return Math.min(95, Math.max(0, progress));
  }, [initialEstimationSeconds, estimationSeconds]);

  const timeText = useMemo(() => {
    if (isCalculating) {
      return 'Рассчитываем время генерации';
    }
    if (isFinishing) {
      return 'Завершаем генерацию';
    }
    if (estimationSeconds) {
      const roundedSeconds = Math.round(estimationSeconds);
      return `${roundedSeconds} ${getSecondsWord(roundedSeconds)}`;
    }
    return '-';
  }, [isCalculating, isFinishing, estimationSeconds]);

  return (
    <div className={styles.progressContainer}>
      <div className={styles.progressHeader}>
        {isCalculating || isFinishing ? (
          <span>{timeText}</span>
        ) : (
          <>
            <span>Оставшееся время генерации</span>
            <span>{timeText}</span>
          </>
        )}
      </div>
      <div className={styles.progressBar}>
        <div
          data-testid="progress-fill"
          className={isIndeterminate ? styles.progressFillIndeterminate : styles.progressFill}
          style={!isIndeterminate ? { width: `${progressPercent}%` } : undefined}
        />
      </div>
      <div className={styles.progressFooter}>Трудимся над Вашим запросом, нужно немного подождать</div>
    </div>
  );
};
