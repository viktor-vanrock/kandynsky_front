import { FC } from 'react';
import classNames from 'classnames';
import styles from './ModelSettingsPanel.module.css';

import { HdriIcon, TextureIcon, MeshIcon, CloseCrossIcon } from '../../Icons';
import { useViewerStore } from '../../../store/viewer';
import { useLocale } from '../../../context';

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
  const { t } = useLocale();
  return (
    <div className={classNames(styles.modelSettings, className)} data-theme={theme}>
      <div className={styles.modelSettingWrapper}>
        <div className={styles.modelSettings__button} style={{border: 'solid 1.7px', borderRadius: '12px'}} onClick={onToggleHdriMenu}>
          <HdriIcon theme={theme} className={styles.modelSettings__icon} />
          <span className={styles.modelSettings_label}>{t.hdriMapSettings}</span>
        </div>

        {hdriMenuOpen && (
          <div id="hdri-menu" className={styles.hdriMenuWrapper} data-theme={theme}>
            <div className={styles.menuHeaderPanel}>
              <h4 className={styles.menuHeader}>{t.hdriMapSettings}</h4>
              <CloseCrossIcon theme={theme} className={styles.menuClose} onClick={onToggleHdriMenu} />
            </div>

            <div className={styles.menuButtonWrapper}>
              {[1, 2, 3, 4, 5].map((n, hdriIndex) => (
                <div
                  key={n}
                  className={classNames(styles.hdriButton, hdriIndex === activeHdriIndex && styles.hdriButton_active)}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectHdri(hdriIndex);
                  }}
                >
                  {t.map} {n}
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
          <span className={styles.modelSettings_label}>{t.texturesSettings}</span>
        </div>

        <div className={styles.modelSettings__button} onClick={onToggleMesh} style={showMesh ? {border: 'solid 1.7px', borderRadius: '12px'}: undefined}>
          <MeshIcon theme={theme} className={styles.modelSettings__icon}  />
          <span className={styles.modelSettings_label}>{t.gridSettings}</span>
        </div>
      </div>
    </div>
  );
};

export default ModelSettingsPanel;
