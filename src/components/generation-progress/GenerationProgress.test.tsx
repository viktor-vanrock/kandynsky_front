import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GenerationProgress } from './GenerationProgress';

// Мокаем стили, чтобы проверять имена классов
jest.mock('./GenerationProgress.module.css', () => ({
  progressContainer: 'progressContainer',
  progressHeader: 'progressHeader',
  progressBar: 'progressBar',
  progressFill: 'progressFill',
  progressFillIndeterminate: 'progressFillIndeterminate',
  progressFooter: 'progressFooter',
}));

describe('GenerationProgress', () => {
  it('рендерится корректно', () => {
    render(<GenerationProgress estimationSeconds={30} initialEstimationSeconds={60} />);
    expect(screen.getByText('Оставшееся время генерации')).toBeInTheDocument();
    expect(screen.getByText('30 секунд')).toBeInTheDocument();
    expect(screen.getByText('Трудимся над Вашим запросом, нужно немного подождать')).toBeInTheDocument();
  });

  it('показывает прочерк, если estimationSeconds не передан', () => {
    render(<GenerationProgress estimationSeconds={null} initialEstimationSeconds={null} />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  describe('склонение секунд', () => {
    const testCases = [
      [1, '1 секунда'],
      [21, '21 секунда'],
      [101, '101 секунда'],
      [2, '2 секунды'],
      [3, '3 секунды'],
      [4, '4 секунды'],
      [22, '22 секунды'],
      [24, '24 секунды'],
      [5, '5 секунд'],
      [10, '10 секунд'],
      [11, '11 секунд'],
      [14, '14 секунд'],
      [20, '20 секунд'],
      [25, '25 секунд'],
      [111, '111 секунд'],
      [112, '112 секунд'],
    ] as const;

    test.each(testCases)('для %i секунд выводит "%s"', (seconds, expected) => {
      render(<GenerationProgress estimationSeconds={seconds} initialEstimationSeconds={200} />);
      expect(screen.getByText(expected)).toBeInTheDocument();
    });
  });

  it('рассчитывает прогресс корректно', () => {
    // 60 -> 30 (прошло 50%) -> 50% * 0.95 = 47.5%
    render(<GenerationProgress estimationSeconds={30} initialEstimationSeconds={60} />);
    const progressBar = screen.getByTestId('progress-fill');

    expect(progressBar).toHaveStyle({ width: '47.5%' });
    expect(progressBar).toHaveClass('progressFill');
    expect(progressBar).not.toHaveClass('progressFillIndeterminate');
  });

  it('включает анимацию (isIndeterminate) при времени < 2 секунд', () => {
    render(<GenerationProgress estimationSeconds={1} initialEstimationSeconds={60} />);
    const progressBar = screen.getByTestId('progress-fill');

    expect(progressBar).toHaveClass('progressFillIndeterminate');
    expect(progressBar).not.toHaveClass('progressFill');
    // style.width должен отсутствовать (или не проверяем его)
  });

  it('не включает анимацию при времени >= 2 секунд', () => {
    render(<GenerationProgress estimationSeconds={2} initialEstimationSeconds={60} />);
    const progressBar = screen.getByTestId('progress-fill');

    expect(progressBar).toHaveClass('progressFill');
    expect(progressBar).not.toHaveClass('progressFillIndeterminate');
    // При 2 секундах должно быть 95%
    expect(progressBar).toHaveStyle({ width: '95%' });
  });

  it('прогресс 0% при старте', () => {
    // Проверим 0%: estimation = initial
    render(<GenerationProgress estimationSeconds={60} initialEstimationSeconds={60} />);
    expect(screen.getByTestId('progress-fill')).toHaveStyle({ width: '0%' });
  });

  it('не допускает отрицательный прогресс', () => {
    // Если initial=10, estimation=20 (время увеличилось). elapsed=-10. progress < 0 -> 0%
    render(<GenerationProgress estimationSeconds={20} initialEstimationSeconds={10} />);
    expect(screen.getByTestId('progress-fill')).toHaveStyle({ width: '0%' });
  });

  it('не выключает анимацию, если время увеличилось после включения анимации', () => {
    const { rerender } = render(<GenerationProgress estimationSeconds={1} initialEstimationSeconds={60} />);
    const progressBar = screen.getByTestId('progress-fill');

    // Сначала анимация включена
    expect(progressBar).toHaveClass('progressFillIndeterminate');

    // Увеличиваем время до 90 секунд (имитация ситуации "прогресс дошел до 95%, а потом стало 90 сек")
    rerender(<GenerationProgress estimationSeconds={90} initialEstimationSeconds={60} />);

    // Анимация должна остаться
    expect(progressBar).toHaveClass('progressFillIndeterminate');
    expect(progressBar).not.toHaveClass('progressFill');
  });

  it('включает анимацию при зависании времени (10 повторений) и выключает при возобновлении', () => {
    const initialProps = {
      estimationSeconds: 20,
      initialEstimationSeconds: 60,
      estimationTimestamp: 1000,
    };
    const { rerender } = render(<GenerationProgress {...initialProps} />);
    const progressBar = screen.getByTestId('progress-fill');

    expect(progressBar).toHaveClass('progressFill'); // Сначала ок

    // Обновляем тем же значением 10 раз, меняя timestamp, чтобы useEffect сработал
    for (let i = 0; i < 10; i++) {
      rerender(<GenerationProgress {...initialProps} estimationTimestamp={1000 + i + 1} />);
    }

    // Теперь должно включиться
    expect(progressBar).toHaveClass('progressFillIndeterminate');

    // Меняем значение (размораживаем)
    rerender(<GenerationProgress estimationSeconds={19} initialEstimationSeconds={60} estimationTimestamp={2000} />);
    expect(progressBar).toHaveClass('progressFill'); // анимация выключилась
    expect(progressBar).not.toHaveClass('progressFillIndeterminate');
  });
});
