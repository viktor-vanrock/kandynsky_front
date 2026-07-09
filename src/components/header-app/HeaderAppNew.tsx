import { FC } from 'react';
import styled from 'styled-components';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../../context';
import { useLocale } from '../../context';
import { Locale } from '../../context/LocaleContext';
import { BackButton } from '../back-button/BackButton';
import { BackArrowIcon } from '../Icons';
import LogoLightImg from '../../assets/icons/Logo-light.svg';
import LogoDarkImg from '../../assets/icons/Logo-dark.svg';
import CardstackIcon from '../../assets/icons/cardstack-fill.svg';
import MoonThemeIcon from '../../assets/icons/moon-theme.svg';
import { BodyM, Button, } from '@salutejs/plasma-giga';

const HeaderContainer = styled.header`
  position: absolute;
  height: 72px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 64px;
  background: transparent;
  z-index: 10;

  @media (max-width: 768px) {
    height: 48px;
    padding: 0 8px;
  }
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
`;

const AllModelsButton = styled(Button)<{ $isLight?: boolean }>`

  @media (max-width: 768px) {
    padding: 12px;

    text {
      display: none;
    }
  }
`;

const BackTextButton = styled.button<{ $theme: 'light' | 'dark' }>`
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: ${(props) => (props.$theme === 'light' ? 'rgba(8,8,8,0.96)' : 'rgba(255,255,255,0.96)')};
  font-family: 'SB Sans Text', sans-serif;
  font-size: 16px;
  line-height: 20px;
  padding: 4px 0;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 0.7;
  }
`;

const StyledButtonText = styled(BodyM)`
  @media (max-width: 768px) {
    display: none;
  }
`
const CenterSection = styled.div`
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Logo = styled.img`
  width: 284px;
  height: 36px;
  cursor: pointer;

  @media (max-width: 768px) {
    width: 190px;
    height: 24px;
  }
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const ThemeSwitch = styled.button<{ isDark: boolean }>`
  position: relative;
  width: 44px;
  height: 28px;
  padding: 2px 3px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 60px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: ${(props) => (props.isDark ? 'flex-end' : 'flex-start')};
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }
`;

const ThemeCap = styled.div`
  width: 22px;
  height: 22px;
  background: var(--plasma-colors-surface-solid-default, #f9f9f9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 1px 4px -1px rgba(0, 0, 0, 0.04), 0px 4px 14px -4px rgba(8, 8, 8, 0.08);
  transition: all 0.3s ease;
`;

const MoonIconImg = styled.img`
  width: 13px;
  height: 13px;
`;

const LangSwitch = styled.div`
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 20px;
  padding: 2px;
  gap: 2px;
`;

const LangButton = styled.button<{ $active: boolean }>`
  padding: 4px 10px;
  height: 24px;
  border: none;
  border-radius: 18px;
  cursor: pointer;
  font-family: 'SB Sans Text', sans-serif;
  font-size: 13px;
  font-weight: 600;
  line-height: 16px;
  letter-spacing: 0.02em;
  transition: all 0.2s ease;
  background: ${(props) => (props.$active ? 'rgba(255, 255, 255, 0.9)' : 'transparent')};
  color: ${(props) => (props.$active ? 'rgba(8, 8, 8, 0.96)' : 'rgba(255, 255, 255, 0.7)')};
  box-shadow: ${(props) => (props.$active ? '0 1px 4px rgba(0,0,0,0.12)' : 'none')};

  &:hover {
    color: ${(props) => (props.$active ? 'rgba(8, 8, 8, 0.96)' : 'rgba(255, 255, 255, 0.96)')};
  }
`;

const SunIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
    <circle cx="6.5" cy="6.5" r="3" fill="#080808" fillOpacity="0.96" />
    <path
      d="M6.5 0v2M6.5 11v2M13 6.5h-2M2 6.5H0M10.5 10.5l-1.4-1.4M3.9 3.9L2.5 2.5M10.5 2.5L9.1 3.9M3.9 9.1l-1.4 1.4"
      stroke="#080808"
      strokeWidth="1.2"
      strokeOpacity="0.96"
    />
  </svg>
);

const LOCALES: { value: Locale; label: string }[] = [
  { value: 'ru', label: 'RU' },
  { value: 'en', label: 'EN' },
];

export const HeaderAppNew: FC = () => {
  //HACK isToggleThemeDisabled для блокировки тогла
  const { theme, toggleTheme, isToggleThemeDisabled } = useTheme();
  const { locale, setLocale, t } = useLocale();
  const navigate = useNavigate();
  const location = useLocation();

  const isHomePage = location.pathname === '/';
  const isSelfiePage = location.pathname === '/selfie';
  const isPrinterPage = location.pathname === '/printer';

  // определяем страницу вьюера
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const isModelViewerPage =
    ['models'].includes(pathSegments[0]) ||
    (pathSegments.length === 2 &&
      pathSegments[0] &&
      pathSegments[1] &&
      !['editor', 'download', 'printing-models', 'setting-stand', 'rules', '404'].includes(pathSegments[0]));

  const goHome = () => navigate('/');
  const goAllModels = () => navigate('/models');


  return (
    <HeaderContainer>
      <LeftSection>
        {(isSelfiePage || isPrinterPage) && (
          <BackTextButton $theme={theme} type="button" onClick={() => navigate(-1)}>
            <BackArrowIcon theme={theme} />
            {t.back}
          </BackTextButton>
        )}
        {isModelViewerPage && <BackButton theme={theme} />}
        {isHomePage && (
          <AllModelsButton view='clear'  $isLight={theme === 'light'} onClick={goAllModels} contentLeft={<img src={CardstackIcon} alt="" />}>
            <StyledButtonText bold >{t.allModels}</StyledButtonText>
          </AllModelsButton>
        )}
      </LeftSection>

      <CenterSection>
        <Logo src={theme === 'dark' ? LogoLightImg : LogoDarkImg} alt="Kandinsky 3D" onClick={goHome} />
      </CenterSection>

      <RightSection>
        <LangSwitch>
          {LOCALES.map(({ value, label }) => (
            <LangButton
              key={value}
              $active={locale === value}
              onClick={() => setLocale(value)}
            >
              {label}
            </LangButton>
          ))}
        </LangSwitch>

        <ThemeSwitch disabled={isToggleThemeDisabled} isDark={theme === 'dark'} onClick={toggleTheme}>
          <ThemeCap>{theme === 'dark' ? <MoonIconImg src={MoonThemeIcon} alt="" /> : <SunIcon />}</ThemeCap>
        </ThemeSwitch>
      </RightSection>
    </HeaderContainer>
  );
};
