import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RightSidebar } from './RightSidebar';
import { GenerationStatus, MeshRequestEntity } from '../graphql/graphQlApiHooks';

// Мок для IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  takeRecords() {
    return [];
  }
  unobserve() {}
} as unknown as typeof IntersectionObserver;

jest.mock('../graphql/graphQlApiHooks', () => {
  const actual = jest.requireActual('../graphql/graphQlApiHooks');
  return {
    ...actual,
    GenerationStatus: {
      Pending: 'PENDING',
      Ready: 'READY',
    },
    useGetGeneratedPreviewsQuery: () => ({
      data: { getGeneratedPreviews: { data: [], page: 1, total_pages: 1 } },
      loading: false,
      error: null,
      fetchMore: jest.fn(),
    }),
    useAddToPrintQueueMutation: () => [jest.fn(), { loading: false }],
  };
});

jest.mock('../utils/session', () => ({
  getSessionToken: () => 'mock-token',
}));

jest.mock('../store/viewer', () => ({
  hdriMaps: [{ name: 'Map 1' }, { name: 'Map 2' }],
}));

jest.mock('./RightSidebar.module.css', () => ({
  sidebar: 'sidebar',
  topbar: 'topbar',
  iconCircle: 'iconCircle',
  promptSection: 'promptSection',
  promptLabel: 'promptLabel',
  promptText: 'promptText',
  tabs: 'tabs',
  tabBody: 'tabBody',
  block: 'block',
  blockTitle: 'blockTitle',
  blockBody: 'blockBody',
  row2: 'row2',
  fieldLabel: 'fieldLabel',
  flatSelect: 'flatSelect',
  textureToggle: 'textureToggle',
  propGrid: 'propGrid',
  propLabel: 'propLabel',
  propValue: 'propValue',
  actionButtons: 'actionButtons',
  downloadButton: 'downloadButton',
  printButton: 'printButton',
  catalogGrid: 'catalogGrid',
  catalogItem: 'catalogItem',
  catalogLoading: 'catalogLoading',
  catalogEmpty: 'catalogEmpty',
  catalogLoaderSentinel: 'catalogLoaderSentinel',
  exportModalRoot: 'exportModalRoot',
  themeDark: 'themeDark',
  themeLight: 'themeLight',
  downloadMenuWrapper: 'downloadMenuWrapper',
  downloadMenuHeader: 'downloadMenuHeader',
  downloadButtonWrapper: 'downloadButtonWrapper',
  downloadFormatButton: 'downloadFormatButton',
  downloadButtonIcon: 'downloadButtonIcon',
  noFormats: 'noFormats',
}));

