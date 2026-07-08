import { BodyS, BodyXS, IconButton, Tooltip } from '@salutejs/plasma-giga';
import { textSecondary } from '@salutejs/plasma-themes/tokens';
import { ChangeEvent, FC, KeyboardEvent, RefObject, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Settings } from 'lucide-react';

import { AttachIcon, CloseCrossIcon, SubmitIcon } from '../Icons';
import { FEATURE_FLAGS } from '../../utils/const';

const MainInputSection = styled.div`
  width: 648px;
  display: flex;
  flex-direction: column;
  gap: 48px;
  margin-bottom: 48px;

  @media (max-width: 768px) {
    width: 100%;
    padding: 0 16px;
    box-sizing: border-box;
    gap: 24px;
    margin-bottom: 0;
    flex: 1;
  }
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (max-width: 768px) {
    flex: 1;
    justify-content: space-between;
  }
`;

const TextInputArea = styled.div`
  position: relative;
  padding: 14px 0;
`;

const LargeTextInput = styled.textarea<{ $theme: 'light' | 'dark' }>`
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: var(--plasma-colors-text-primary);
  font-family: 'SB Sans Display', sans-serif;
  font-size: var(--Header-H1-Font-Size, 48px);
  line-height: 52px;
  resize: none;
  overflow: hidden;
  min-height: 52px;

  &::placeholder {
    color: ${(props) =>
      props.$theme === 'dark'
        ? 'var(--text-icons-default-general-tertiary, rgba(255, 255, 255, 0.28))'
        : 'var(--text-icons-default-general-tertiary, rgba(8, 8, 8, 0.28))'};
  }

  &:focus::placeholder {
    opacity: 0;
  }

  @media (max-width: 768px) {
    font-size: 32px;
    line-height: 36px;
    min-height: 72px;
    overflow: visible;
  }
`;

const Cursor = styled.div<{ visible: boolean }>`
  position: absolute;
  left: -2px;
  top: 50%;
  transform: translateY(-50%);
  width: 2px;
  height: 52px;
  background: var(--plasma-colors-text-accent);
  opacity: ${(props) => (props.visible ? 1 : 0)};
  animation: ${(props) => (props.visible ? 'blink 1s step-end infinite' : 'none')};

  @keyframes blink {
    0%,
    50% {
      opacity: 1;
    }
    51%,
    100% {
      opacity: 0;
    }
  }

  @media (max-width: 768px) {
    height: 36px;
  }
`;

const InputButtons = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;

  @media (max-width: 768px) {
    margin-top: auto;
  }
`;

const LeftButtons = styled.div`
  display: flex;
  gap: 8px;
  flex: 1;
`;

const SettingsButton = styled.button<{ $theme: 'light' | 'dark' }>`
  display: none;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 20px;
  border: none;
  background: var(--surface-transparent-primary);
  color: ${(props) => (props.$theme === 'light' ? 'rgba(8, 8, 8, 0.96)' : 'rgba(255, 255, 255, 0.96)')};
  font-family: 'SB Sans Text', sans-serif;
  font-size: 14px;
  line-height: 20px;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: ${(props) => (props.$theme === 'light' ? 'rgba(8, 8, 8, 0.06)' : 'rgba(255, 255, 255, 0.12)')};
  }

  svg {
    width: 16px;
    height: 16px;
  }

  @media screen and (max-width: 659px) {
    display: flex;
  }
`;

const ImagePreviewContainer = styled.div`
  position: relative;
  width: 236px;
  height: 56px;
  border-radius: 26px;
  overflow: hidden;
  background: var(--surface-transparent-primary);

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px;

  @media (max-width: 768px) {
    width: 236px;
    height: 56px;
  }
`;

const CloseCrossIconStyled = styled(CloseCrossIcon)`
  width: 40px;
  min-width: 40px;
  height: 40px;
