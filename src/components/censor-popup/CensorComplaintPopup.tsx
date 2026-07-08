import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { BodyS, BodyXS, Button } from '@salutejs/plasma-giga';
import { useSubmitCensorComplaintMutation } from '../../graphql/graphQlApiHooks';
import { getSessionToken } from '../../utils/session';
import styled from 'styled-components';
import { useTheme } from '../../context';

interface CensorComplaintPopupProps {
  isOpen: boolean;
  onClose: () => void;
  previewId: string | null;
}

const PopupContainer = styled.div<{ $theme: 'light' | 'dark'; $visible: boolean }>`
  position: fixed;
  bottom: 120px;
  right: 24px;
  z-index: 10001;
  width: 280px;
  border-radius: 12px;
  padding: 16px;
  border-left: 3px solid rgba(255, 59, 48, 0.8);
  background: ${({ $theme }) => ($theme === 'dark' ? '#2a2a2a' : '#ffffff')};
  color: ${({ $theme }) => ($theme === 'dark' ? '#ffffff' : '#1a1a1a')};
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transform: ${({ $visible }) => ($visible ? 'translateY(0)' : 'translateY(12px)')};
  transition: opacity 0.3s ease, transform 0.3s ease;

  @media (max-width: 768px) {
    bottom: 160px;
    right: 16px;
    left: 16px;
    width: auto;
  }
`;

const CloseButton = styled.button<{ $theme: 'light' | 'dark' }>`
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ $theme }) => ($theme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)')};
  font-size: 16px;
  line-height: 1;
  padding: 2px 6px;
  border-radius: 4px;
  &:hover {
    color: ${({ $theme }) => ($theme === 'dark' ? '#fff' : '#000')};
  }
`;

const PopupContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px 0;
`;

const ErrorText = styled(BodyXS)<{$theme: 'light' | 'dark'}>`
  color: rgba(255, 59, 48, 0.9);
`

export const CensorComplaintPopup: FC<CensorComplaintPopupProps> = ({ isOpen, onClose, previewId }) => {
  const [submitted, setSubmitted] = useState(false);
  const [submitComplaint] = useSubmitCensorComplaintMutation();
  const [submitError, setSubmitError] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { theme } = useTheme();

  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const startDismissTimer = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onCloseRef.current;
    }, 5000);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSubmitted(false);
      setSubmitError(false);
      startDismissTimer();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isOpen, startDismissTimer]);

  const handleSubmit = async () => {
    if (!previewId) return;
    setSubmitError(false);
    try {
      const sessionToken = getSessionToken();
      await submitComplaint({
        variables: {
          previewId,
          sessionToken,
        },
      });
      setSubmitted(true);
      startDismissTimer();
    } catch (err) {
      console.error('[CensorComplaint] Failed to submit:', err);
      setSubmitError(true);
    }
  };

  if (!isOpen) return null;

  return (
    <PopupContainer $theme={theme} $visible={isOpen}>
      <CloseButton $theme={theme} onClick={onClose}>
        ✕
      </CloseButton>
      <PopupContent>
        {!submitted ? (
          <>
            <BodyS>Не согласны с решением фильтра?</BodyS>
            {submitError && <ErrorText $theme={theme}>Не удалось отправить жалобу. Попробуйте еще раз</ErrorText>}
            <Button view="secondary" stretching="filled" size="s" onClick={handleSubmit}>
              <BodyS bold>Отправить жалобу</BodyS>
            </Button>
          </>
        ) : (
          <>
            <BodyS bold>Спасибо, жалоба отправлена!</BodyS>
            <BodyXS>Фильтр иногда может срабатывать ошибочно. Мы разберем Ваш запрос.</BodyXS>
          </>
        )}
      </PopupContent>
    </PopupContainer>
  );
};