jest.mock('antd', () => {
  const actual = jest.requireActual('antd');
  return {
    ...actual,
    Button: ({
      children,
      disabled,
      ...props
    }: {
      children: React.ReactNode;
      disabled?: boolean;
      [key: string]: unknown;
    }) => (
      <button disabled={disabled} {...props}>
        {children}
      </button>
    ),
    Modal: ({ children, open }: { children: React.ReactNode; open?: boolean }) =>
      open ? <div data-testid="modal">{children}</div> : null,
    Tabs: ({ items }: { items: Array<{ key: string; label: string; children: React.ReactNode }> }) => (
      <div data-testid="tabs">
        {items.map((item) => (
          <div key={item.key} data-testid={`tab-${item.key}`}>
            {item.children}
          </div>
        ))}
      </div>
    ),
    Select: ({
      children,
      value,
      onChange,
      options,
      className,
      ...restProps
    }: {
      children?: React.ReactNode;
      value?: string | number;
      onChange?: (value: string | number) => void;
      options?: Array<{ value: string | number; label: string }>;
      dropdownMatchSelectWidth?: boolean;
      size?: string;
      className?: string;
      [key: string]: unknown;
    }) => {
      const domProps: Record<string, unknown> = {};
      if (value !== undefined) {
        domProps.value = String(value);
      }
      if (onChange) {
        domProps.onChange = (e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value);
      }
      if (className) {
        domProps.className = className;
      }
      const validHtmlAttrs = ['id', 'name', 'disabled', 'required', 'data-testid'];
      validHtmlAttrs.forEach((attr) => {
        if (restProps[attr] !== undefined) {
          domProps[attr] = restProps[attr];
        }
      });
      return (
        <select {...domProps}>
          {options
            ? options.map((opt) => (
                <option key={String(opt.value)} value={String(opt.value)}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
      );
    },
    Spin: () => <div data-testid="spin" />,
    message: {
      error: jest.fn(),
      success: jest.fn(),
    },
  };
});

jest.mock('../components/Icons', () => ({
  MeshTextureIcon: () => <div data-testid="mesh-texture-icon" />,
  DownloadButtonIcon: () => <div data-testid="download-button-icon" />,
}));

describe('RightSidebar', () => {
  const defaultProps = {
    theme: 'light' as const,
    showMesh: true,
    onToggleMesh: jest.fn(),
    modelInfo: {
      id: 'test-mesh-id',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      modelName: 'test-model',
      queryId: 'test-query-id',
      status: GenerationStatus.Ready,
      readyEstimationTime: new Date().toISOString(),
      meshFormats: [
        {
          id: 'format-1',
          url: 'https://example.com/model.glb',
          format: { id: 'format-glb', name: 'glb' },
        },
      ],
    } as MeshRequestEntity,
    position: [0, 0, 0] as [number, number, number],
    rotation: [0, 0, 0] as [number, number, number],
    size: [1, 1, 1] as [number, number, number],
    activeHdriIndex: 0,
    hdriMenuOpen: false,
    onToggleHdriMenu: jest.fn(),
    onSelectHdri: jest.fn(),
    isShowTexture: false,
    onToggleTexture: jest.fn(),
    is3DPrintMode: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Кнопка "Скачать"', () => {
    it('должна быть disabled во время генерации и загрузки модели (isMeshLoading = true)', () => {
      const { getByText } = render(<RightSidebar {...defaultProps} isMeshLoading={true} />);

      const downloadButton = getByText('Скачать');
      expect(downloadButton).toBeDisabled();
    });

    it('должна быть enabled когда модель загружена (isMeshLoading = false)', () => {
      const { getByText } = render(<RightSidebar {...defaultProps} isMeshLoading={false} />);

      const downloadButton = getByText('Скачать');
      expect(downloadButton).not.toBeDisabled();
    });

    it('должна быть enabled когда isMeshLoading не передан (по умолчанию)', () => {
      const { getByText } = render(<RightSidebar {...defaultProps} />);

      const downloadButton = getByText('Скачать');
      expect(downloadButton).not.toBeDisabled();
    });
  });

  describe('Отображение промта', () => {
    it('должен отображать корректный промт при переключении моделей из каталога', () => {
      const mockOnPickFromCatalog = jest.fn();
      const { getByText, rerender } = render(
        <RightSidebar {...defaultProps} currentPrompt="Первый промт" onPickFromCatalog={mockOnPickFromCatalog} />,
      );

      // Проверяем, что первый промт отображается
      expect(getByText('Первый промт')).toBeInTheDocument();

      // Переключаемся на другую модель
      rerender(
        <RightSidebar {...defaultProps} currentPrompt="Второй промт" onPickFromCatalog={mockOnPickFromCatalog} />,
      );

      // Проверяем, что промт обновился
      expect(getByText('Второй промт')).toBeInTheDocument();
      // Старый промт не должен отображаться
      expect(() => getByText('Первый промт')).toThrow();
    });

    it('должен скрывать промт, когда currentPrompt не передан', () => {
      const { queryByText } = render(<RightSidebar {...defaultProps} />);

      const promptLabel = queryByText('Промт:');
      expect(promptLabel).not.toBeInTheDocument();
    });

    it('должен скрывать промт, когда currentPrompt пустой', () => {
      const { queryByText } = render(<RightSidebar {...defaultProps} currentPrompt="" />);

      const promptLabel = queryByText('Промт:');
      expect(promptLabel).not.toBeInTheDocument();
    });
  });
});
