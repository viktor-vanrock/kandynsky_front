import { FC } from 'react';
import { Modal } from 'antd';
import styled from 'styled-components';
import { useTheme } from '../../context';
import { SmartCaptcha } from '@yandex/smart-captcha';

interface CaptchaModalProps {
  open: boolean;
  onClose: () => void;
  onVerify: (token: string) => void;
}

export const TurnstileModal: FC<CaptchaModalProps> = ({ open, onClose, onVerify }) => {
  const { theme } = useTheme();

  return (
    <Modal
      data-theme={theme}
      open={open}
      onCancel={onClose}
      footer={null}
      closable
      maskClosable
      centered
      destroyOnClose
      width={320}
      styles={{ body: { padding: 12, textAlign: 'center' } }}
    >
      <ModalContent>
        <SmartCaptcha sitekey="ysc1_bplmTMwtqTg0oyNJLuTpLcnpysMTGCjeCTPAzCQ477b6ad44" onSuccess={onVerify} />
      </ModalContent>
    </Modal>
  );
};

const ModalContent = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 120px;
`;
