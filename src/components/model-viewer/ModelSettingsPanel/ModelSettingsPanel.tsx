import { FC } from 'react';
import classNames from 'classnames';
import styles from './ModelSettingsPanel.module.css';

import { HdriIcon, TextureIcon, MeshIcon, CloseCrossIcon } from '../../Icons';
import { useViewerStore } from '../../../store/viewer';

type Props = {
  theme: 'dark' | 'light';
  activeHdriIndex: number;
  hdriMenuOpen: boolean;

  onToggleHdriMenu: () => void;
  onSelectHdri: (index: number) => void;
  onToggleTexture: () => void;
  onToggleMesh: () => void;
  isTextureDisabled?: boolean;
  className?: string;
};

export const ModelSettingsPanel: FC<Props> = ({
  theme,
  activeHdriIndex,
  hdriMenuOpen,
  onToggleHdriMenu,
  onSelectHdri,
  onToggleTexture,
  onToggleMesh,
  isTextureDisabled = false,
  className,
}) => {
  const isShowTexture = useViewerStore((state) => state.isShowTexture);
  const showMesh = useViewerStore((state) => state.showMesh);
  return (
    <div className={classNames(styles.modelSettings, className)} data-theme={theme}>
      <div className={styles.modelSettingWrapper}>
        <div className={styles.modelSettings__button} style={{border: 'solid 1.7px', borderRadius: '12px'}} onClick={onToggleHdriMenu}>
          <HdriIcon theme={theme} className={styles.modelSettings__icon} />
          <span className={styles.modelSettings_label}>HDRI карта</span>
        </div>

        {hdriMenuOpen && (
          <div id="hdri-menu" className={styles.hdriMenuWrapper} data-theme={theme}>
            <div className={styles.menuHeaderPanel}>
              <h4 className={styles.menuHeader}>HDRI карта</h4>
              <CloseCrossIcon theme={theme} className={styles.menuClose} onClick={onToggleHdriMenu} />
            </div>

            <div className={styles.menuButtonWrapper}>
              {['Карта 1', 'Карта 2', 'Карта 3', 'Карта 4', 'Карта 5'].map((hdri, hdriIndex) => (
                <div
                  key={hdri}
                  className={classNames(styles.hdriButton, hdriIndex === activeHdriIndex && styles.hdriButton_active)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectHdri(hdriIndex);
                  }}
                >
                  {hdri}
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          className={classNames(
            styles.modelSettings__button,
            isTextureDisabled && styles.modelSettings__buttonDisabled,
          )}
          onClick={() => {
            if (isTextureDisabled) return;
            onToggleTexture();
          }}
          aria-disabled={isTextureDisabled}
          style={isShowTexture ? {border: 'solid 1.7px', borderRadius: '12px'}: undefined}
        >
          <TextureIcon theme={theme} className={styles.modelSettings__icon} />
          <span className={styles.modelSettings_label}>Текстуры</span>
        </div>

        <div className={styles.modelSettings__button} onClick={onToggleMesh} style={showMesh ? {border: 'solid 1.7px', borderRadius: '12px'}: undefined}>
          <MeshIcon theme={theme} className={styles.modelSettings__icon}  />
          <span className={styles.modelSettings_label}>Сетка</span>
        </div>
      </div>
    </div>
  );
};

export default ModelSettingsPanel;