`;

const TextImageContainer = styled.div`
  flex-grow: 1;
  height: 100%;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 6px;

  > p {
    padding: 0;
    margin: 0;
    font-size: 14px;
    line-height: 16px;

    width: 100%;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  [BodyXS] {
    color: ${textSecondary};
  }
`;

const ImagePreview = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  display: block;
`;

const TemplatesButton = styled.button<{ $theme: 'light' | 'dark' }>`
  display: flex;
  align-items: center;
  gap: 6px;
  width: 143px;
  height: 48px;
  padding: 0 16px;
  border-radius: 24px;
  border: none;
  background: var(--surface-transparent-primary);
  color: ${(props) => (props.$theme === 'light' ? 'rgba(8, 8, 8, 0.96)' : 'rgba(255, 255, 255, 0.96)')};
  font-family: 'SB Sans Text', sans-serif;
  font-size: 14px;
  line-height: 20px;
  cursor: pointer;
  transition: background 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: ${(props) => (props.$theme === 'light' ? 'rgba(8, 8, 8, 0.06)' : 'rgba(255, 255, 255, 0.12)')};
  }
`;

const TemplatesWrapper = styled.div`
  position: relative;
`;

const TemplatesDropdown = styled.div<{ $visible: boolean }>`
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  width: 326px;
  height: 164px;
  background: var(--surface-transparent-primary, rgba(255, 255, 255, 0.06));
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2px;
  display: flex;
  gap: 2px;
  align-items: center;
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  pointer-events: ${(props) => (props.$visible ? 'auto' : 'none')};
  transition: opacity 0.15s ease;
  z-index: 100;

  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    right: 0;
    height: 8px;
  }
`;

const TemplateCard = styled.div<{ $selected: boolean }>`
  width: 160px;
  height: 160px;
  border-radius: 16px;
  overflow: hidden;
  background: ${(props) => (props.$selected ? 'rgba(36, 242, 191, 0.18)' : 'rgba(255, 255, 255, 0.08)')};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-end;
  cursor: pointer;
  flex-shrink: 0;
  position: relative;
  transition: background 0.2s ease, outline 0.15s ease;
  outline: ${(props) => (props.$selected ? '2px solid #24F2BF' : '2px solid transparent')};
  outline-offset: -2px;

  &:hover {
    background: ${(props) => (props.$selected ? 'rgba(36, 242, 191, 0.24)' : 'rgba(255, 255, 255, 0.16)')};
  }
`;

const TemplateImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  width: 136px;
  height: 114px;
  margin: 0 auto;
  padding: 8px 12px 0;
  object-fit: contain;
  box-sizing: border-box;
`;

const TemplateLabel = styled.span`
  position: relative;
  z-index: 1;
  font-family: 'SB Sans Text', sans-serif;
  font-size: 14px;
  line-height: 18px;
  color: rgba(255, 255, 255, 0.96);
  padding-bottom: 12px;
`;

const ModalOverlay = styled.div<{ $visible: boolean; $theme: 'light' | 'dark' }>`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) =>
    props.$theme === 'light' ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.4)'};
  backdrop-filter: ${(props) => (props.$visible ? 'blur(12px)' : 'blur(0px)')};
  -webkit-backdrop-filter: ${(props) => (props.$visible ? 'blur(12px)' : 'blur(0px)')};
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  pointer-events: ${(props) => (props.$visible ? 'auto' : 'none')};
  transition: opacity 0.2s ease, backdrop-filter 0.2s ease;
`;

const ModalWindow = styled.div<{ $theme: 'light' | 'dark' }>`
  width: 515px;
  height: 160px;
  background: ${(props) => (props.$theme === 'light' ? '#ffffff' : '#1a1a1a')};
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: ${(props) =>
    props.$theme === 'light'
      ? '0 8px 32px rgba(0, 0, 0, 0.12)'
      : '0 8px 32px rgba(0, 0, 0, 0.48)'};
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 29px 24px 0;
  gap: 12px;
`;

const ModalTitle = styled.span<{ $theme: 'light' | 'dark' }>`
  flex: 1;
  font-family: 'SB Sans Display', sans-serif;
  font-size: 24px;
  line-height: 28px;
  color: ${(props) => (props.$theme === 'light' ? 'rgba(8, 8, 8, 0.96)' : 'rgba(255, 255, 255, 0.96)')};
`;

const ModalCloseButton = styled.button<{ $theme: 'light' | 'dark' }>`
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 50%;
  border: none;
  color: ${(props) => (props.$theme === 'light' ? 'rgba(8, 8, 8, 0.56)' : 'rgba(255, 255, 255, 0.72)')};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.2s ease;
  background: none;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px 24px 24px;
  margin-top: auto;
`;

const ModalActionButton = styled.button<{ $theme: 'light' | 'dark' }>`
  flex: 1;
  height: 44px;
  border-radius: 16px;
  border: none;
  background: ${(props) => (props.$theme === 'light' ? 'rgba(8, 8, 8, 0.06)' : 'rgba(255, 255, 255, 0.08)')};
  color: ${(props) => (props.$theme === 'light' ? 'rgba(8, 8, 8, 0.96)' : 'rgba(255, 255, 255, 0.96)')};
  font-family: 'SB Sans Text', sans-serif;
  font-size: 16px;
  line-height: 20px;
  weight: 600;
  cursor: pointer;
  transition: background 0.2s ease, color 0.2s ease;

  &:hover {
    background: #3f81fd;
    color: #fff;
  }
`;

const PreviewRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const TooltipText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 11px 14px;

  > ul {
    padding: 0;
    margin-left: 20px;

    > li {
      padding: 0;
      margin: 0;
    }
  }
`;

