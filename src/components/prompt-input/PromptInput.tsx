import { FC, useEffect, useRef, useState, ChangeEvent, KeyboardEvent } from 'react';
import TextArea from 'antd/es/input/TextArea';
import styled from 'styled-components';
import { Button, Popover, Switch, InputNumber } from 'antd';
import { InfoCircleOutlined, CloseOutlined } from '@ant-design/icons';
import { StarIconWhite, TriangleIcon } from '../Icons.tsx';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context';
import { useGeneratePreviewMutation, MeshModels, FrontGenerationType } from '../../graphql/graphQlApiHooks.ts';
import styles from './PromptInput.module.css';
import { CENSOR } from '../../utils/regexp.ts';
import { getSessionToken } from '../../utils/session.ts';
import { ImageIcon, RemoveIcon } from '../Icons.tsx';

import classNames from 'classnames';
import { useInIframe } from '../../hooks/useInIframe.ts';
import { useIframeToken } from '../../hooks/useIframeToken.ts';

const MAX_FILE_SIZE_MB = 20;
const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024;
const MAX_PROMPT_LENGTH = 2000;

export const PromptInput: FC = () => {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { theme } = useTheme();
  const [showError, setShowError] = useState('');
  const navigate = useNavigate();
  const [generatePreview] = useGeneratePreviewMutation();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [infoVisible, setInfoVisible] = useState(false);

  const inIframe = useInIframe();
  const iframeToken = useIframeToken();
  const hostToken = sessionStorage.getItem('hostToken') || iframeToken;
  const isReadyToGenerate = !inIframe || !!hostToken;
  const [dragOver, setDragOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doQuadrification, setDoQuadrification] = useState(false);
  const [polygonCount, setPolygonCount] = useState<number>(40000);
  const isStand = !!localStorage.getItem('demonstration');

  const handleSetFile = (file: File) => {
    if (!['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type)) {
      setShowError('Разрешены только JPG, JPEG, JPE, PNG, GIF или WEBP');
      setTimeout(() => setShowError(''), 3000);
      fileInputRef.current!.value = '';
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setShowError(`Максимальный размер файла — ${MAX_FILE_SIZE_MB} МБ`);
      setTimeout(() => setShowError(''), 3000);
      fileInputRef.current!.value = '';
      return;
    }
    setSelectedImage(file);
    setInputValue('');
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  useEffect(() => {
    inputRef.current?.focus();
  }, [inputValue]);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length > MAX_PROMPT_LENGTH) {
      setShowError(`Максимальная длина запроса ${MAX_PROMPT_LENGTH} символов`);
      setInputValue(value.slice(0, MAX_PROMPT_LENGTH));
      setTimeout(() => setShowError(''), 2000);
      return;
    }
    setInputValue(value);
    setShowError('');
  };

  const handlePolygonCountChange = (value: number | string | null) => {
    if (value === null || value === '') return;

    const numValue = typeof value === 'string' ? parseInt(value, 10) : value;

    if (isNaN(numValue)) return;

    if (numValue < 10000) {
      setPolygonCount(10000);
    } else if (numValue > 500000) {
      setPolygonCount(500000);
    } else {
      setPolygonCount(numValue);
    }
  };

  const doGenerate = async () => {
    const sessionToken = getSessionToken();
    setIsSubmitting(true);
    try {
      const { data } = await generatePreview({
        variables: {
          input: {
            prompt: inputValue,
            token: inIframe ? iframeToken ?? '' : 'captchaToken',
            sessionToken,
            doQuadrification,
            num_target_faces: polygonCount,
            create_lod: 6,
            mode: MeshModels.Xr_3D,
            generationType: FrontGenerationType.Standard,
          },
        },
      });
      if (data?.generatePreview) {
        navigate(`/${data.generatePreview.id}`);
        setInputValue('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const startGeneratePreview = async () => {
    if (!isReadyToGenerate) return;

    try {
      if (selectedImage) {
        const formData = new FormData();
        formData.append('file', selectedImage);

        const sessionToken = getSessionToken();
        formData.append('sessionToken', sessionToken ?? '');
        formData.append('token', inIframe ? iframeToken ?? '' : 'captchaToken');
        formData.append('mode', MeshModels.ImageTo_3D);
        formData.append('generationType', FrontGenerationType.Standard);
        formData.append('doQuadrification', String(doQuadrification));
        formData.append('numTargetFaces', String(polygonCount));
        formData.append('createLod', '6');

        const res = await fetch(
          `${import.meta.env.VITE_SERVER_URL ? import.meta.env.VITE_SERVER_URL : '/api'}/upload/image`,
          {
            method: 'POST',
            body: formData,
          },
        );

        if (!res.ok) {
          throw new Error('Ошибка загрузки файла');
        }

        const data = await res.text();
        const parsed = data ? JSON.parse(data) : null;

        if (parsed?.previewId) {
          navigate(`/${parsed.previewId}/0`);
          setSelectedImage(null);
        }
      } else {
        if (CENSOR.test(inputValue)) {
          setShowError('Вы не можете использовать нецензурную лексику и запрещенные темы для создания моделей');
          setTimeout(() => setShowError(''), 2000);
          return;
        }
        await doGenerate();
      }
    } catch (err) {
      setShowError('Ошибка при создании');
      console.error(err);
      setTimeout(() => setShowError(''), 2000);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      startGeneratePreview();
    }
  };

  const uploadInfo = (
    <div style={{ position: 'relative', maxWidth: 260, paddingTop: 4 }}>
      <ul style={{ paddingLeft: 18 }}>
        <li>Форматы: JPG (JPEG, JPE), PNG, GIF</li>
        <li>Максимальный размер: {MAX_FILE_SIZE_MB} МБ</li>
        <li>Максимум 1 файл за раз</li>
      </ul>
      <div style={{ fontSize: 12, opacity: 0.7 }}>Недопустимы изображения с запрещённым контентом</div>
    </div>
  );

  const uploadInfoTitle = (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minWidth: 160 }}>
      <span>Требования к файлам:</span>
      <button
        aria-label="Закрыть"
        onClick={() => setInfoVisible(false)}
        className={styles.infoCloseButton}
        tabIndex={0}
      >
        <CloseOutlined style={{ fontSize: 16 }} />
      </button>
    </div>
  );

  return (
    <div
      onDrop={(e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
          handleSetFile(file);
        }
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={classNames(styles.inputDropWrapper, { [styles.inputDropWrapper_over]: dragOver })}
    >
      <Container data-theme={theme} className={styles.inputContainer}>
        \{/* TODO: поставить новый логотип @vsribov */}
        {/* <MainLogoIcon theme={theme} className={styles.mainLogo} width="100%" height="auto" /> */}
        <span className={styles.subTitle}>Создам для Вас 3D-модель по текстовому запросу или изображению</span>
        <CustomInput
          theme={theme}
          ref={inputRef}
          value={inputValue}
          onKeyPress={handleKeyPress}
          onChange={handleChange}
          placeholder={selectedImage ? '' : 'Избушка на курьих ножках, сказочная, мультяшная'}
          autoSize={{ minRows: 1, maxRows: 5 }}
          maxLength={MAX_PROMPT_LENGTH}
          disabled={!!selectedImage}
          className={classNames(styles.searchInput, selectedImage && styles.searchInput_withImage)}
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/jpe,image/gif,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              handleSetFile(file);
            }
          }}
        />
        {/* превьюшка загруженной картинки */}
        {selectedImage && (
          <div className={styles.imagePreview}>
            <img
              src={URL.createObjectURL(selectedImage)}
              alt="preview"
              style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, marginRight: 12 }}
            />
            <div className={styles.imagePreview__info}>
              <div style={{ fontWeight: 500, fontSize: 16 }}>Генерация по картинке</div>
              <div className={styles.imagePreview__filename} title={selectedImage.name}>
                {selectedImage.name} ({(selectedImage.size / 1024).toFixed(1)}) KB
              </div>
            </div>
            <button
              type="button"
              className={styles.removeImageButton}
              onClick={() => setSelectedImage(null)}
              aria-label="Удалить изображение"
            >
              <RemoveIcon theme={theme} />
            </button>
          </div>
        )}
        <div className={styles.buttonWrapper}>
          <div className={styles.imageButtonGroup}>
            <Button type="text" className={styles.imageButton} onClick={() => fileInputRef.current?.click()}>
              <ImageIcon theme={theme} />
            </Button>
            <Popover
              content={uploadInfo}
              title={uploadInfoTitle}
              trigger="click"
              open={infoVisible}
              onOpenChange={setInfoVisible}
              placement="top"
            >
              <Button
                type="text"
                icon={<InfoCircleOutlined className={styles.infoIcon} />}
                aria-label="Требования к файлам"
                className={styles.infoButton}
              />
            </Popover>
            <>
              {isStand && (
                <>
                  <Switch
                    className={styles.quadSwitch}
                    checked={doQuadrification}
                    onChange={setDoQuadrification}
                    checkedChildren="Quads"
                    unCheckedChildren="Tris"
                    aria-label="Переключатель: треугольники или квадро-полигоны"
                    title={doQuadrification ? 'Квадро-полигоны' : 'Треугольники'}
                  />
                  <StyledInputNumber
                    className={styles.polygonInput}
                    value={polygonCount}
                    onChange={handlePolygonCountChange}
                    min={10000}
                    max={500000}
                    step={1000}
                    prefix={<TriangleIcon theme={theme} />}
                    controls={false}
                    aria-label="Количество полигонов"
                    title="Количество полигонов"
                    parser={(value) => {
                      const parsed = value?.replace(/\D/g, '') || '';
                      return parsed ? parseInt(parsed, 10) : 0;
                    }}
                    formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')}
                  />
                </>
              )}
            </>
          </div>
          <CreateButton
            onClick={startGeneratePreview}
            loading={isSubmitting}
            icon={<StarIconWhite />}
            type="primary"
            disabled={isSubmitting || !(inputValue.length || selectedImage) || !isReadyToGenerate}
            className={styles.submitButton}
          >
            {isSubmitting ? 'Создание...' : !isReadyToGenerate ? 'Подготовка...' : 'Создать'}
          </CreateButton>
        </div>
        {/* TODO: по дизайну у кнопки другое поведение */}
        {false && (
          <PromoButton
            type="default"
            shape="round"
            size="large"
            className="prompt-promo-btn"
            onClick={() => navigate('/editor')}
          >
            <span aria-hidden style={{ fontSize: 16, lineHeight: 1 }}>
              🎮
            </span>
            <span style={{ marginLeft: 8 }}>GameDev</span>
          </PromoButton>
        )}
      </Container>
      <ErrorBlock isVisible={!!showError}>{showError || ' '}</ErrorBlock>
    </div>
  );
};

