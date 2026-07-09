import { Button, Dropdown } from 'antd';
import { FC, useRef, useState } from 'react';
import { MeshRequestEntity } from '../../graphql/graphQlApiHooks.ts';
import { DownloadButtonIcon } from '../Icons.tsx';
import styles from './DownloadModel.module.css';
import { useTheme } from '../../context/ThemeContext.ts';
import { useLocale } from '../../context';

interface DownloadModelProps {
  modelInfo: MeshRequestEntity | null;
  prompt: string | undefined | null;
}

const DownloadModel: FC<DownloadModelProps> = ({ modelInfo }) => {
  const [isHovered, setIsHovered] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { theme } = useTheme();
  const { t } = useLocale();

  const downloadModel = (type: string) => {
    const modelType = modelInfo?.meshFormats?.find((mesh) => mesh.format.name === type);

    if (!modelType) return;
    const link = document.createElement('a');
    link.href = modelType.url;
    link.download = `model.${type}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const menuBlocks = (
    <div className={styles.downloadMenuWrapper} data-theme={theme}>
      <h4 className={styles.downloadMenuHeader}>{t.extensionLabel}</h4>
      <div className={styles.downloadButtonWrapper}>
        {['obj', 'stl', 'fbx', 'glb', 'usdz'].map((format) => (
          <div className={styles.downloadFormatButton} key={format} onClick={() => downloadModel(format)}>
            {format}
            <DownloadButtonIcon theme={theme} className={styles.downloadButtonIcon} hovered={false} />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ position: 'relative' }} data-theme={theme}>
      <Dropdown dropdownRender={() => menuBlocks} trigger={['click']} transitionName="">
        <Button
          className={styles.downloadButton}
          ref={buttonRef}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <DownloadButtonIcon theme={theme} className={styles.downloadButtonIcon} hovered={isHovered} />
        </Button>
      </Dropdown>
    </div>
  );
};

export default DownloadModel;
