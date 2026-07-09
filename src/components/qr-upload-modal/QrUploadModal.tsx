import { FC } from 'react';
import { Modal } from 'antd';
import { QRCode } from 'react-qrcode-logo';
import classNames from 'classnames';
import styles from './QrUploadModal.module.css';
import { useLocale } from '../../context';

interface QrUploadModalProps {
  open: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
}

export const QrUploadModal: FC<QrUploadModalProps> = ({ open, onClose, theme }) => {
  const uploadUrl = `${window.location.origin}${window.location.pathname}?action=mobile-upload`;
  const isDark = theme === 'dark';
  const { t } = useLocale();

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title={null}
      centered
      closeIcon={false}
      width={384}
      rootClassName={classNames(styles.root, isDark ? styles.themeDark : styles.themeLight)}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 16,
          padding: 12,
          height: '100%',
          boxSizing: 'border-box',
        }}
      >
        <QRCode
          value={uploadUrl}
          size={360}
          eyeRadius={[
            [20, 0, 0, 0], // верхний левый: только внешний угол
            [0, 20, 0, 0], // верхний правый: только внешний угол
            [0, 0, 0, 20], // нижний левый: только внешний угол
          ]}
          ecLevel="L"
          quietZone={0}
          bgColor={isDark ? 'rgb(35, 35, 35)' : '#ffffff'}
          fgColor={isDark ? 'rgba(255, 255, 255, 0.96)' : 'rgba(8, 8, 8, 0.96)'}
        />
        <p
          style={{
            margin: 0,
            width: 336,
            fontFamily: "'SB Sans Text', sans-serif",
            fontSize: 24,
            lineHeight: '30px',
            fontWeight: 400,
            color: isDark ? '#ffffff' : '#000000',
            textAlign: 'center',
          }}
        >
          {t.scanQrToUpload}
        </p>
      </div>
    </Modal>
  );
};