const Container = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const CustomInput = styled(TextArea)<{ theme: 'light' | 'dark' }>`
  outline: none;
  resize: none;
  padding: 0 130px 0 0;
  ::placeholder {
    opacity: 0.5;
  }
  &[disabled] {
    cursor: default;
  }
`;

const CreateButton = styled(Button)``;

const StyledInputNumber = styled(InputNumber)`
  margin-left: 8px;
  width: 95px;
  height: 23px;
  padding-right: 15px;
  border-radius: 16px;
  display: flex;
  align-items: center;

  .ant-input-number-input {
    text-align: center;
    font-size: 13px;
    padding: 4px 8px;
  }

  .ant-input-number-prefix {
    margin-right: 4px;
  }
`;

const ErrorBlock = styled.div<{ isVisible: boolean }>`
  width: 100%;
  text-align: center;
  font-size: 16px;
  min-height: 24px;
  margin-bottom: 12px;
  color: #f31b31;
  display: ${({ isVisible }) => (isVisible ? 'block' : 'none')};
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  transition: opacity 0.2s ease;
  @media (max-width: 552px) {
    font-size: 14px;
    margin-bottom: 10px;
  }
`;

const PromoButton = styled(Button)`
  margin-top: 12px;
  padding: 0 14px;
  height: 40px;
  border: none;
  border-radius: 12px;
  background: #3e3f43;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.04);
  display: inline-flex;
  align-items: center;
  font-weight: 600;
  letter-spacing: 0.2px;
  align-self: center;

  &:hover,
  &:focus {
    background: #4a4b50 !important;
    color: #ffffff !important;
  }

  &:active {
    background: #34353a !important;
  }
`;
