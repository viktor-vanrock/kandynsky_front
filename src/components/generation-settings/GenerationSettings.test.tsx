import { render, screen, fireEvent } from '@testing-library/react';
import { GenerationSettings } from './GenerationSettings';
import '@testing-library/jest-dom';

const mockSetTopology = jest.fn();
const mockSetPolyCount = jest.fn();
const mockSetIsPolyCountAuto = jest.fn();
const mockSetLod = jest.fn();
const mockSetPbrMode = jest.fn();

jest.mock('../../store/gamedev', () => ({
  useGameDevStore: () => ({
    topology: 'triangles',
    setTopology: mockSetTopology,
    polyCount: 40000,
    setPolyCount: mockSetPolyCount,
    isPolyCountAuto: true,
    setIsPolyCountAuto: mockSetIsPolyCountAuto,
    lod: 0,
    setLod: mockSetLod,
    pbrMode: 'albedo',
    setPbrMode: mockSetPbrMode,
  }),
}));

jest.mock('../../context/ThemeContext.ts', () => ({
  useTheme: () => ({ theme: 'dark' }),
}));

describe('GenerationSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders component correctly', () => {
    render(<GenerationSettings />);
    expect(screen.getByText('Настройки генерации')).toBeInTheDocument();
    expect(screen.getByText('Топология')).toBeInTheDocument();
    expect(screen.getByText('Количество полигонов')).toBeInTheDocument();
    expect(
      screen.getByText((_content, element) => {
        return element?.textContent === 'LOD';
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText((_content, element) => {
        return element?.textContent === 'PBR';
      }),
    ).toBeInTheDocument();
  });

  it('changes topology to quads when clicked', () => {
    render(<GenerationSettings />);

    const quadsLabel = screen.getByText('Квадраты');
    fireEvent.click(quadsLabel);

    expect(mockSetTopology).toHaveBeenCalledWith('quads');
  });

  it('changes poly count slider', () => {
    render(<GenerationSettings />);

    const sliders = screen.getAllByRole('slider');
    const polySlider = sliders.find((s) => s.getAttribute('max') === '200000') as HTMLInputElement;

    expect(polySlider).toBeDefined();

    fireEvent.change(polySlider, { target: { value: '50000' } });
    expect(mockSetPolyCount).toHaveBeenCalledWith(50000);
    expect(mockSetIsPolyCountAuto).toHaveBeenCalledWith(false);
  });

  it('changes LOD slider', () => {
    render(<GenerationSettings />);

    const sliders = screen.getAllByRole('slider');
    const lodSlider = sliders.find((s) => s.getAttribute('max') === '7') as HTMLInputElement;

    expect(lodSlider).toBeDefined();

    fireEvent.change(lodSlider, { target: { value: '3' } });
    expect(mockSetLod).toHaveBeenCalledWith(3);
  });

  it('changes PBR mode using dropdown', () => {
    render(<GenerationSettings />);

    const dropdownHeaders = screen.getAllByText('albedo');
    fireEvent.click(dropdownHeaders[0]);
    const metallOption = screen.getByText('Metall');
    fireEvent.click(metallOption);

    expect(mockSetPbrMode).toHaveBeenCalledWith('metall');
  });
});
