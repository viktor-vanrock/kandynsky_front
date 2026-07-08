import React, { useState, useCallback, useEffect } from 'react';
import { notification } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { GenerationStatus, SubmitCensorComplaintDocument } from '../../graphql/graphQlApiHooks';
import { getSessionToken } from '../../utils/session';
import { useApolloClient } from '@apollo/client';
import {buttonBlackTransparent, text, buttonFocused} from '@salutejs/plasma-tokens'

interface StatusCheckInput {
  censored?: boolean | null;
  status?: GenerationStatus | null;
  previewId?: string | null;
}

export const useErrorNotification = () => {
  const [errorNotified, setErrorNotified] = useState(false);
  const [censorPopupOpen, setCensorPopupOpen] = useState(false);
  const [censorPreviewId, setCensorPreviewId] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const client = useApolloClient();

  const resetNotification = useCallback(() => {
    setErrorNotified(false);
  }, []);

  useEffect(() => {
    resetNotification();
  }, [location.pathname, resetNotification]);

  const checkAndNotify = useCallback(
    (input: StatusCheckInput) => {
      // не показываем ошибку повторно
      if (errorNotified) return;

      const isInvalid = input.status === GenerationStatus.CancelledValidation;
      const isCancelled = input.status === GenerationStatus.Cancelled;
      const isCensor = input.censored || isInvalid;

      if (isCensor || isCancelled) {
        const key = `censor-${Date.now()}`

        const handleComplaint = async () => {
          if (!input.previewId) return;
          try {
            const sessionToken = getSessionToken();
            await client.mutate({
              mutation: SubmitCensorComplaintDocument,
              variables: {previewId: input.previewId, sessionToken},
            })
            notification.destroy(key);
            notification.success({
              message: 'Спасибо за обращение!',
              description: 'Мы разберем Ваш запрос',
              duration: null,
            })
          } catch(err) {
            console.error('[CensorComplaint] Failed to submit', err)
          }
        }

        if (isCensor) {
          notification.error({
            message: 'Не можем сгенерировать модель по этому запросу. Попробуйте изменить текст или изображение.',
            onClose: resetNotification,
            duration: null
          });

          notification.info({
            key,
            message: 'Не согласны с решением?',
            btn: input.previewId
              ? React.createElement(
                  'button',
                  {
                    style: {
                      buttonBlackTransparent,
                      cursor: 'pointer',
                      background: buttonBlackTransparent,
                      color: text,
                      border: 'none',
                      borderRadius: '20px',
                      focusColor: buttonFocused,
                      padding: '6px 16px',
                      fontSize: '14px',
                      fontFamily: 'var(--plasma-typo-body-m-font-family)',
                      fontWeight: 500,
                      lineHeight: '20px',
                      width: '340px',

                    },
                    onClick: () => {
                      handleComplaint();
                    },
                  },
                  'Сообщите нам',
               )
              : undefined,
              duration: null,
            onClose: resetNotification,
          });
        } else {
          notification.error({
            message: 'Ошибка генерации',
            description:
              'Произошла ошибка при генерации. Попробуйте изменить запрос и попробовать еще раз.',
            onClose: resetNotification,
          });
        }
        setErrorNotified(true);
        navigate('/');
      }
    },
    [errorNotified, navigate, resetNotification, client],
  );

  return {
    checkAndNotify,
    resetNotification,
    censorPopupOpen,
    setCensorPopupOpen,
    censorPreviewId,
    setCensorPreviewId,
  };
};
