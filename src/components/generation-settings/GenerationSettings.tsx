import { FC, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useGameDevStore } from '../../store/gamedev';
import { HelpCircle, Info, ChevronDown, X } from 'lucide-react';
import { Tooltip } from 'antd';
import { PreviewScene } from './PreviewScene';
import { useTheme } from '../../context';

const Container = styled.div<{ theme: 'light' | 'dark'; $isInDrawer?: boolean }>`
  width: 648px;
  height: 442px;
  margin: 0 auto 48px auto;
  background: ${(props) => (props.theme === 'light' ? 'rgba(255, 255, 255, 0.64)' : 'rgba(255, 255, 255, 0.06)')};
  backdrop-filter: blur(16px);
  border-radius: 20px;
  padding: 20px 20px 24px 20px;
  box-sizing: border-box;
  color: ${(props) => (props.theme === 'light' ? 'rgba(0, 0, 0, 0.96)' : 'rgba(255, 255, 255, 0.96)')};
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 100;

  ${(props) =>
    props.$isInDrawer &&
    `
    width: 100% !important;
    height: 100%;
    margin: 0;
    border-radius: 20px 20px 0 0;
    max-width: 100%;
  `}

  @media (max-width: 659px) {
    ${(props) =>
      !props.$isInDrawer &&
      `
      display: none;
    `}
  }

  @media (max-width: 768px) {
    ${(props) =>
      !props.$isInDrawer &&
      `
      width: calc(100% - 32px);
      height: auto;
      min-height: 442px;
    `}
  }
`;

const HeaderContainer = styled.div<{ theme: 'light' | 'dark' }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0;
`;

const Header = styled.h3<{ theme: 'light' | 'dark' }>`
  font-family: 'SB Sans Text', sans-serif;
  font-weight: 400;
  font-size: 24px;
  line-height: 32px;
  margin: 0;
  color: ${(props) => (props.theme === 'light' ? 'rgba(0, 0, 0, 0.96)' : 'rgba(255, 255, 255, 0.96)')};
`;

const CloseButton = styled.button<{ theme: 'light' | 'dark' }>`
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(props) => (props.theme === 'light' ? 'rgba(0, 0, 0, 0.56)' : 'rgba(255, 255, 255, 0.56)')};
  transition: color 0.2s ease;

  &:hover {
    color: ${(props) => (props.theme === 'light' ? 'rgba(0, 0, 0, 0.96)' : 'rgba(255, 255, 255, 0.96)')};
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const ContentContainer = styled.div<{ $isInDrawer?: boolean }>`
  display: flex;
  gap: 16px;
  margin-top: 22px;
  width: 100%;
  ${(props) =>
    props.$isInDrawer &&
    `
    flex: 1;
    overflow-y: auto;
  `}

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const LeftBlock = styled.div<{ theme: 'light' | 'dark' }>`
  width: 300px;
  height: 352px;
  background: ${(props) => (props.theme === 'light' ? 'transparent' : 'transparent')};
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    width: 100%;
    height: auto;
    margin-bottom: 20px;
  }
`;

const RightBlock = styled.div<{ theme: 'light' | 'dark' }>`
  width: 300px;
  height: 352px;
  background: ${(props) => (props.theme === 'light' ? 'rgba(8, 8, 8, 0.03)' : 'rgba(255, 255, 255, 0.06)')};
  border-radius: 16px;
  overflow: hidden;

  @media (max-width: 768px) {
    width: 100%;
  }
`;

const SectionLabel = styled.div<{ theme: 'light' | 'dark' }>`
  font-family: 'SB Sans Text', sans-serif;
  font-size: 14px;
  line-height: 20px;
  color: ${(props) => (props.theme === 'light' ? 'rgba(0, 0, 0, 0.56)' : 'rgba(255, 255, 255, 0.56)')};
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 18px;
`;

const RadioLabel = styled.label<{ theme: 'light' | 'dark' }>`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-family: 'SB Sans Text', sans-serif;
  font-size: 14px;
  line-height: 22px;
  color: ${(props) => (props.theme === 'light' ? 'rgba(0, 0, 0, 0.96)' : 'rgba(255, 255, 255, 0.96)')};
  user-select: none;
`;

const HiddenRadio = styled.input.attrs({ type: 'radio' })`
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
`;

const StyledRadio = styled.div<{ checked: boolean; theme: 'light' | 'dark' }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 1.5px solid
    ${(props) => {
      if (props.checked) return 'transparent';
      return props.theme === 'light' ? 'rgba(0, 0, 0, 0.28)' : 'rgba(255, 255, 255, 0.28)';
    }};
  background-color: ${(props) => (props.checked ? '#528EFF' : 'transparent')};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &::after {
    content: '';
    width: 8px;
    height: 8px;
    background: white;
    border-radius: 50%;
    transform: scale(${(props) => (props.checked ? 1 : 0)});
    transition: transform 0.2s ease;
  }
`;

