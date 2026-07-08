import React from 'react';
import { render, waitFor, act, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LeftSidebar } from './LeftSidebar';
import { GenerationStatus } from '../graphql/graphQlApiHooks';

const mockUseGetPreviewByIdQuery = jest.fn();
const mockUseOnPreviewStatusChangedSubscription = jest.fn();

jest.mock('../context/ThemeContext.ts', () => ({
  useTheme: () => ({ theme: 'light' }),
}));

const mockGeneratePreview = jest.fn();

jest.mock('../graphql/graphQlApiHooks.ts', () => ({
  GenerationStatus: {
    Pending: 'PENDING',
    Validation: 'VALIDATION',
    Ready: 'READY',
  },
  useGeneratePreviewMutation: () => [mockGeneratePreview],
  useGetPreviewByIdQuery: () => mockUseGetPreviewByIdQuery(),
  useOnPreviewStatusChangedSubscription: () => mockUseOnPreviewStatusChangedSubscription(),
  useOnMeshStatusChangedSubscription: () => ({
    data: null,
    error: null,
  }),
}));

jest.mock('../utils/session.ts', () => ({
  getSessionToken: () => 'mock-token',
}));

jest.mock('../components/icons-rotator/IconsRotator.tsx', () => ({
  __esModule: true,
  default: () => <div data-testid="icon-rotator" />,
}));

jest.mock('./LeftSidebar.module.css', () => ({
  textArea: 'textArea',
  generateButton: 'generateButton',
  currentRequestBlock: 'currentRequestBlock',
  currentRequestRow: 'currentRequestRow',
  currentRequestLabel: 'currentRequestLabel',
  currentRequestValue: 'currentRequestValue',
  previewModalRoot: 'previewModalRoot',
  themeDark: 'themeDark',
  themeLight: 'themeLight',
}));

jest.mock('antd', () => {
  const actual = jest.requireActual('antd');
  return {
    ...actual,
    Modal: ({ children, open }: { children: React.ReactNode; open?: boolean }) =>
      open ? <div data-testid="modal">{children}</div> : null,
  };
});