interface MainInputProps {
  theme: 'light' | 'dark';
  inputValue: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyPress: (e: KeyboardEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  onFileChange?: (file: File) => void;
  onClearImage?: () => void;
  selectedImage?: File | null;
  isSubmitting: boolean;
  isReadyToGenerate: boolean;
  hasContent?: boolean;
  inputRef: RefObject<HTMLTextAreaElement>;
  fileInputRef: RefObject<HTMLInputElement>;
  children?: React.ReactNode;
  selectedMode?: string;
  onSettingsClick?: () => void;
  initialTemplate?: 'figure' | 'bust' | null;
}

export const MainInput: FC<MainInputProps> = ({
  theme,
  inputValue,
  onChange,
  onKeyPress,
  onSubmit,
  onFileChange,
  onClearImage,
  selectedImage,
  isSubmitting,
  isReadyToGenerate,
  inputRef,
  fileInputRef,
  children,
  selectedMode,
  onSettingsClick,
  initialTemplate,
}) => {
  const [cursorVisible, setCursorVisible] = useState(true);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const navigate = useNavigate();
  const [templatesVisible, setTemplatesVisible] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<'figure' | 'bust' | null>(initialTemplate ?? null);

  useEffect(() => {
    if (initialTemplate) setSelectedTemplate(initialTemplate);
  }, [initialTemplate]);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const templatesRef = useRef<HTMLDivElement>(null);
  const templateFileInputRef = useRef<HTMLInputElement>(null);

  const templateNames: Record<'figure' | 'bust', string> = {
    figure: 'Мини-фигурка',
    bust: 'Бюст',
  };
  const templateImages: Record<'figure' | 'bust', string> = {
    figure: '/img/figure.png',
    bust: '/img/bust.png',
  };

  const handleClearTemplate = () => {
    setSelectedTemplate(null);
    if (onClearImage) onClearImage();
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedImage) {
      const url = URL.createObjectURL(selectedImage);
      setImagePreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setImagePreviewUrl(null);
    }
  }, [selectedImage]);

  return (
    <MainInputSection>
      <InputWrapper>
        {selectedImage && imagePreviewUrl ? (
          <>
            <PreviewRow>
              <ImagePreviewContainer>
                <ImagePreview src={imagePreviewUrl} alt="Загруженное изображение" />

                <TextImageContainer>
                  <BodyS>{selectedImage.name.split('.')[0]}</BodyS>

                  <BodyXS color={textSecondary}>
                    {selectedImage.type.split('/')[1].toLocaleUpperCase()} · {Math.floor(selectedImage.size / 1024)} КБ
                  </BodyXS>
                </TextImageContainer>

                {onClearImage && (
                  <CloseCrossIconStyled theme={theme} onClick={() => { onClearImage(); setSelectedTemplate(null); }} aria-label="Удалить изображение" />
                )}
              </ImagePreviewContainer>

              {selectedTemplate && (
                <ImagePreviewContainer>
                  <ImagePreview src={templateImages[selectedTemplate]} alt={templateNames[selectedTemplate]} />

                  <TextImageContainer>
                    <BodyS>{templateNames[selectedTemplate]}</BodyS>
                    <BodyXS color={textSecondary}>Шаблон</BodyXS>
                  </TextImageContainer>

                  <CloseCrossIconStyled theme={theme} onClick={handleClearTemplate} aria-label="Удалить шаблон" />
                </ImagePreviewContainer>
              )}
            </PreviewRow>

            <TextInputArea>
              <LargeTextInput
                ref={inputRef}
                $theme={theme}
                value={inputValue}
                onChange={onChange}
                onKeyPress={onKeyPress}
                placeholder="Что сгенерировать в 3D?"
                rows={1}
              />
              <Cursor visible={cursorVisible && !inputValue} />
            </TextInputArea>
          </>
        ) : (
          <TextInputArea>
            <LargeTextInput
              ref={inputRef}
              $theme={theme}
              value={inputValue}
              onChange={onChange}
              onKeyPress={onKeyPress}
              placeholder="Что сгенерировать в 3D?"
              rows={1}
            />
            <Cursor visible={cursorVisible && !inputValue} />
          </TextInputArea>
        )}

        <InputButtons>
          <LeftButtons>
            <Tooltip
              hasArrow
              animated
              placement="bottom"
              trigger="hover"
              mouseEnterDelay={1000}
              maxWidth={269}
              text={
                <TooltipText style={{ maxWidth: 269 }}>
                  <BodyS>Требования к файлам:</BodyS>
                  <ul>
                    <li>
                      <BodyS>Форматы: JPG (JPEG, JPE), PNG, GIF, WEBP</BodyS>
                    </li>
                    <li>
                      <BodyS>Максимальный размер: 20 МБ</BodyS>
                    </li>
                    <li>
                      <BodyS>Максимум 1 файл за раз</BodyS>
                    </li>
                  </ul>

                  <BodyS color={textSecondary}>Недопустимы изображения с запрещённым контентом </BodyS>
                </TooltipText>
              }
              target={
                <>
                  <IconButton
                    pin="circle-circle"
                    view="secondary"
                    onClick={() => fileInputRef.current?.click()}
                    contentLeft={<AttachIcon color={textSecondary} />}
                  />

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/jpe,image/gif,image/png,image/webp"
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file && onFileChange) {
                        onFileChange(file);
                      }
                    }}
                  />
                </>
              }
            />
            {selectedMode === 'gamedev' && onSettingsClick && (
              <SettingsButton $theme={theme} onClick={onSettingsClick} type="button">
                <Settings size={16} />
                Настройки
              </SettingsButton>
            )}
            {!selectedTemplate && (
            <TemplatesWrapper
              ref={templatesRef}
              onMouseEnter={() => setTemplatesVisible(true)}
              onMouseLeave={() => setTemplatesVisible(false)}
            >
              <TemplatesDropdown $visible={templatesVisible}>
                <TemplateCard
                  $selected={selectedTemplate === 'figure'}
                  onClick={() => { setSelectedTemplate('figure'); setTemplateModalOpen(true); }}
                >
                  <TemplateImage src="/img/figure.png" alt="Мини-фигурка" />
                  <TemplateLabel>Мини-фигурка</TemplateLabel>
                </TemplateCard>
                <TemplateCard
                  $selected={selectedTemplate === 'bust'}
                  onClick={() => { setSelectedTemplate('bust'); setTemplateModalOpen(true); }}
                >
                  <TemplateImage src="/img/bust.png" alt="Бюст" />
                  <TemplateLabel>Бюст</TemplateLabel>
                </TemplateCard>
              </TemplatesDropdown>
              { FEATURE_FLAGS.SHOW_3D_TEMPLATES && <TemplatesButton $theme={theme} type="button">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M8.5204 0.346402C8.67368 -0.115324 9.32728 -0.11561 9.48025 0.346402L10.5456 3.58467C11.1476 5.41537 12.5842 6.85194 14.4149 7.45407L17.653 8.51943C18.1159 8.67202 18.1154 9.32621 17.653 9.47931L14.4149 10.5447L14.0756 10.6677C12.4079 11.3282 11.1102 12.6986 10.5456 14.4141L9.59628 17.2972L9.48025 17.6523C9.33715 18.0871 8.75169 18.1142 8.5538 17.7332L8.5204 17.6523L8.40262 17.2972L7.45507 14.4141C6.89053 12.6986 5.59268 11.3283 3.92508 10.6677L3.58579 10.5447L0.347614 9.47931C-0.115814 9.32673 -0.115929 8.67188 0.347614 8.51943L0.700966 8.40164L3.58579 7.45407C5.30129 6.8895 6.67148 5.59169 7.33202 3.92397L7.45507 3.58467L8.5204 0.346402Z"
                    fill="#24F2BF"
                  />
                </svg>
                Шаблоны
              </TemplatesButton>}
            </TemplatesWrapper>
            )}
          </LeftButtons>

          <IconButton
            onClick={onSubmit}
            pin="circle-circle"
            isLoading={isSubmitting}
            disabled={isSubmitting || !isReadyToGenerate}
            contentLeft={<SubmitIcon />}
          />
        </InputButtons>
      </InputWrapper>

      {children}

      <input
        ref={templateFileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/jpe,image/gif,image/png,image/webp"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && onFileChange) {
            onFileChange(file);
          }
          e.target.value = '';
        }}
      />

      <ModalOverlay $visible={templateModalOpen} $theme={theme} onClick={() => setTemplateModalOpen(false)}>
        <ModalWindow $theme={theme} onClick={(e) => e.stopPropagation()}>
          <ModalHeader>
            <ModalTitle $theme={theme}>Сделайте селфи или загрузите фото</ModalTitle>
            <ModalCloseButton $theme={theme} type="button" onClick={() => setTemplateModalOpen(false)} aria-label="Закрыть">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
              </svg>
            </ModalCloseButton>
          </ModalHeader>
          <ModalActions>
            <ModalActionButton
              $theme={theme}
              type="button"
              onClick={() => {
                setTemplateModalOpen(false);
                templateFileInputRef.current?.click();
              }}
            >
              Загрузить фото
            </ModalActionButton>
            <ModalActionButton
              $theme={theme}
              type="button"
              onClick={() => { setTemplateModalOpen(false); navigate('/selfie', { state: { template: selectedTemplate } }); }}
            >
              Сделать селфи
            </ModalActionButton>
          </ModalActions>
        </ModalWindow>
      </ModalOverlay>
    </MainInputSection>
  );
};
