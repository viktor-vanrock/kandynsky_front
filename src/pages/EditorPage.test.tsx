import { render, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditorPage from './EditorPage';
import { GenerationStatus } from '../graphql/graphQlApiHooks';

const mockNavigate = jest.fn();
let mockLocationState: {
  previewId?: string;
  order?: number;
  skipPreview?: boolean;
  is3DPrintMode?: boolean;
  isGameDevMode?: boolean;
} = {
  previewId: 'test-preview-id',
  order: 0,
  skipPreview: true,
  is3DPrintMode: true,
};

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => ({
    state: mockLocationState,
  }),
}));

jest.mock('../context', () => ({
  useTheme: () => ({ theme: 'light', toggleTheme: jest.fn() }),
}));

jest.mock('../store/viewer.ts', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useViewerStore: (selector: any) => {
    const state = {
      setHdrMap: jest.fn(),
      isShowTexture: true,
      setShowTexture: jest.fn(),
      showMesh: true,
      setShowMesh: jest.fn(),
    };
    return selector ? selector(state) : state;
  },
}));

const mockUseGetPreviewByIdQuery = jest.fn();
const mockUseOnPreviewStatusChangedSubscription = jest.fn();
const mockUseOnMeshStatusChangedSubscription = jest.fn();
const mockUseModelStatusAndGenerate = jest.fn();

jest.mock('../graphql/graphQlApiHooks.ts', () => ({
  GenerationStatus: {
    Pending: 'PENDING',
    Validation: 'VALIDATION',
    Ready: 'READY',
  },
  useGetPreviewByIdQuery: () => mockUseGetPreviewByIdQuery(),
  useOnPreviewStatusChangedSubscription: () => mockUseOnPreviewStatusChangedSubscription(),
  useOnMeshStatusChangedSubscription: () => mockUseOnMeshStatusChangedSubscription(),
  useGeneratePreviewMutation: () => [jest.fn()],
}));

jest.mock('../hooks', () => ({
  useModelStatusAndGenerate: () => mockUseModelStatusAndGenerate(),
}));

jest.mock('../components/model-viewer/scene', () => ({
  Scene: ({ onRendered }: { onRendered: () => void }) => {
    // Expose onRendered to window for testing triggering
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).triggerSceneRendered = onRendered;
    return <div data-testid="scene">Scene Component</div>;
  },
}));

const mockLeftSidebar = jest.fn();
jest.mock('./LeftSidebar', () => ({
  LeftSidebar: (props: { currentPrompt?: string }) => {
    mockLeftSidebar(props);
    return <div data-testid="left-sidebar">Left Sidebar</div>;
  },
}));

jest.mock('./RightSidebar', () => ({
  RightSidebar: () => <div data-testid="right-sidebar">Right Sidebar</div>,
}));

jest.mock('../components/background-gradients/index.ts', () => ({
  BackgroundGradients: () => <div />,
}));

jest.mock('../components/back-button', () => ({
  BackButton: () => <button>Back</button>,
}));

jest.mock('../components/theme-toggle/ThemeToggle.tsx', () => ({
  __esModule: true,
  default: () => <button>Theme Toggle</button>,
}));

jest.mock('../components/icons-rotator/IconsRotator.tsx', () => ({
  __esModule: true,
  default: () => <div />,
}));

jest.mock('../utils/serverUrl', () => ({
  getApiBaseUrl: () => 'http://localhost:3000',
}));

describe('EditorPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLeftSidebar.mockClear();
    mockLocationState = {
      previewId: 'test-preview-id',
      order: 0,
      skipPreview: true,
      is3DPrintMode: true,
    };
    mockUseGetPreviewByIdQuery.mockReturnValue({
      data: null,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });
    mockUseOnPreviewStatusChangedSubscription.mockReturnValue({
      data: null,
      loading: false,
      error: null,
    });
    mockUseOnMeshStatusChangedSubscription.mockReturnValue({
      data: null,
      loading: false,
      error: null,
    });
    mockUseModelStatusAndGenerate.mockReturnValue({
      modelInfo: null,
      fetchOrGenerateMesh: jest.fn(),
    });
  });

  it('updates prompt when switching models', async () => {
    // First model with prompt "First prompt"
    mockLocationState = {
      previewId: 'preview-1',
      order: 0,
      skipPreview: false,
      isGameDevMode: true,
    };

    mockUseGetPreviewByIdQuery.mockReturnValue({
      data: {
        getPreviewById: {
          id: 'preview-1',
          prompt: 'First prompt',
          status: GenerationStatus.Ready,
          images: [{ order: 0 }],
        },
      },
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    const { rerender } = render(<EditorPage />);

    await waitFor(() => {
      expect(mockUseGetPreviewByIdQuery).toHaveBeenCalled();
    });

    await waitFor(
      () => {
        const calls = mockLeftSidebar.mock.calls;
        const lastCall = calls[calls.length - 1];
        if (lastCall && lastCall[0]?.currentPrompt) {
          expect(lastCall[0].currentPrompt).toBe('First prompt');
        }
      },
      { timeout: 3000 },
    );

    mockLocationState = {
      previewId: 'preview-2',
      order: 0,
      skipPreview: false,
      isGameDevMode: true,
    };

    mockUseGetPreviewByIdQuery.mockReturnValue({
      data: {
        getPreviewById: {
          id: 'preview-2',
          prompt: 'Second prompt',
          status: GenerationStatus.Ready,
          images: [{ order: 0 }],
        },
      },
      loading: false,
      error: null,
      refetch: jest.fn(),
    });

    await act(async () => {
      rerender(<EditorPage />);
    });

    await waitFor(
      () => {
        const calls = mockLeftSidebar.mock.calls;
        const lastCall = calls[calls.length - 1];
        expect(lastCall[0].currentPrompt).toBe('Second prompt');
      },
      { timeout: 3000 },
    );
  });
});
