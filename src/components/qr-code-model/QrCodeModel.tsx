import { FC } from 'react';
import { QRCode } from 'react-qrcode-logo';
import classNames from 'classnames';
import styles from './QrCodeModel.module.css';
import { useLocale } from '../../context';

interface QRCodeModelProps {
  meshId: string;
  className?: string;
}

export const QRCodeModel: FC<QRCodeModelProps> = ({ meshId, className }: QRCodeModelProps) => {
  const { t } = useLocale();
  if (!meshId) return null;
  const qrDownloadUrl = `${window.location.origin}/download/${meshId}`;
  return (
    <div className={classNames(styles.qrContainer, className)}>
      <QRCode value={qrDownloadUrl} size={120} logoPaddingStyle="square" qrStyle="dots" eyeRadius={10} ecLevel={'L'} />
      <div className={styles.text}>{t.downloadModel}</div>
    </div>
  );
};
