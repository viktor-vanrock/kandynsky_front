// import { FC, ReactNode, useEffect, useState } from 'react';
// import { Layout } from 'antd';
// import { useTheme } from '../../context';
// import styled from 'styled-components';
// import { ArrowLeft, BackArrowIcon, CatalogIcon } from '../Icons.tsx';
// import { useNavigate, useLocation } from 'react-router-dom';
// import ThemeToggle from '../theme-toggle/ThemeToggle.tsx';

// import styles from './HeaderApp.module.css';
// import classNames from 'classnames';
// import { isMobileDevice, testViewerPage } from '../../helpers/utils.ts';
// import { useInIframe } from '../../hooks/useInIframe.ts';
// import { ButtonMenu } from '../button-wrapper/ButtonMenu.tsx';

// const { Header: AntHeader } = Layout;

// const HeaderBlock = styled(AntHeader)`
//   display: flex;
//   align-items: center;
//   justify-content: space-between;
//   padding: 0 50px;
//   background: transparent;
// `;

// const ArrowButton = styled.button`
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   padding: 7px 12px;
//   border: 1px solid #c2c2c230;
//   background-color: white;
//   border-radius: 20px;
//   cursor: pointer;
//   outline: none;
//   position: absolute;
//   top: 18px;
//   width: 48px;
//   height: 36px;

//   &:hover,
//   &:active,
//   &:focus {
//     background-color: white;
//     border: 1px solid #c2c2c230;
//   }

//   svg {
//     width: 12px;
//     height: 12px;
//   }
// `;

// interface IconButtonProps {
//   onClick: () => void;
//   children: ReactNode;
//   className: string;
// }

// const IconButton: FC<IconButtonProps> = ({ onClick, children, className }) => {
//   return (
//     <ArrowButton onClick={onClick} className={className}>
//       {children}
//     </ArrowButton>
//   );
// };

// export const HeaderApp: FC = () => {
//   const { theme, toggleTheme } = useTheme();
//   const inIframe = useInIframe();
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [isMobile, setIsMobile] = useState(window.innerWidth < 959);

//   const isActive = (path: string) => location.pathname === path;
//   const isHomePage = location.pathname === '/';
//   const isGalleryPage = location.pathname === '/models';
//   const [isViewerPage, setIsViewerPage] = useState(testViewerPage(location.pathname));

//   useEffect(() => {
//     setIsMobile(isMobileDevice());
//     setIsViewerPage(testViewerPage(location.pathname));
//   }, [location.pathname]);

//   useEffect(() => {
//     setIsMobile(isMobileDevice());
//     setIsViewerPage(testViewerPage(location.pathname));
//   }, [location]);

//   const goHome = () => navigate('/');
//   const goAllModels = () => navigate('/models');
//   const goBack = () => navigate(-1);

//   const headerClassname = classNames(
//     styles.header,
//     isViewerPage && styles.header_viewerPage,
//     inIframe && styles.iframe,
//   );

//   return (
//     <HeaderBlock theme={theme} data-theme={theme} className={headerClassname}>
//       {!isHomePage && isMobile && window.innerWidth < 959 && (
//         <IconButton onClick={goBack} className={styles.arrowBackIcon}>
//           <ArrowLeft />
//         </IconButton>
//       )}
//       {isHomePage ? (
//         <ButtonMenu
//           onClick={goAllModels}
//           active={isActive('/models')}
//           text="Мои модели"
//           className={classNames(
//             styles.allModelsButton,
//             inIframe && styles.allModelsButton_inIframe,
//             isHomePage && styles.allModelsButton_homepage,
//             isGalleryPage && styles.allModelsButton_gallery,
//           )}
//         >
//           <CatalogIcon color={isActive('/models')} theme={theme} />
//         </ButtonMenu>
//       ) : (
//         isViewerPage && (
//           <div className={styles.backIcon} onClick={goBack}>
//             <BackArrowIcon theme={theme} />
//             <span>Назад</span>
//           </div>
//         )
//       )}

//       {!isHomePage && (
//         <div className={classNames(styles.header__logo, isHomePage && styles.header__logo_homepage)}>
//           {/* Using new component */}
//           {/* <LogoIcon theme={theme} onClick={goHome} /> */}
//         </div>
//       )}

//       {((isMobile && isHomePage) || !isMobile) && !inIframe && (
//         <ThemeToggle
//           isChecked={theme === 'dark'}
//           handleChange={toggleTheme}
//           theme={theme}
//           className={styles.themeToggle}
//         />
//       )}
//     </HeaderBlock>
//   );
// };