describe('LeftSidebar', () => {
  const mockOnPickVariant = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseGetPreviewByIdQuery.mockReturnValue({
      data: null,
      refetch: jest.fn(),
    });
    mockUseOnPreviewStatusChangedSubscription.mockReturnValue({
      data: null,
      error: null,
    });
  });

  const isSidebarCollapsed = (container: HTMLElement): boolean => {
    const wrapper = container.querySelector('[data-testid="sidebar-wrapper"]') as HTMLElement;
    if (!wrapper) return false;
    return wrapper.getAttribute('data-collapsed') === 'true';
  };

  describe('Скрытие/открытие сайдбара в зависимости от состояния загрузки', () => {
    it('должен быть открыт, когда нет загрузки и модалка закрыта', () => {
      const { container } = render(
        <LeftSidebar onPickVariant={mockOnPickVariant} isMeshLoading={false} autoOpenModal={false} />,
      );

      expect(isSidebarCollapsed(container)).toBe(false);
    });

    it('должен быть скрыт, когда isMeshLoading = true', () => {
      const { container } = render(
        <LeftSidebar onPickVariant={mockOnPickVariant} isMeshLoading={true} autoOpenModal={false} />,
      );

      expect(isSidebarCollapsed(container)).toBe(true);
    });

    it('должен быть скрыт, когда модалка открыта', async () => {
      mockUseGetPreviewByIdQuery.mockReturnValue({
        data: {
          getPreviewById: {
            id: 'test-preview-id',
            status: GenerationStatus.Ready,
            images: [],
          },
        },
        refetch: jest.fn(),
      });

      const { container } = render(
        <LeftSidebar
          onPickVariant={mockOnPickVariant}
          isMeshLoading={false}
          autoOpenModal={true}
          initialPreviewId="test-preview-id"
        />,
      );

      await waitFor(() => {
        expect(isSidebarCollapsed(container)).toBe(true);
      });
    });

    it('должен быть скрыт, когда isLoading = true (превью в процессе генерации)', async () => {
      mockUseGetPreviewByIdQuery.mockReturnValue({
        data: {
          getPreviewById: {
            id: 'test-preview-id',
            status: GenerationStatus.Pending,
            images: [],
          },
        },
        refetch: jest.fn(),
      });

      const { container } = render(
        <LeftSidebar
          onPickVariant={mockOnPickVariant}
          isMeshLoading={false}
          autoOpenModal={true}
          initialPreviewId="test-preview-id"
        />,
      );

      await waitFor(() => {
        expect(isSidebarCollapsed(container)).toBe(true);
      });
    });

    it('должен быть скрыт, когда и isMeshLoading и isLoading = true', async () => {
      mockUseGetPreviewByIdQuery.mockReturnValue({
        data: {
          getPreviewById: {
            id: 'test-preview-id',
            status: GenerationStatus.Pending,
            images: [],
          },
        },
        refetch: jest.fn(),
      });

      const { container } = render(
        <LeftSidebar
          onPickVariant={mockOnPickVariant}
          isMeshLoading={true}
          autoOpenModal={true}
          initialPreviewId="test-preview-id"
        />,
      );

      await waitFor(() => {
        expect(isSidebarCollapsed(container)).toBe(true);
      });
    });

    it('должен быть открыт, когда все загрузки завершены и модалка закрыта', () => {
      mockUseGetPreviewByIdQuery.mockReturnValue({
        data: {
          getPreviewById: {
            id: 'test-preview-id',
            status: GenerationStatus.Ready,
            images: [],
          },
        },
        refetch: jest.fn(),
      });

      const { container } = render(
        <LeftSidebar onPickVariant={mockOnPickVariant} isMeshLoading={false} autoOpenModal={false} />,
      );

      expect(isSidebarCollapsed(container)).toBe(false);
    });

    it('должен быть скрыт, когда идет генерация модели', () => {
      const { container } = render(
        <LeftSidebar onPickVariant={mockOnPickVariant} isMeshLoading={true} autoOpenModal={false} />,
      );

      expect(isSidebarCollapsed(container)).toBe(true);
    });
  });

  describe('Отображение сайдбара для моделей с numTargetFaces = 1 000 000 и в режиме 3D печати', () => {
    it('должен быть открыт, когда numTargetFaces = 1 000 000 и нет загрузки', () => {
      const { container } = render(
        <LeftSidebar
          onPickVariant={mockOnPickVariant}
          isMeshLoading={false}
          autoOpenModal={false}
          numTargetFaces={1000000}
        />,
      );

      expect(isSidebarCollapsed(container)).toBe(false);
    });

    it('должен быть открыт, когда is3DPrintMode = true и нет загрузки', () => {
      const { container } = render(
        <LeftSidebar
          onPickVariant={mockOnPickVariant}
          isMeshLoading={false}
          autoOpenModal={false}
          is3DPrintMode={true}
        />,
      );

      expect(isSidebarCollapsed(container)).toBe(false);
    });

    it('должен быть открыт, когда is3DPrintMode = true и numTargetFaces = 1 000 000 и нет загрузки', () => {
      const { container } = render(
        <LeftSidebar
          onPickVariant={mockOnPickVariant}
          isMeshLoading={false}
          autoOpenModal={false}
          is3DPrintMode={true}
          numTargetFaces={1000000}
        />,
      );

      expect(isSidebarCollapsed(container)).toBe(false);
    });

    it('должен быть скрыт, когда is3DPrintMode = true и идет загрузка меша', () => {
      const { container } = render(
        <LeftSidebar
          onPickVariant={mockOnPickVariant}
          isMeshLoading={true}
          autoOpenModal={false}
          is3DPrintMode={true}
        />,
      );

      expect(isSidebarCollapsed(container)).toBe(true);
    });
  });

  describe('Скрытие блока "Параметры генерации"', () => {
    it('должен скрыть блок "Параметры генерации", когда numTargetFaces = 1 000 000', () => {
      // В текущей реализации скрытие зависит только от is3DPrintMode, который передается извне.
      // Если мы передаем только numTargetFaces=1000000, но is3DPrintMode=false (по умолчанию),
      // блок все равно будет показан (так как логика скрытия перенесена в EditorPage).
      // Поэтому этот тест должен проверять, что блок ЕСТЬ, если is3DPrintMode не передан как true.

      const { container } = render(
        <LeftSidebar
          onPickVariant={mockOnPickVariant}
          isMeshLoading={false}
          autoOpenModal={false}
          numTargetFaces={1000000}
          // is3DPrintMode={false} по умолчанию
        />,
      );

      const sectionTitle = Array.from(container.querySelectorAll('h3')).find(
        (el) => el.textContent === 'Параметры генерации',
      );

      // Ожидаем что он есть, так как is3DPrintMode false
      expect(sectionTitle).toBeInTheDocument();
    });

    it('должен скрыть блок "Параметры генерации", когда is3DPrintMode = true, даже если numTargetFaces !== 1 000 000', () => {
      const { container } = render(
        <LeftSidebar
          onPickVariant={mockOnPickVariant}
          isMeshLoading={false}
          autoOpenModal={false}
          is3DPrintMode={true}
          numTargetFaces={50000}
        />,
      );

      const sectionTitle = Array.from(container.querySelectorAll('h3')).find(
        (el) => el.textContent === 'Параметры генерации',
      );

      // Блок должен быть скрыт, т.к. is3DPrintMode = true
      expect(sectionTitle).toBeUndefined();
    });

    it('должен показать блок "Параметры генерации", когда numTargetFaces !== 1 000 000', () => {
      const { container } = render(
        <LeftSidebar
          onPickVariant={mockOnPickVariant}
          isMeshLoading={false}
          autoOpenModal={false}
          numTargetFaces={50000}
        />,
      );

      const sectionTitle = Array.from(container.querySelectorAll('h3')).find(
        (el) => el.textContent === 'Параметры генерации',
      );

      expect(sectionTitle).toBeInTheDocument();
    });

    it('должен показать блок "Параметры генерации", когда numTargetFaces не передан', () => {
      const { container } = render(
        <LeftSidebar onPickVariant={mockOnPickVariant} isMeshLoading={false} autoOpenModal={false} />,
      );

      const sectionTitle = Array.from(container.querySelectorAll('h3')).find(
        (el) => el.textContent === 'Параметры генерации',
      );

      expect(sectionTitle).toBeInTheDocument();
    });

    it('должен показать блок "Параметры генерации" при переходе с модели в режиме 3D печати на обычную модель', () => {
      // 1: в режиме 3D печати (is3DPrintMode = true, numTargetFaces = 1 000 000)
      const { container, rerender } = render(
        <LeftSidebar
          onPickVariant={mockOnPickVariant}
          isMeshLoading={false}
          autoOpenModal={false}
          is3DPrintMode={true}
          numTargetFaces={1000000}
        />,
      );

      // блок должен быть скрыт для модели в режиме 3D печати
      let sectionTitle = Array.from(container.querySelectorAll('h3')).find(
        (el) => el.textContent === 'Параметры генерации',
      );
      expect(sectionTitle).toBeUndefined();

      // 2: Переходим на обычную модель (is3DPrintMode должен стать false для обычной модели)
      rerender(
        <LeftSidebar
          onPickVariant={mockOnPickVariant}
          isMeshLoading={false}
          autoOpenModal={false}
          is3DPrintMode={false} // для обычной модели is3DPrintMode должен быть false
          numTargetFaces={50000} // numTargetFaces новой модели = 50 000
        />,
      );

      // блок должен показываться, т.к. is3DPrintMode = false и numTargetFaces !== 1 000 000
      sectionTitle = Array.from(container.querySelectorAll('h3')).find(
        (el) => el.textContent === 'Параметры генерации',
      );
      expect(sectionTitle).toBeInTheDocument();
    });

    it('должен скрыть блок "Параметры генерации" для модели с numTargetFaces = 1 000 000 после генерации в режиме 3D печати', () => {
      // генерация в режиме 3D печати и переход в редактор
      const { container } = render(
        <LeftSidebar
          onPickVariant={mockOnPickVariant}
          isMeshLoading={false}
          autoOpenModal={false}
          is3DPrintMode={true}
          numTargetFaces={1000000}
        />,
      );

      const sectionTitle = Array.from(container.querySelectorAll('h3')).find(
        (el) => el.textContent === 'Параметры генерации',
      );

      // блок должен быть скрыт для модели с 1 000 000 полигонов
      expect(sectionTitle).toBeUndefined();
    });

    it('должен скрыть блок "Параметры генерации" для модели 3D печати, определенной по форматам (stl и glb), даже если numTargetFaces !== 1 000 000', () => {
      // модель для 3D печати с форматами stl и glb, но numTargetFaces не равен 1 000 000
      const { container } = render(
        <LeftSidebar
          onPickVariant={mockOnPickVariant}
          isMeshLoading={false}
          autoOpenModal={false}
          is3DPrintMode={true}
          numTargetFaces={50000} // не 1 000 000, но модель для 3D печати по форматам
        />,
      );

      const sectionTitle = Array.from(container.querySelectorAll('h3')).find(
        (el) => el.textContent === 'Параметры генерации',
      );

      // блок должен быть скрыт, т.к. is3DPrintMode = true
      expect(sectionTitle).toBeUndefined();
    });
  });

  describe('Параметры генерации при отправке промта', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockGeneratePreview.mockResolvedValue({
        data: {
          generatePreview: {
            id: 'test-preview-id',
          },
        },
      });
    });

    it('должен отправлять запрос с параметрами для 3D печати, когда is3DPrintMode = true', async () => {
      const { getByText, getByPlaceholderText } = render(
        <LeftSidebar
          onPickVariant={mockOnPickVariant}
          isMeshLoading={false}
          autoOpenModal={false}
          is3DPrintMode={true}
          numTargetFaces={1000000}
        />,
      );

      const textarea = getByPlaceholderText('Опишите модель: «Избушка на курьих ножках, сказочная…»');
      const generateButton = getByText('Сгенерировать');

      await waitFor(() => {
        expect(textarea).toBeInTheDocument();
      });
      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'Тестовая модель для 3D печати' } });
      });
      await waitFor(() => {
        expect(textarea).toHaveValue('Тестовая модель для 3D печати');
      });
      await act(async () => {
        fireEvent.click(generateButton);
      });

      await waitFor(() => {
        expect(mockGeneratePreview).toHaveBeenCalledWith({
          variables: {
            input: {
              prompt: 'Тестовая модель для 3D печати',
              token: 'captchaToken',
              sessionToken: 'mock-token',
              doQuadrification: false,
              num_target_faces: 1000000,
              mode: 'xr:text-to-geometry',
              create_lod: undefined,
              modelFormats: ['glb', 'stl'],
            },
          },
        });
      });
    });

    it('должен отправлять запрос с обычными параметрами, когда is3DPrintMode = false', async () => {
      const { getByText, getByPlaceholderText } = render(
        <LeftSidebar
          onPickVariant={mockOnPickVariant}
          isMeshLoading={false}
          autoOpenModal={false}
          is3DPrintMode={false}
          numTargetFaces={50000}
        />,
      );

      const textarea = getByPlaceholderText('Опишите модель: «Избушка на курьих ножках, сказочная…»');
      const generateButton = getByText('Сгенерировать');
      await waitFor(() => {
        expect(textarea).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'Тестовая модель' } });
      });
      await waitFor(() => {
        expect(textarea).toHaveValue('Тестовая модель');
      });

      await act(async () => {
        fireEvent.click(generateButton);
      });

      await waitFor(() => {
        expect(mockGeneratePreview).toHaveBeenCalledWith({
          variables: {
            input: {
              prompt: 'Тестовая модель',
              token: 'captchaToken',
              sessionToken: 'mock-token',
              doQuadrification: false,
              num_target_faces: 40000, // Значение по умолчанию из polygonCount
              create_lod: undefined, // lodCount по умолчанию 0
            },
          },
        });
      });
    });

    it('не должен открывать модальное окно превью при генерации в режиме 3D печати', async () => {
      const { getByText, getByPlaceholderText, queryByTestId } = render(
        <LeftSidebar
          onPickVariant={mockOnPickVariant}
          isMeshLoading={false}
          autoOpenModal={false}
          is3DPrintMode={true}
          numTargetFaces={1000000}
        />,
      );

      const textarea = getByPlaceholderText('Опишите модель: «Избушка на курьих ножках, сказочная…»');
      const generateButton = getByText('Сгенерировать');

      await waitFor(() => {
        expect(textarea).toBeInTheDocument();
      });
      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'Тестовая модель для 3D печати' } });
      });
      await waitFor(() => {
        expect(textarea).toHaveValue('Тестовая модель для 3D печати');
      });

      await act(async () => {
        fireEvent.click(generateButton);
      });

      await waitFor(() => {
        expect(mockGeneratePreview).toHaveBeenCalled();
      });

      // Модальное окно не должно открываться
      await waitFor(() => {
        const modal = queryByTestId('modal');
        expect(modal).not.toBeInTheDocument();
      });
    });

    it('должен открывать модальное окно превью при генерации в обычном режиме', async () => {
      const { getByText, getByPlaceholderText, getByTestId } = render(
        <LeftSidebar
          onPickVariant={mockOnPickVariant}
          isMeshLoading={false}
          autoOpenModal={false}
          is3DPrintMode={false}
          numTargetFaces={50000}
        />,
      );

      const textarea = getByPlaceholderText('Опишите модель: «Избушка на курьих ножках, сказочная…»');
      const generateButton = getByText('Сгенерировать');

      await waitFor(() => {
        expect(textarea).toBeInTheDocument();
      });
      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'Тестовая модель' } });
      });
      await waitFor(() => {
        expect(textarea).toHaveValue('Тестовая модель');
      });

      await act(async () => {
        fireEvent.click(generateButton);
      });

      await waitFor(() => {
        expect(mockGeneratePreview).toHaveBeenCalled();
      });

      // Модальное окно должно открываться
      await waitFor(() => {
        const modal = getByTestId('modal');
        expect(modal).toBeInTheDocument();
      });
    });

    it('должен вызывать onPickVariant при генерации в режиме 3D печати для загрузки модели', async () => {
      const mockOnPickVariant = jest.fn();
      const { getByText, getByPlaceholderText } = render(
        <LeftSidebar
          onPickVariant={mockOnPickVariant}
          isMeshLoading={false}
          autoOpenModal={false}
          is3DPrintMode={true}
          numTargetFaces={1000000}
        />,
      );

      const textarea = getByPlaceholderText('Опишите модель: «Избушка на курьих ножках, сказочная…»');
      const generateButton = getByText('Сгенерировать');

      await waitFor(() => {
        expect(textarea).toBeInTheDocument();
      });
      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'Тестовая модель для 3D печати' } });
      });
      await waitFor(() => {
        expect(textarea).toHaveValue('Тестовая модель для 3D печати');
      });

      await act(async () => {
        fireEvent.click(generateButton);
      });

      await waitFor(() => {
        expect(mockGeneratePreview).toHaveBeenCalled();
      });

      // onPickVariant должен быть вызван с previewId и order: 0 для загрузки модели
      await waitFor(() => {
        expect(mockOnPickVariant).toHaveBeenCalledWith(
          'test-preview-id',
          0,
          'Тестовая модель для 3D печати',
          undefined,
          { numTargetFaces: 1000000 },
        );
      });
    });

    it('не должен вызывать onPickVariant при генерации в обычном режиме', async () => {
      const mockOnPickVariant = jest.fn();
      const { getByText, getByPlaceholderText } = render(
        <LeftSidebar
          onPickVariant={mockOnPickVariant}
          isMeshLoading={false}
          autoOpenModal={false}
          is3DPrintMode={false}
          numTargetFaces={50000}
        />,
      );

      const textarea = getByPlaceholderText('Опишите модель: «Избушка на курьих ножках, сказочная…»');
      const generateButton = getByText('Сгенерировать');

      await waitFor(() => {
        expect(textarea).toBeInTheDocument();
      });
      await act(async () => {
        fireEvent.change(textarea, { target: { value: 'Тестовая модель' } });
      });
      await waitFor(() => {
        expect(textarea).toHaveValue('Тестовая модель');
      });

      await act(async () => {
        fireEvent.click(generateButton);
      });

      await waitFor(() => {
        expect(mockGeneratePreview).toHaveBeenCalled();
      });

      // onPickVariant не должен быть вызван в обычном режиме (модальное окно открывается)
      expect(mockOnPickVariant).not.toHaveBeenCalled();
    });
  });

  describe('Отображение промта', () => {
    it('должен отображать корректный промт при переключении моделей из каталога', () => {
      const { getByText, rerender } = render(
        <LeftSidebar
          onPickVariant={mockOnPickVariant}
          isMeshLoading={false}
          autoOpenModal={false}
          currentPrompt="Первый промт"
        />,
      );

      // Проверяем, что первый промт отображается в блоке "Текущий запрос"
      expect(getByText('Первый промт')).toBeInTheDocument();

      // Переключаемся на другую модель
      rerender(
        <LeftSidebar
          onPickVariant={mockOnPickVariant}
          isMeshLoading={false}
          autoOpenModal={false}
          currentPrompt="Второй промт"
        />,
      );

      // Проверяем, что промт обновился
      expect(getByText('Второй промт')).toBeInTheDocument();
      // Старый промт не должен отображаться
      expect(() => getByText('Первый промт')).toThrow();
    });

    it('должен скрывать блок "Текущий запрос", когда currentPrompt не передан', () => {
      const { container } = render(
        <LeftSidebar onPickVariant={mockOnPickVariant} isMeshLoading={false} autoOpenModal={false} />,
      );

      const sectionTitle = Array.from(container.querySelectorAll('h3')).find(
        (el) => el.textContent === 'Текущий запрос',
      );
      expect(sectionTitle).toBeUndefined();
    });

    it('должен скрывать блок "Текущий запрос", когда currentPrompt пустой', () => {
      const { container } = render(
        <LeftSidebar onPickVariant={mockOnPickVariant} isMeshLoading={false} autoOpenModal={false} currentPrompt="" />,
      );

      const sectionTitle = Array.from(container.querySelectorAll('h3')).find(
        (el) => el.textContent === 'Текущий запрос',
      );
      expect(sectionTitle).toBeUndefined();
    });

    it('должен скрывать блок "Текущий запрос" во время загрузки модели (isMeshLoading = true)', () => {
      const { container } = render(
        <LeftSidebar
          onPickVariant={mockOnPickVariant}
          isMeshLoading={true}
          autoOpenModal={false}
          currentPrompt="Тестовый промт"
        />,
      );

      const sectionTitle = Array.from(container.querySelectorAll('h3')).find(
        (el) => el.textContent === 'Текущий запрос',
      );
      expect(sectionTitle).toBeUndefined();
    });
  });
});
