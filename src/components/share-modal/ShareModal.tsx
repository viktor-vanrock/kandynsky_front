import { Modal, message } from 'antd';
import { Copy } from 'lucide-react';
import { FaVk, FaOdnoklassniki, FaTelegram, FaWhatsapp } from 'react-icons/fa';
import styles from './ShareModal.module.css';
import { useLocale } from '../../context';

const shareLinks = (url: string) => ({
  vk: `https://vk.com/share.php?url=${encodeURIComponent(url)}`,
  ok: `https://connect.ok.ru/offer?url=${encodeURIComponent(url)}`,
  telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}`,
  whatsapp: `https://wa.me/?text=${encodeURIComponent(url)}`,
});

type Props = {
  visible: boolean;
  onClose: () => void;
  shareUrl: string;
};

export default function ShareModal({ visible, onClose, shareUrl }: Props) {
  const links = shareLinks(shareUrl);
  const { t } = useLocale();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
    navigator.clipboard.writeText(shareUrl);
    message.success(t.linkCopied);
  };
  const iconStyle = { width: 24, height: 24 };

  return (
    <Modal open={visible} onCancel={onClose} footer={null} title={t.share} centered className="shareModal">
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 24 }}>
        <a
          href={links.vk}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.shareIcon}
          style={{ backgroundColor: '#0077ff', color: '#fff' }}
        >
          <FaVk style={iconStyle} />
        </a>
        <a
          href={links.ok}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.shareIcon}
          style={{ backgroundColor: '#ff9900', color: '#fff' }}
        >
          <FaOdnoklassniki style={iconStyle} />
        </a>
        <a
          href={links.telegram}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.shareIcon}
          style={{ backgroundColor: '#229ED9', color: '#fff' }}
        >
          <FaTelegram style={iconStyle} />
        </a>
        <a
          href={links.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.shareIcon}
          style={{ backgroundColor: '#25D366', color: '#fff' }}
        >
          <FaWhatsapp style={iconStyle} />
        </a>
        <button
          onClick={handleCopy}
          title={t.copyLink}
          className={styles.shareIcon}
          style={{ backgroundColor: '#f0f0f0', border: '1px solid #d9d9d9' }}
        >
          <Copy style={iconStyle} />
        </button>
      </div>
    </Modal>
  );
}