const SliderSection = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: 14px;
`;

const SliderHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const ValueBox = styled.div<{ theme: 'light' | 'dark' }>`
  height: 32px;
  padding: 0 12px;
  background: ${(props) => (props.theme === 'light' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.12)')};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'SB Sans Text', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: ${(props) => (props.theme === 'light' ? 'rgba(0, 0, 0, 0.96)' : 'rgba(255, 255, 255, 0.96)')};
  min-width: 70px;
  box-sizing: border-box;
`;

const EditableValueBox = styled.input<{ theme: 'light' | 'dark' }>`
  height: 32px;
  padding: 0 12px;
  background: ${(props) => (props.theme === 'light' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.12)')};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'SB Sans Text', sans-serif;
  font-size: 13px;
  font-weight: 500;
  color: ${(props) => (props.theme === 'light' ? 'rgba(0, 0, 0, 0.96)' : 'rgba(255, 255, 255, 0.96)')};
  box-sizing: border-box;
  border: none;
  outline: none;
  text-align: center;
  cursor: text;
  width: 70px;

  &:focus {
    background: ${(props) => (props.theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.16)')};
  }

  &::placeholder {
    color: ${(props) => (props.theme === 'light' ? 'rgba(0, 0, 0, 0.56)' : 'rgba(255, 255, 255, 0.56)')};
  }
`;

const StyledSlider = styled.input<{ theme: 'light' | 'dark' }>`
  -webkit-appearance: none;
  width: 100%;
  height: 4px;
  background: ${(props) => (props.theme === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)')};
  border-radius: 2px;
  outline: none;
  cursor: pointer;
  margin: 0;

  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    background: ${(props) => (props.theme === 'light' ? '#ffffff' : '#ffffff')};
    border: ${(props) => (props.theme === 'light' ? '1px solid rgba(0, 0, 0, 0.1)' : 'none')};
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.16);
    transition: transform 0.1s;
    margin-top: -6px;
  }

  &::-webkit-slider-runnable-track {
    width: 100%;
    height: 4px;
    cursor: pointer;
    background: ${(props) => (props.theme === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)')};
    border-radius: 2px;
  }

  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    background: #ffffff;
    border: ${(props) => (props.theme === 'light' ? '1px solid rgba(0, 0, 0, 0.1)' : 'none')};
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.16);
  }

  &::-moz-range-track {
    width: 100%;
    height: 4px;
    cursor: pointer;
    background: ${(props) => (props.theme === 'light' ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)')};
    border-radius: 2px;
  }
`;

const DropdownContainer = styled.div`
  position: relative;
  width: 100%;
`;

const DropdownHeader = styled.div<{ theme: 'light' | 'dark' }>`
  height: 40px;
  background: ${(props) => (props.theme === 'light' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.12)')};
  border: ${(props) => (props.theme === 'light' ? '1px solid rgba(0, 0, 0, 0.1)' : 'none')};
  border-radius: 12px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  cursor: pointer;
  font-family: 'SB Sans Text', sans-serif;
  font-size: 16px;
  color: ${(props) => (props.theme === 'light' ? 'rgba(0, 0, 0, 0.96)' : 'rgba(255, 255, 255, 0.96)')};

  &:hover {
    background: ${(props) => (props.theme === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(255, 255, 255, 0.16)')};
  }
`;

const DropdownList = styled.div<{ theme: 'light' | 'dark' }>`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  width: 100%;
  background: ${(props) => (props.theme === 'light' ? '#ffffff' : 'rgba(45, 45, 45, 0.95)')};
  backdrop-filter: blur(12px);
  border-radius: 12px;
  padding: 8px;
  box-sizing: border-box;
  z-index: 1000;
  box-shadow: ${(props) =>
    props.theme === 'light' ? '0px 8px 24px rgba(0, 0, 0, 0.12)' : '0px 8px 24px rgba(0, 0, 0, 0.24)'};
  border: ${(props) =>
    props.theme === 'light' ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(255, 255, 255, 0.1)'};
  max-height: 150px;
  overflow-y: auto;

  /* Custom scrollbar for Webkit browsers */
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${(props) => (props.theme === 'light' ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)')};
    border-radius: 2px;
  }
`;

const DropdownItem = styled.div<{ isSelected: boolean; theme: 'light' | 'dark' }>`
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'SB Sans Text', sans-serif;
  font-size: 16px;
  color: ${(props) => (props.theme === 'light' ? 'rgba(0, 0, 0, 0.96)' : 'rgba(255, 255, 255, 0.96)')};
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${(props) => {
    if (!props.isSelected) return 'transparent';
    return props.theme === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)';
  }};

  &:hover {
    background: ${(props) => (props.theme === 'light' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.12)')};
  }
`;

const CheckIcon = styled.div`
  width: 10px;
  height: 6px;
  border-left: 2px solid #528eff;
  border-bottom: 2px solid #528eff;
  transform: rotate(-45deg);
  margin-bottom: 2px;
`;

interface GenerationSettingsProps {
  hideRightBlock?: boolean;
  isInDrawer?: boolean;
  onClose?: () => void;
  hasSelectedFile?: boolean;
}

export const GenerationSettings: FC<GenerationSettingsProps> = ({
  hideRightBlock = false,
  isInDrawer = false,
  onClose,
  hasSelectedFile = false,
}) => {
  const {
    topology,
    setTopology,
    polyCount,
    setPolyCount,
    isPolyCountAuto,
    setIsPolyCountAuto,
    lod,
    setLod,
    previewNum,
    setPreviewNum,
    pbrMode,
    setPbrMode,
  } = useGameDevStore();
  const { theme } = useTheme();

  const [isPbrDropdownOpen, setIsPbrDropdownOpen] = useState(false);
  const [polyInputValue, setPolyInputValue] = useState(polyCount.toString());

  // Синхронизируем input с polyCount из store
  useEffect(() => {
    setPolyInputValue(polyCount.toString());
  }, [polyCount]);

  // Устанавливаем previewNum в 1 когда выбран файл
  useEffect(() => {
    if (hasSelectedFile && previewNum !== 1) {
      setPreviewNum(1);
    }
  }, [hasSelectedFile, previewNum, setPreviewNum]);

  // const handlePreviewNumSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const value = parseInt(e.target.value, 10);
  //   setPreviewNum(value);
  // };

  const handlePolySliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setPolyCount(value);
    if (isPolyCountAuto) {
      setIsPolyCountAuto(false);
    }
  };

  const handlePolyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Разрешаем только цифры и пробелы (для форматирования)
    if (/^\d*$/.test(value.replace(/\s/g, ''))) {
      setPolyInputValue(value);
    }
  };

  const handlePolyInputBlur = () => {
    const numValue = parseInt(polyInputValue.replace(/\s/g, ''), 10);

    if (isNaN(numValue)) {
      // Если невалидное значение, возвращаем предыдущее
      setPolyInputValue(polyCount.toString());
      return;
    }

    // Валидация: ограничиваем диапазон 10000-200000
    let validValue = numValue;
    if (numValue < 10000) {
      validValue = 10000;
    } else if (numValue > 200000) {
      validValue = 200000;
    }

    // Округляем до ближайшей тысячи (step: 1000)
    validValue = Math.round(validValue / 1000) * 1000;

    setPolyCount(validValue);
    setPolyInputValue(validValue.toString());

    if (isPolyCountAuto) {
      setIsPolyCountAuto(false);
    }
  };

  const handlePolyInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.currentTarget.blur();
    }
  };

  const handleLodSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setLod(value);
  };

  const pbrOptions = [
    { value: 'pbr', label: 'PBR' },
    { value: 'metall', label: 'Metall' },
    { value: 'plastic', label: 'Plastic' },
    { value: 'albedo', label: 'albedo' },
  ] as const;

  return (
    <Container theme={theme} $isInDrawer={isInDrawer}>
      <HeaderContainer theme={theme}>
        <Header theme={theme}>Настройки генерации</Header>
        {isInDrawer && onClose && (
          <CloseButton theme={theme} onClick={onClose} aria-label="Закрыть настройки">
            <X size={24} />
          </CloseButton>
        )}
      </HeaderContainer>
      <ContentContainer $isInDrawer={isInDrawer}>
        <LeftBlock theme={theme}>
          {/* Топология */}
          <SectionLabel theme={theme}>Топология</SectionLabel>
          <RadioGroup>
            <RadioLabel theme={theme} onClick={() => setTopology('quads')}>
              <HiddenRadio checked={topology === 'quads'} onChange={() => setTopology('quads')} />
              <StyledRadio checked={topology === 'quads'} theme={theme} />
              Квадраты
            </RadioLabel>
            <RadioLabel theme={theme} onClick={() => setTopology('triangles')}>
              <HiddenRadio checked={topology === 'triangles'} onChange={() => setTopology('triangles')} />
              <StyledRadio checked={topology === 'triangles'} theme={theme} />
              Треугольники
            </RadioLabel>
          </RadioGroup>

          {/* Количество вариантов */}
          {/* {!hasSelectedFile && (
            <SliderSection>
              <SliderHeader>
                <SectionLabel theme={theme} style={{ marginBottom: 0 }}>
                  Количество вариантов
                </SectionLabel>
                <ValueBox theme={theme}>{previewNum}</ValueBox>
              </SliderHeader>
              <StyledSlider
                theme={theme}
                type="range"
                min="1"
                max="4"
                step="1"
                value={previewNum}
                onChange={handlePreviewNumSliderChange}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10, marginLeft: 6 }}>
                <Info size={16} color={theme === 'light' ? 'rgba(0, 0, 0, 0.56)' : 'rgba(255, 255, 255, 0.56)'} />
                <span
                  style={{
                    fontFamily: 'SB Sans Text',
                    fontSize: '12px',
                    lineHeight: '16px',
                    color: theme === 'light' ? 'rgba(0, 0, 0, 0.56)' : 'rgba(255, 255, 255, 0.56)',
                  }}
                >
                  Больше вариантов – дольше ожидание
                </span>
              </div>
            </SliderSection>
          )} */}

          {/* Полигоны */}
          <SliderSection>
            <SliderHeader>
              <SectionLabel theme={theme} style={{ marginBottom: 0 }}>
                Количество полигонов
              </SectionLabel>
              {isPolyCountAuto ? (
                <ValueBox theme={theme} onClick={() => setIsPolyCountAuto(false)}>авто</ValueBox>
              ) : (
                <EditableValueBox
                  theme={theme}
                  type="text"
                  value={polyInputValue}
                  onChange={handlePolyInputChange}
                  onBlur={handlePolyInputBlur}
                  onKeyDown={handlePolyInputKeyDown}
                  placeholder="10000"
                />
              )}
            </SliderHeader>
            <StyledSlider
              theme={theme}
              type="range"
              min="10000"
              max="200000"
              step="1000"
              value={polyCount}
              onChange={handlePolySliderChange}
            />
          </SliderSection>

          {/* LOD */}
          <SliderSection>
            <SliderHeader>
              <SectionLabel theme={theme} style={{ marginBottom: 0 }}>
                LOD
                <Tooltip title="Уровень детализации (Level of Detail)">
                  <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                    <HelpCircle
                      size={16}
                      color={theme === 'light' ? 'rgba(0, 0, 0, 0.56)' : 'rgba(255, 255, 255, 0.56)'}
                    />
                  </div>
                </Tooltip>
              </SectionLabel>
              <ValueBox theme={theme}>{lod}</ValueBox>
            </SliderHeader>
            <StyledSlider
              theme={theme}
              type="range"
              min="0"
              max="7"
              step="1"
              value={lod}
              onChange={handleLodSliderChange}
            />
          </SliderSection>

          {/* PBR */}
          <div style={{ position: 'relative' }}>
            <SectionLabel theme={theme}>
              PBR
              <Tooltip title="Physically based rendering">
                <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <Info size={16} color={theme === 'light' ? 'rgba(0, 0, 0, 0.56)' : 'rgba(255, 255, 255, 0.56)'} />
                </div>
              </Tooltip>
            </SectionLabel>
            <DropdownContainer onClick={() => setIsPbrDropdownOpen(!isPbrDropdownOpen)}>
              <DropdownHeader theme={theme}>
                {pbrOptions.find((opt) => opt.value === pbrMode)?.label}
                <ChevronDown
                  size={20}
                  color={theme === 'light' ? 'rgba(0, 0, 0, 0.56)' : 'rgba(255, 255, 255, 0.56)'}
                />
              </DropdownHeader>
              {isPbrDropdownOpen && (
                <DropdownList theme={theme}>
                  {pbrOptions.map((option) => (
                    <DropdownItem
                      key={option.value}
                      theme={theme}
                      isSelected={pbrMode === option.value}
                      onClick={(e) => {
                        e.stopPropagation();
                        setPbrMode(option.value);
                        setIsPbrDropdownOpen(false);
                      }}
                    >
                      {pbrMode === option.value && <CheckIcon />}
                      <span style={{ marginLeft: pbrMode === option.value ? 0 : 18 }}>{option.label}</span>
                    </DropdownItem>
                  ))}
                </DropdownList>
              )}
            </DropdownContainer>
          </div>
        </LeftBlock>

        {!hideRightBlock && (
          <RightBlock theme={theme}>
            <PreviewScene />
          </RightBlock>
        )}
      </ContentContainer>
    </Container>
  );
};
