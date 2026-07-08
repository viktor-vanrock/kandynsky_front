import { CheckCircleFilled, CheckCircleOutlined, CloseCircleFilled, CloseCircleOutlined } from '@ant-design/icons';
import { FC, MouseEvent } from 'react';
import styled from 'styled-components';
import AttachIconSvg from '../assets/icons/attach-Icon.svg?react';
import BackArrowBlack from '../assets/icons/back_arrow_black.svg?react';
import BackArrowWhite from '../assets/icons/back_arrow_white.svg?react';
import CameraOffBlack from '../assets/icons/camera_off_black.svg?react';
import CameraOffWhite from '../assets/icons/camera_off_white.svg?react';
import CameraOnBlack from '../assets/icons/camera_on_black.svg?react';
import CameraOnWhite from '../assets/icons/camera_on_white.svg?react';
import CatalogIconBlack from '../assets/icons/catalog_black.svg?react';
import CatalogIconWhite from '../assets/icons/catalog_white.svg?react';
import CloseCrossDark from '../assets/icons/cross_dark.svg?react';
import CloseCrossLight from '../assets/icons/cross_light.svg?react';
import DefaultModeIconSvg from '../assets/icons/default_mode.svg?react';
import DownloadIconBlack from '../assets/icons/download_black.svg?react';
import DownloadIconWhite from '../assets/icons/download_white.svg?react';
import GameDevModeIconSvg from '../assets/icons/gamedev_mode.svg?react';
import HdriIconBlack from '../assets/icons/HDRI_icon_black.svg?react';
import HdriIconWhite from '../assets/icons/HDRI_icon_white.svg?react';
import ImageIconBlack from '../assets/icons/image_icon_black.svg?react';
import ImageIconWhite from '../assets/icons/image_icon_white.svg?react';
import LockedModeIconSvg from '../assets/icons/locked_mode.svg?react';
import MeshIconBlack from '../assets/icons/mesh_icon_black.svg?react';
import MeshIconWhite from '../assets/icons/mesh_icon_white.svg?react';
import MoonDarkThemeIcon from '../assets/icons/moon_icon.svg?react';
import PrintingModeIconSvg from '../assets/icons/printing_mode.svg?react';
import RemoveIconBlack from '../assets/icons/remove_black.svg?react';
import RemoveIconWhite from '../assets/icons/remove_white.svg?react';
import RotateBlack from '../assets/icons/rotate-black.svg?react';
import RotateWhite from '../assets/icons/rotate-white.svg?react';
import ScreenshotIconBlack from '../assets/icons/screenshot_black.svg?react';
import ScreenshotIconWhite from '../assets/icons/screenshot_white.svg?react';
import ModelShareBlack from '../assets/icons/share_black.svg?react';
import ModelShareWhite from '../assets/icons/share_white.svg?react';
import SubmitIconSvg from '../assets/icons/submit_button_icon.svg?react';
import SunLightThemeIcon from '../assets/icons/sun_icon.svg?react';
import SunOutlinedBlack from '../assets/icons/sun_outlined_black.svg?react';
import SunOutlinedWhite from '../assets/icons/sun_outlined_white.svg?react';
import TextureIconBlack from '../assets/icons/texture_icon_black.svg?react';
import TextureIconWhite from '../assets/icons/texture_icon_white.svg?react';
import TriangleBlack from '../assets/icons/triangle_black.svg?react';
import TriangleWhite from '../assets/icons/triangle_white.svg?react';
import TransformTranslateBlack from '../assets/icons/move_mode_black.svg?react';
import TransformTranslateWhite from '../assets/icons/move_mode_white.svg?react';
import TransformTranslateBlue from '../assets/icons/move_mode_blue.svg?react';
import TransformRotateBlack from '../assets/icons/rotate_mode_black.svg?react';
import TransformRotateWhite from '../assets/icons/rotate_mode_white.svg?react';
import TransformRotateBlue from '../assets/icons/rotate_mode_blue.svg?react';
import MeshTextureIconBlack from '../assets/icons/mesh_texture_black.svg?react';
import MeshTextureIconWhite from '../assets/icons/mesh_texture_white.svg?react';
import MeshTextureIconBlue from '../assets/icons/mesh_texture_blue.svg?react';
import TransformScaleBlack from '../assets/icons/scale_mode_black.svg?react';
import TransformScaleWhite from '../assets/icons/scale_mode_white.svg?react';
import TransformScaleBlue from '../assets/icons/scale_mode_blue.svg?react';
import DTaaSLogoWhite from '../assets/icons/DTaaS_logo.svg?react';
// Mode Icons with customizable color
const ModeIconWrapper = styled.div<{ color?: string }>`
  display: contents;

  svg {
    path {
      fill: ${(props) => props.color || 'rgba(255, 255, 255, 0.56)'};
      fill-opacity: 1;
    }
  }
`;

export const DefaultModeIcon: FC<{ color?: string }> = ({ color = 'rgba(255, 255, 255, 0.56)' }) => (
  <ModeIconWrapper color={color}>
    <DefaultModeIconSvg />
  </ModeIconWrapper>
);

export const GameDevModeIcon: FC<{ color?: string }> = ({ color = 'rgba(255, 255, 255, 0.56)' }) => (
  <ModeIconWrapper color={color}>
    <GameDevModeIconSvg />
  </ModeIconWrapper>
);

export const LockedModeIcon: FC<{ color?: string }> = ({ color = 'rgba(255, 255, 255, 0.56)' }) => (
  <ModeIconWrapper color={color}>
    <LockedModeIconSvg />
  </ModeIconWrapper>
);

export const PrintingModeIcon: FC<{ color?: string }> = ({ color = 'rgba(255, 255, 255, 0.56)' }) => (
  <ModeIconWrapper color={color}>
    <PrintingModeIconSvg />
  </ModeIconWrapper>
);

const AttachIconWrapper = styled.div<{ color?: string }>`
  display: contents;

  svg {
    path {
      fill: ${(props) => props.color || 'rgba(8, 8, 8, 0.56)'};
      fill-opacity: 1;
    }
  }
`;

export const AttachIcon: FC<{ color?: string }> = ({ color = 'rgba(8, 8, 8, 0.56)' }) => (
  <AttachIconWrapper color={color}>
    <AttachIconSvg />
  </AttachIconWrapper>
);

const SubmitIconWrapper = styled.div<{ color?: string }>`
  display: contents;

  svg {
    path {
      fill: ${(props) => props.color || '#3F81FD'};
      fill-opacity: 1;
    }
  }
`;

export const SubmitIcon: FC<{ color?: string }> = ({ color = '#3F81FD' }) => (
  <SubmitIconWrapper color={color}>
    <SubmitIconSvg />
  </SubmitIconWrapper>
);

export const StarIcon: FC<{ color: boolean }> = ({ color }) => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8.45504 3.77685C8.7867 2.76839 10.2133 2.7684 10.5449 3.77685L11.3478 6.218C11.571 6.89679 12.1034 7.42919 12.7822 7.65243L15.2233 8.45528C16.2318 8.78694 16.2318 10.2135 15.2233 10.5452L12.7822 11.348C12.1034 11.5712 11.571 12.1036 11.3478 12.7824L10.5449 15.2236C10.2132 16.232 8.78669 16.232 8.45504 15.2236L7.65219 12.7824C7.42894 12.1036 6.89655 11.5712 6.21775 11.348L3.7766 10.5452C2.76814 10.2135 2.76816 8.78694 3.7766 8.45528L6.21776 7.65243C6.89655 7.42919 7.42894 6.89679 7.65219 6.218L8.45504 3.77685Z"
        fill="url(#paint0_linear_1239_5137)"
      />
      <path
        d="M13.8726 17.4132C13.9112 17.2878 14.0887 17.2878 14.1274 17.4132L14.2637 17.8551C14.3936 18.2765 14.7235 18.6063 15.1449 18.7363L15.5868 18.8726C15.7122 18.9113 15.7122 19.0887 15.5868 19.1274L15.1449 19.2637C14.7235 19.3937 14.3936 19.7235 14.2637 20.1449L14.1274 20.5868C14.0887 20.7122 13.9112 20.7122 13.8726 20.5868L13.7363 20.1449C13.6063 19.7235 13.2765 19.3937 12.8551 19.2637L12.4131 19.1274C12.2877 19.0887 12.2877 18.9113 12.4131 18.8726L12.8551 18.7363C13.2765 18.6063 13.6063 18.2765 13.7363 17.8551L13.8726 17.4132Z"
        fill="url(#paint1_linear_1239_5137)"
      />
      <path
        d="M17.6911 10.6197C17.6331 10.4316 17.3669 10.4316 17.3089 10.6197L16.8687 12.0469C16.6738 12.679 16.179 13.1738 15.5469 13.3687L14.1197 13.8089C13.9316 13.8669 13.9316 14.1331 14.1197 14.1911L15.5469 14.6313C16.179 14.8262 16.6738 15.321 16.8687 15.9531L17.3089 17.3803C17.3669 17.5684 17.6331 17.5684 17.6911 17.3803L18.1312 15.9531C18.3262 15.321 18.821 14.8262 19.453 14.6313L20.8802 14.1911C21.0683 14.1331 21.0683 13.8669 20.8802 13.8089L19.453 13.3687C18.821 13.1738 18.3262 12.679 18.1312 12.0469L17.6911 10.6197Z"
        fill="url(#paint2_linear_1239_5137)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_1239_5137"
          x1="3.02026"
          y1="20.6809"
          x2="19.689"
          y2="21.8597"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={color ? '#3E79F0' : 'black'} />
          <stop offset="1" stopColor={color ? '#27C6E5' : 'black'} />
        </linearGradient>
        <linearGradient
          id="paint1_linear_1239_5137"
          x1="3.02026"
          y1="20.6809"
          x2="19.689"
          y2="21.8597"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={color ? '#3E79F0' : 'black'} />
          <stop offset="1" stopColor={color ? '#27C6E5' : 'black'} />
        </linearGradient>
        <linearGradient
          id="paint2_linear_1239_5137"
          x1="3.02026"
          y1="20.6809"
          x2="19.689"
          y2="21.8597"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor={color ? '#3E79F0' : 'black'} />
          <stop offset="1" stopColor={color ? '#27C6E5' : 'black'} />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const StarIconWhite = () => {
  return (
    <svg width="19" height="18" viewBox="0 0 19 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M5.95528 0.776846C6.28694 -0.231613 7.7135 -0.231598 8.04516 0.776847L8.84801 3.218C9.07125 3.89679 9.60365 4.42919 10.2824 4.65243L12.7236 5.45528C13.732 5.78694 13.732 7.2135 12.7236 7.54516L10.2824 8.34801C9.60365 8.57125 9.07125 9.10365 8.84801 9.78244L8.04516 12.2236C7.71349 13.232 6.28694 13.232 5.95528 12.2236L5.15243 9.78244C4.92919 9.10365 4.39679 8.57125 3.718 8.34801L1.27685 7.54516C0.268388 7.21349 0.268402 5.78694 1.27685 5.45528L3.718 4.65243C4.39679 4.42919 4.92919 3.89679 5.15243 3.218L5.95528 0.776846Z"
        fill={'white'}
        fillOpacity="1"
      />
      <path
        d="M11.3728 14.4132C11.4115 14.2878 11.589 14.2878 11.6276 14.4132L11.7639 14.8551C11.8939 15.2765 12.2237 15.6063 12.6451 15.7363L13.0871 15.8726C13.2125 15.9113 13.2125 16.0887 13.0871 16.1274L12.6451 16.2637C12.2237 16.3937 11.8939 16.7235 11.7639 17.1449L11.6276 17.5868C11.589 17.7122 11.4115 17.7122 11.3728 17.5868L11.2365 17.1449C11.1066 16.7235 10.7767 16.3937 10.3553 16.2637L9.91337 16.1274C9.78799 16.0887 9.78799 15.9113 9.91337 15.8726L10.3553 15.7363C10.7767 15.6063 11.1066 15.2765 11.2365 14.8551L11.3728 14.4132Z"
        fill={'white'}
        fillOpacity="1"
      />
      <path
        d="M15.1913 7.61973C15.1333 7.43165 14.8671 7.43165 14.8091 7.61973L14.369 9.04695C14.174 9.67901 13.6792 10.1738 13.0472 10.3687L11.6199 10.8089C11.4319 10.8669 11.4319 11.1331 11.6199 11.1911L13.0472 11.6313C13.6792 11.8262 14.174 12.321 14.369 12.9531L14.8091 14.3803C14.8671 14.5684 15.1333 14.5684 15.1913 14.3803L15.6315 12.9531C15.8264 12.321 16.3212 11.8262 16.9533 11.6313L18.3805 11.1911C18.5686 11.1331 18.5686 10.8669 18.3805 10.8089L16.9533 10.3687C16.3212 10.1738 15.8264 9.67901 15.6315 9.04695L15.1913 7.61973Z"
        fill={'white'}
        fillOpacity="1"
      />
    </svg>
  );
};

export const CatalogIcon: FC<{ color?: boolean; theme: string }> = ({ theme }) => {
  return theme === 'dark' ? <CatalogIconWhite /> : <CatalogIconBlack />;
};

const StyledSvg = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  cursor: pointer;
`;

const NonInteractiveSvg = styled(StyledSvg)`
  cursor: default;
`;

// Старый компонент LogoIcon больше не используется
// export const LogoIcon: FC<{ theme: 'light' | 'dark'; onClick: (event: MouseEvent<HTMLElement>) => void }> = ({
//   theme,
//   onClick,
// }) => {
//   return theme === 'light' ? (
//     <StyledSvg onClick={onClick}>
//       <LightLogo />
//     </StyledSvg>
//   ) : (
//     <StyledSvg onClick={onClick}>
//       <DarkLogo />
//     </StyledSvg>
//   );
// };

export const MoonIcon = ({ className }: { className?: string }) => {
  return <MoonDarkThemeIcon className={className} />;
};

export const SunIcon = ({ className }: { className?: string }) => {
  return <SunLightThemeIcon className={className} />;
};

export const CloseIcon = () => {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.46967 0.46967C0.762563 0.176777 1.23744 0.176777 1.53033 0.46967L7 5.93934L12.4697 0.46967C12.7626 0.176777 13.2374 0.176777 13.5303 0.46967C13.8232 0.762563 13.8232 1.23744 13.5303 1.53033L8.06066 7L13.5303 12.4697C13.8232 12.7626 13.8232 13.2374 13.5303 13.5303C13.2374 13.8232 12.7626 13.8232 12.4697 13.5303L7 8.06066L1.53033 13.5303C1.23744 13.8232 0.762563 13.8232 0.46967 13.5303C0.176777 13.2374 0.176777 12.7626 0.46967 12.4697L5.93934 7L0.46967 1.53033C0.176777 1.23744 0.176777 0.762563 0.46967 0.46967Z"
        fill="#080808"
        fillOpacity="0.96"
      />
    </svg>
  );
};

export const ArrowLeft = () => {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.03033 0.46967C9.32322 0.762563 9.32322 1.23744 9.03033 1.53033L3.31066 7.25H14.5C14.9142 7.25 15.25 7.58579 15.25 8C15.25 8.41421 14.9142 8.75 14.5 8.75H3.31066L9.03033 14.4697C9.32322 14.7626 9.32322 15.2374 9.03033 15.5303C8.73744 15.8232 8.26256 15.8232 7.96967 15.5303L0.96967 8.53033C0.676777 8.23744 0.676777 7.76256 0.96967 7.46967L7.96967 0.46967C8.26256 0.176777 8.73744 0.176777 9.03033 0.46967Z"
        fill="#080808"
        fillOpacity="0.96"
      />
    </svg>
  );
};

export const Animate01 = () => {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 200 200"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M35.084 86.9749L102.521 47.6892L170.588 86.9749V113.025L102.521 152.101L35.084 113.025V86.9749Z"
        fill="url(#paint0_linear_798_6112)"
      />
      <path
        d="M35.084 86.9749L102.521 47.6892L170.588 86.9749M35.084 86.9749L102.521 126.051M35.084 86.9749V113.025L102.521 152.101M170.588 86.9749L102.521 126.051M170.588 86.9749V113.025L102.521 152.101M102.521 126.051V152.101"
        stroke="#6e7074"
        strokeWidth="1.68067"
      />
      <defs>
        <linearGradient
          id="paint0_linear_798_6112"
          x1="102.941"
          y1="5.46232"
          x2="123.95"
          y2="113.235"
          gradientUnits="userSpaceOnUse"
        >
          <stop />
          <stop offset="1" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const Animate02 = () => {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 200 200"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M48.3193 93.6062C50.7798 99.2538 55.8068 104.235 62.5011 108.129C72.1932 113.767 85.5272 117.227 100.21 117.227C114.893 117.227 128.227 113.767 137.919 108.129C144.613 104.235 149.64 99.2538 152.101 93.6062V114.286C152.101 122.331 146.488 129.772 137.074 135.248C127.681 140.711 114.65 144.118 100.21 144.118C85.7704 144.118 72.7389 140.711 63.3461 135.248C53.9322 129.772 48.3193 122.331 48.3193 114.286V93.6062ZM63.3461 106.676C53.9322 101.201 48.3193 93.76 48.3193 85.7143C48.3193 77.6685 53.9322 70.2279 63.3461 64.7521C72.7389 59.2885 85.7704 55.8823 100.21 55.8823C114.65 55.8823 127.681 59.2885 137.074 64.7521C146.488 70.2279 152.101 77.6685 152.101 85.7143C152.101 93.76 146.488 101.201 137.074 106.676C127.681 112.14 114.65 115.546 100.21 115.546C85.7704 115.546 72.7389 112.14 63.3461 106.676Z"
        fill="url(#paint0_linear_798_6115)"
        stroke="#6e7074"
        strokeWidth="1.68067"
      />
      <defs>
        <linearGradient
          id="paint0_linear_798_6115"
          x1="136.765"
          y1="30.042"
          x2="121.219"
          y2="109.034"
          gradientUnits="userSpaceOnUse"
        >
          <stop />
          <stop offset="1" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export const Animate03 = () => {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 200 200"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="101.05"
        cy="100.21"
        r="51.4706"
        fill="url(#paint0_radial_798_6118)"
        fillOpacity="0.8"
        stroke="#6e7074"
        strokeWidth="1.68067"
      />
      <defs>
        <radialGradient
          id="paint0_radial_798_6118"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(146.008 60.5042) rotate(135.693) scale(86.0178 81.9159)"
        >
          <stop />
          <stop offset="0.865405" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
};

export const Animate04 = () => {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 200 200"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M49.1597 92.8571L80.6723 52.1008L131.723 58.8235L151.261 106.933L119.538 147.689L68.0672 140.546L49.1597 92.8571Z"
        fill="url(#paint0_radial_798_6121)"
      />
      <path
        d="M49.1597 92.8571L80.6723 52.1008M49.1597 92.8571L68.0672 95.7983M49.1597 92.8571L68.0672 140.546M80.6723 52.1008L68.0672 95.7983M80.6723 52.1008L131.723 58.8235M80.6723 52.1008L119.538 75.4202M68.0672 95.7983V140.546M68.0672 95.7983L112.185 129.832M68.0672 95.7983L119.538 75.4202M68.0672 140.546L119.538 147.689M68.0672 140.546L112.185 129.832M119.538 147.689L151.261 106.933M119.538 147.689L112.185 129.832M151.261 106.933L131.723 58.8235M151.261 106.933L112.185 129.832M151.261 106.933L119.538 75.4202M131.723 58.8235L119.538 75.4202M112.185 129.832L119.538 75.4202"
        stroke="#6e7074"
        strokeWidth="1.68067"
      />
      <defs>
        <radialGradient
          id="paint0_radial_798_6121"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(36.1345 168.908) rotate(-40.4293) scale(106.255 100.851)"
        >
          <stop />
          <stop offset="1" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
};

export const Animate05 = () => {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 200 200"
      fill="none"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M144.538 124.37C144.538 130.53 139.926 136.293 132.055 140.566C124.217 144.821 113.331 147.479 101.26 147.479C89.1897 147.479 78.3036 144.821 70.4653 140.566C62.5942 136.293 57.9829 130.53 57.9829 124.37C57.9829 122.051 58.6311 119.801 59.8567 117.663L101.26 53.0286L142.664 117.663C143.889 119.801 144.538 122.051 144.538 124.37Z"
        fill="url(#paint0_radial_798_6124)"
        stroke="#6e7074"
        strokeWidth="1.68067"
      />
      <defs>
        <radialGradient
          id="paint0_radial_798_6124"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(69.3275 31.5127) rotate(76.0527) scale(98.492 102.554)"
        >
          <stop />
          <stop offset="1" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
};

export const AllReview = () => {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12.5 0.75C12.5 0.335786 12.1642 0 11.75 0C11.3358 0 11 0.335786 11 0.75V8.25C11 8.66421 11.3358 9 11.75 9H19.25C19.6642 9 20 8.66421 20 8.25C20 7.83579 19.6642 7.5 19.25 7.5H13.5607L19.7803 1.28033C20.0732 0.987437 20.0732 0.512563 19.7803 0.21967C19.4874 -0.0732232 19.0126 -0.0732232 18.7197 0.21967L12.5 6.43934V0.75Z"
        fill="#080808"
        fillOpacity="0.96"
      />
      <path
        d="M0 11.75C0 12.1642 0.335786 12.5 0.75 12.5H6.43934L0.21967 18.7197C-0.0732232 19.0126 -0.0732232 19.4874 0.21967 19.7803C0.512563 20.0732 0.987437 20.0732 1.28033 19.7803L7.5 13.5607V19.25C7.5 19.6642 7.83579 20 8.25 20C8.66421 20 9 19.6642 9 19.25V11.75C9 11.3358 8.66421 11 8.25 11H0.75C0.335786 11 0 11.3358 0 11.75Z"
        fill="#080808"
        fillOpacity="0.96"
      />
    </svg>
  );
};

export const ModelShare = () => {
  return (
    <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.5001 2.81074C12.5 2.84871 12.5 2.88884 12.5 2.9313V5.37199C12.5 5.85069 12.1177 6.24177 11.6391 6.25264C6.60979 6.36695 2.48329 10.0463 1.65256 14.8429C2.35109 13.9963 3.11777 13.2097 4.08905 12.5641C5.69011 11.4999 7.77851 10.8562 10.9248 10.762L10.9452 10.7614C11.0638 10.7578 11.1955 10.7538 11.3107 10.7603C11.4441 10.7678 11.6153 10.791 11.794 10.8774C12.0345 10.9936 12.2353 11.1885 12.3586 11.4253C12.4512 11.6032 12.479 11.7758 12.4903 11.9084C12.5001 12.0243 12.5 12.1577 12.5 12.2794L12.5 14.0686C12.5 14.111 12.5 14.1512 12.5001 14.1891C12.5269 14.1623 12.5553 14.1339 12.5854 14.1039L18.1893 8.49993L12.5854 2.89595C12.5553 2.86592 12.5269 2.83756 12.5001 2.81074ZM11.2995 1.39523C11.5594 1.09097 11.9492 0.929497 12.3481 0.960891C12.6925 0.988001 12.9495 1.18732 13.0922 1.30681C13.2482 1.43736 13.4289 1.61813 13.6242 1.81351L19.7803 7.9696C20.0732 8.26249 20.0732 8.73737 19.7803 9.03026L13.6242 15.1863C13.4289 15.3817 13.2482 15.5625 13.0922 15.693C12.9495 15.8125 12.6925 16.0119 12.3481 16.039C11.9492 16.0704 11.5594 15.9089 11.2995 15.6046C11.0751 15.3419 11.0343 15.0193 11.0179 14.8338C11 14.6313 11 14.3756 11 14.0994L11 12.2999C11 12.2861 11 12.273 11 12.2604C10.9902 12.2607 10.9802 12.261 10.9697 12.2613C8.01273 12.3498 6.22162 12.9477 4.9194 13.8133C3.60853 14.6846 2.72439 15.8653 1.62592 17.3322L1.59021 17.3799C1.0814 18.0593 0 17.7002 0 16.8505V16.6248C0 10.3747 4.83431 5.23261 11 4.78198L11 2.9005C11 2.62422 11 2.3686 11.0179 2.16603C11.0343 1.98061 11.0751 1.65797 11.2995 1.39523Z"
        fill="#080808"
        fillOpacity="0.96"
      />
    </svg>
  );
};

export const ModelShareIcon: FC<{ theme: 'light' | 'dark' }> = ({ theme }) => {
  return theme === 'dark' ? <ModelShareWhite /> : <ModelShareBlack />;
};

export const DownloadIcon: FC<{ fill: string }> = ({ fill }) => {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7.50199 1.25C7.50199 0.973858 7.27814 0.75 7.00199 0.75C6.72585 0.75 6.50199 0.973858 6.50199 1.25V9.45498L4.741 7.69404C4.54573 7.49878 4.22915 7.49878 4.03389 7.69405C3.83863 7.88931 3.83864 8.2059 4.0339 8.40116L6.64845 11.0156C6.84371 11.2109 7.16028 11.2109 7.35554 11.0156L9.97008 8.40116C10.1653 8.2059 10.1654 7.88931 9.97009 7.69405C9.77483 7.49878 9.45825 7.49878 9.26299 7.69404L7.50199 9.45498V1.25Z"
        fill={fill}
      />
      <path
        d="M1.75 6.13072C1.75 5.85457 1.52614 5.63072 1.25 5.63072C0.973858 5.63072 0.75 5.85457 0.75 6.13072V10.3747C0.749994 10.7772 0.749989 11.1093 0.772097 11.3799C0.79506 11.661 0.844342 11.9193 0.967987 12.162C1.15973 12.5383 1.4657 12.8443 1.84202 13.036C2.08469 13.1597 2.34304 13.209 2.62409 13.2319C2.89468 13.254 3.22686 13.254 3.62935 13.254H10.3746C10.7771 13.254 11.1093 13.254 11.3799 13.2319C11.6609 13.209 11.9193 13.1597 12.162 13.036C12.5383 12.8443 12.8443 12.5383 13.036 12.162C13.1596 11.9193 13.2089 11.661 13.2319 11.3799C13.254 11.1093 13.254 10.7772 13.254 10.3747V6.13072C13.254 5.85457 13.0301 5.63072 12.754 5.63072C12.4778 5.63072 12.254 5.85457 12.254 6.13072V10.354C12.254 10.7823 12.2536 11.0735 12.2352 11.2985C12.2173 11.5177 12.1848 11.6298 12.145 11.708C12.0491 11.8962 11.8961 12.0491 11.708 12.145C11.6298 12.1849 11.5177 12.2173 11.2985 12.2352C11.0734 12.2536 10.7823 12.254 10.354 12.254H3.65C3.22171 12.254 2.93056 12.2536 2.70552 12.2352C2.48631 12.2173 2.37421 12.1849 2.29601 12.145C2.10785 12.0491 1.95487 11.8962 1.85899 11.708C1.81915 11.6298 1.78669 11.5177 1.76878 11.2985C1.75039 11.0735 1.75 10.7823 1.75 10.354V6.13072Z"
        fill={fill}
      />
    </svg>
  );
};

export const HandIcon = () => {
  return (
    <svg width="104" height="56" viewBox="0 0 104 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M45.717 9.19927C46.485 8.91956 48.0002 9.09084 48.4002 9.94256C48.741 10.6686 49.0338 11.8927 49.0498 11.6318C49.0882 11.052 49.0114 9.79799 49.269 9.1427C49.4562 8.66499 49.8242 8.21556 50.3666 8.05684C50.8226 7.9217 51.3586 7.87456 51.8322 7.97042C52.333 8.07099 52.8594 8.42142 53.0562 8.75456C53.6354 9.73356 53.645 11.7387 53.6722 11.6318C53.7746 11.2044 53.7842 9.70056 54.125 9.1427C54.3506 8.77342 54.9202 8.44342 55.2242 8.38999C55.6946 8.30827 56.2738 8.28313 56.7666 8.37742C57.165 8.45442 57.7042 8.91799 57.8498 9.1427C58.2002 9.68327 58.397 11.2107 58.4562 11.7481C58.4818 11.9697 58.5746 11.1306 58.925 10.5916C59.5746 9.58742 61.8754 9.39256 61.9618 11.5957C62.0034 12.6234 61.9938 12.5763 61.9938 13.2677C61.9938 14.0786 61.9746 14.5688 61.9298 15.1566C61.8818 15.7836 61.7442 17.2057 61.5442 17.894C61.4066 18.367 60.9506 19.4308 60.4994 20.0688C60.4994 20.0688 58.781 22.0331 58.5938 22.9163C58.4066 23.801 58.469 23.8073 58.4306 24.4327C58.3938 25.0597 58.6242 25.8831 58.6242 25.8831C58.6242 25.8831 57.3426 26.0466 56.6498 25.9366C56.0242 25.8391 55.2498 24.6166 55.0498 24.2426C54.7746 23.7271 54.1874 23.8261 53.9586 24.2064C53.6002 24.8083 52.8242 25.8878 52.2786 25.9554C51.2082 26.0874 48.9906 26.0026 47.2546 25.9868C47.2546 25.9868 47.5506 24.3981 46.8914 23.8528C46.4034 23.4443 45.5634 22.6208 45.061 22.1871L43.7298 20.7398C43.277 20.1741 42.1266 19.28 41.741 17.6206C41.4002 16.1497 41.4338 15.4284 41.8002 14.8391C42.1714 14.2404 42.8722 13.9136 43.1666 13.857C43.4994 13.791 44.2738 13.7957 44.5666 13.9544C44.9234 14.1477 45.0674 14.2043 45.3474 14.5688C45.7154 15.0513 45.8466 15.2854 45.6882 14.759C45.5666 14.3473 45.173 13.824 44.9938 13.2347C44.8194 12.6674 44.3522 11.7528 44.3858 10.8367C44.3986 10.4894 44.5506 9.62513 45.717 9.19927Z"
        fill="white"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M45.717 9.19927C46.485 8.91956 48.0002 9.09084 48.4002 9.94256C48.741 10.6686 49.0338 11.8927 49.0498 11.6318C49.0882 11.052 49.0114 9.79799 49.269 9.1427C49.4562 8.66499 49.8242 8.21556 50.3666 8.05684C50.8226 7.9217 51.3586 7.87456 51.8322 7.97042C52.333 8.07099 52.8594 8.42142 53.0562 8.75456C53.6354 9.73356 53.645 11.7387 53.6722 11.6318C53.7746 11.2044 53.7842 9.70056 54.125 9.1427C54.3506 8.77342 54.9202 8.44342 55.2242 8.38999C55.6946 8.30827 56.2738 8.28313 56.7666 8.37742C57.165 8.45442 57.7042 8.91799 57.8498 9.1427C58.2002 9.68327 58.397 11.2107 58.4562 11.7481C58.4818 11.9697 58.5746 11.1306 58.925 10.5916C59.5746 9.58742 61.8754 9.39256 61.9618 11.5957C62.0034 12.6234 61.9938 12.5763 61.9938 13.2677C61.9938 14.0786 61.9746 14.5688 61.9298 15.1566C61.8818 15.7836 61.7442 17.2057 61.5442 17.894C61.4066 18.367 60.9506 19.4308 60.4994 20.0688C60.4994 20.0688 58.781 22.0331 58.5938 22.9163C58.4066 23.801 58.469 23.8073 58.4306 24.4327C58.3938 25.0597 58.6242 25.8831 58.6242 25.8831C58.6242 25.8831 57.3426 26.0466 56.6498 25.9366C56.0242 25.8391 55.2498 24.6166 55.0498 24.2426C54.7746 23.7271 54.1874 23.8261 53.9586 24.2064C53.6002 24.8083 52.8242 25.8878 52.2786 25.9554C51.2082 26.0874 48.9906 26.0026 47.2546 25.9868C47.2546 25.9868 47.5506 24.3981 46.8914 23.8528C46.4034 23.4443 45.5634 22.6208 45.061 22.1871L43.7298 20.7398C43.277 20.1741 42.1266 19.28 41.741 17.6206C41.4002 16.1497 41.4338 15.4284 41.8002 14.8391C42.1714 14.2404 42.8722 13.9136 43.1666 13.857C43.4994 13.791 44.2738 13.7957 44.5666 13.9544C44.9234 14.1477 45.0674 14.2043 45.3474 14.5688C45.7154 15.0513 45.8466 15.2854 45.6882 14.759C45.5666 14.3473 45.173 13.824 44.9938 13.2347C44.8194 12.6674 44.3522 11.7528 44.3858 10.8367C44.3986 10.4894 44.5506 9.62513 45.717 9.19927Z"
        stroke="black"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M56.9062 21.2969V15.8613" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M53.681 21.3148L53.6554 15.8572" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M50.4874 15.9071L50.521 21.2908" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M12.0896 10.4137C11.8611 9.9109 12.0834 9.31805 12.5862 9.08951L20.7795 5.36532C21.2823 5.13679 21.8751 5.35911 22.1037 5.86189C22.3322 6.36467 22.1099 6.95752 21.6071 7.18606L14.3242 10.4965L17.6346 17.7794C17.8631 18.2822 17.6408 18.875 17.138 19.1036C16.6352 19.3321 16.0424 19.1098 15.8138 18.607L12.0896 10.4137ZM91.4138 9.08968C91.9166 9.31822 92.1389 9.91107 91.9104 10.4138L88.1861 18.6071C87.9575 19.1099 87.3647 19.3322 86.8619 19.1037C86.3591 18.8751 86.1368 18.2823 86.3653 17.7795L89.6758 10.4966L82.3929 7.18611C81.8901 6.95757 81.6678 6.36472 81.8964 5.86194C82.1249 5.35916 82.7178 5.13684 83.2205 5.36539L91.4138 9.08968ZM13.3511 9.06355C37.1247 17.9788 66.8753 17.9786 90.6489 9.06371L91.3511 10.9364C67.1247 20.021 36.8753 20.0212 12.6489 10.9362L13.3511 9.06355Z"
        fill="url(#paint0_linear_945_34791)"
      />
      <rect x="17" y="27" width="20" height="22" rx="4" fill="white" fillOpacity="0.7" />
      <rect x="18" y="28" width="18" height="19" rx="3" fill="#171717" />
      <path
        d="M22.3657 37.6385C22.3657 34.1665 23.9057 32.5845 27.1117 32.5845C30.2337 32.5845 31.6197 34.1665 31.6197 37.6385C31.6197 40.4525 30.6117 41.9225 28.8197 42.4545L30.7657 44.7785H28.9317L27.1537 42.6925H26.9997C24.2417 42.6925 22.3657 41.2925 22.3657 37.6385ZM24.0177 37.6665C24.0177 40.4385 25.2357 41.3065 27.0557 41.3065C28.9037 41.3065 29.9817 40.4245 29.9817 37.6665C29.9817 34.8385 28.8897 33.9565 26.9857 33.9565C24.9557 33.9565 24.0177 35.1325 24.0177 37.6665Z"
        fill="white"
      />
      <rect x="67" y="27" width="20" height="22" rx="4" fill="white" fillOpacity="0.7" />
      <rect x="68" y="28" width="18" height="19" rx="3" fill="#171717" />
      <path
        d="M74.1705 42.5385V32.7385H80.3865V34.1105H75.7385V36.8965H79.9525V38.2405H75.7385V41.1665H80.3865V42.5385H74.1705Z"
        fill="white"
      />
      <defs>
        <linearGradient
          id="paint0_linear_945_34791"
          x1="90"
          y1="12.0001"
          x2="14"
          y2="12.0001"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.250027" stopColor="#3F81FD" />
          <stop offset="0.381029" stopColor="#3F81FD" stopOpacity="0" />
          <stop offset="0.643535" stopColor="#3F81FD" stopOpacity="0" />
          <stop offset="0.780157" stopColor="#3F81FD" />
        </linearGradient>
      </defs>
    </svg>
  );
};

type DownloadButtonProps = {
  theme: 'light' | 'dark';
  className?: string;
  hovered: boolean;
};
export const DownloadButtonIcon: FC<DownloadButtonProps> = ({ theme, className, hovered }) => {
  return theme === 'light' ? (
    <StyledSvg className={className ?? ''}>{hovered ? <DownloadIconWhite /> : <DownloadIconBlack />}</StyledSvg>
  ) : (
    <StyledSvg className={className ?? ''}>{hovered ? <DownloadIconBlack /> : <DownloadIconWhite />}</StyledSvg>
  );
};

export const RemoveIcon: FC<{ theme: 'light' | 'dark'; className?: string }> = ({ className, theme }) => {
  return theme === 'light' ? (
    <StyledSvg className={className ?? ''}>
      <RemoveIconBlack />
    </StyledSvg>
  ) : (
    <StyledSvg className={className ?? ''}>
      <RemoveIconWhite />
    </StyledSvg>
  );
};

export const AllModelsIcon = () => {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7.00122 3.75C7.00122 3.33579 7.33701 3 7.75122 3H16.2512C16.6654 3 17.0012 3.33579 17.0012 3.75C17.0012 4.16421 16.6654 4.5 16.2512 4.5H7.75122C7.33701 4.5 7.00122 4.16421 7.00122 3.75Z"
        fill="#080808"
        fillOpacity="0.96"
      />
      <path
        d="M5.31738 11H18.6852C19.2799 11 19.7735 11 20.1733 11.0341C20.5879 11.0695 20.977 11.146 21.336 11.3451C21.8824 11.6482 22.3093 12.1283 22.5465 12.7064C22.7022 13.0861 22.7328 13.4815 22.7195 13.8974C22.7067 14.2985 22.649 14.7887 22.5795 15.3793L22.3253 17.5398C22.2693 18.0157 22.2223 18.4151 22.1582 18.7409C22.0909 19.0823 21.9952 19.3993 21.8126 19.6949C21.5305 20.1517 21.121 20.5159 20.6344 20.7426C20.3195 20.8894 19.9934 20.9475 19.6465 20.9744C19.3154 21 18.9133 21 18.434 21H5.56854C5.08924 21 4.68712 21 4.35603 20.9744C4.00913 20.9475 3.68309 20.8894 3.36814 20.7426C2.88158 20.5159 2.47202 20.1517 2.18997 19.6949C2.0074 19.3993 1.91161 19.0823 1.84438 18.7409C1.78021 18.4151 1.73323 18.0157 1.67724 17.5397L1.42308 15.3793C1.35358 14.7887 1.2959 14.2985 1.28307 13.8974C1.26975 13.4815 1.30031 13.0861 1.4561 12.7064C1.69323 12.1283 2.12016 11.6482 2.6666 11.3451C3.02558 11.146 3.41462 11.0695 3.8293 11.0341C4.22908 11 4.72267 11 5.31738 11Z"
        fill="#080808"
        fillOpacity="0.96"
      />
      <path
        d="M17.0194 6C17.5076 5.99999 17.9138 5.99999 18.2454 6.02388C18.5895 6.04867 18.9142 6.10214 19.2241 6.24131C19.9027 6.54603 20.4289 7.11265 20.6827 7.81191C20.7986 8.13128 20.8279 8.45906 20.8272 8.80403C20.8268 9.01309 20.8111 9.23959 20.7906 9.5H3.21189C3.19137 9.23959 3.17573 9.01308 3.17531 8.80403C3.17461 8.45906 3.20395 8.13129 3.31985 7.81191C3.5736 7.11265 4.09981 6.54603 4.7784 6.24131C5.08835 6.10214 5.41306 6.04867 5.75714 6.02388C6.08872 5.99999 6.49488 5.99999 6.98312 6H17.0194Z"
        fill="#080808"
        fillOpacity="0.96"
      />
    </svg>
  );
};

// Старый компонент MainLogoIcon больше не используется
// export const MainLogoIcon: FC<{ theme: 'light' | 'dark'; className?: string }> = ({ theme, className }) => {
//   return theme === 'light' ? (
//     <StyledSvg className={className ?? ''}>
//       <MainLogoLight />
//     </StyledSvg>
//   ) : (
//     <StyledSvg className={className ?? ''}>
//       <MainLogoDark />
//     </StyledSvg>
//   );
// };

export const HdriIcon: FC<{ theme: 'light' | 'dark'; className?: string }> = ({ theme, className }) => {
  return theme === 'light' ? (
    <StyledSvg className={className ?? ''}>
      <HdriIconBlack />
    </StyledSvg>
  ) : (
    <StyledSvg className={className ?? ''}>
      <HdriIconWhite />
    </StyledSvg>
  );
};

export const MeshIcon: FC<{ theme: 'light' | 'dark'; className?: string }> = ({ theme, className }) => {
  return theme === 'light' ? (
    <StyledSvg className={className ?? ''}>
      <MeshIconBlack />
    </StyledSvg>
  ) : (
    <StyledSvg className={className ?? ''}>
      <MeshIconWhite />
    </StyledSvg>
  );
};

export const TextureIcon: FC<{ theme: 'light' | 'dark'; className?: string }> = ({ theme, className }) => {
  return theme === 'light' ? (
    <StyledSvg className={className ?? ''}>
      <TextureIconBlack />
    </StyledSvg>
  ) : (
    <StyledSvg className={className ?? ''}>
      <TextureIconWhite />
    </StyledSvg>
  );
};

export const TriangleIcon: FC<{ theme: 'light' | 'dark'; className?: string }> = ({ theme, className }) => {
  return theme === 'light' ? (
    <NonInteractiveSvg className={className ?? ''}>
      <TriangleBlack />
    </NonInteractiveSvg>
  ) : (
    <NonInteractiveSvg className={className ?? ''}>
      <TriangleWhite />
    </NonInteractiveSvg>
  );
};

export const CloseCrossIcon: FC<{
  theme: 'light' | 'dark';
  className?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
}> = ({ theme, className, onClick }) => {
  return theme === 'light' ? (
    <StyledSvg className={className ?? ''} onClick={onClick}>
      <CloseCrossDark />
    </StyledSvg>
  ) : (
    <StyledSvg className={className ?? ''} onClick={onClick}>
      <CloseCrossLight />
    </StyledSvg>
  );
};

export const RotateIcon: FC<{
  theme: 'light' | 'dark';
  className?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
}> = ({ theme, className, onClick }) => {
  return theme === 'light' ? (
    <StyledSvg className={className ?? ''} onClick={onClick}>
      <RotateBlack />
    </StyledSvg>
  ) : (
    <StyledSvg className={className ?? ''} onClick={onClick}>
      <RotateWhite />
    </StyledSvg>
  );
};

export const BackArrowIcon: FC<{
  theme: 'light' | 'dark';
  className?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
}> = ({ theme, className, onClick }) => {
  return theme === 'light' ? (
    <StyledSvg className={className ?? ''} onClick={onClick}>
      <BackArrowBlack />
    </StyledSvg>
  ) : (
    <StyledSvg className={className ?? ''} onClick={onClick}>
      <BackArrowWhite />
    </StyledSvg>
  );
};

export const ImageIcon: FC<{
  theme: 'light' | 'dark';
  className?: string;
  onClick?: (event: MouseEvent<HTMLElement>) => void;
}> = ({ theme, className, onClick }) => {
  return theme === 'light' ? (
    <StyledSvg className={className ?? ''} onClick={onClick}>
      <ImageIconBlack />
    </StyledSvg>
  ) : (
    <StyledSvg className={className ?? ''} onClick={onClick}>
      <ImageIconWhite />
    </StyledSvg>
  );
};

export const CameraIcon: FC<{ theme: 'light' | 'dark'; active: boolean }> = ({ theme, active }) => {
  if (theme === 'light') return active ? <CameraOnBlack /> : <CameraOffBlack />;
  return active ? <CameraOnWhite /> : <CameraOffWhite />;
};

export const ScreenshotIcon: FC<{ theme: 'light' | 'dark'; className?: string }> = ({ theme, className }) => {
  return theme === 'light' ? (
    <StyledSvg className={className ?? ''}>
      <ScreenshotIconBlack />
    </StyledSvg>
  ) : (
    <StyledSvg className={className ?? ''}>
      <ScreenshotIconWhite />
    </StyledSvg>
  );
};

export const SunOutlined: FC<{ theme: 'light' | 'dark'; className?: string }> = ({ theme, className }) => {
  return theme === 'light' ? (
    <StyledSvg className={className ?? ''}>
      <SunOutlinedBlack />
    </StyledSvg>
  ) : (
    <StyledSvg className={className ?? ''}>
      <SunOutlinedWhite />
    </StyledSvg>
  );
};

export const PublishedIcon: FC<{ theme: 'light' | 'dark'; className?: string }> = ({ theme, className }) => {
  return theme === 'light' ? (
    <StyledSvg className={className ?? ''}>
      <CheckCircleFilled />
    </StyledSvg>
  ) : (
    <StyledSvg className={className ?? ''}>
      <CheckCircleOutlined style={{ color: '#fff' }} />
    </StyledSvg>
  );
};

export const UnpublishedIcon: FC<{ theme: 'light' | 'dark'; className?: string }> = ({ theme, className }) => {
  return theme === 'light' ? (
    <StyledSvg className={className ?? ''}>
      <CloseCircleFilled />
    </StyledSvg>
  ) : (
    <StyledSvg className={className ?? ''}>
      <CloseCircleOutlined style={{ color: '#fff' }} />
    </StyledSvg>
  );
};

export const TransformTranslateIcon: FC<{
  theme: 'light' | 'dark';
  active?: boolean;
  className?: string;
}> = ({ theme, active = false, className }) => {
  if (active) {
    return (
      <StyledSvg className={className ?? ''}>
        <TransformTranslateBlue />
      </StyledSvg>
    );
  }
  return theme === 'light' ? (
    <StyledSvg className={className ?? ''}>
      <TransformTranslateBlack />
    </StyledSvg>
  ) : (
    <StyledSvg className={className ?? ''}>
      <TransformTranslateWhite />
    </StyledSvg>
  );
};

export const TransformRotateIcon: FC<{
  theme: 'light' | 'dark';
  active?: boolean;
  className?: string;
}> = ({ theme, active = false, className }) => {
  if (active) {
    return (
      <StyledSvg className={className ?? ''}>
        <TransformRotateBlue />
      </StyledSvg>
    );
  }
  return theme === 'light' ? (
    <StyledSvg className={className ?? ''}>
      <TransformRotateBlack />
    </StyledSvg>
  ) : (
    <StyledSvg className={className ?? ''}>
      <TransformRotateWhite />
    </StyledSvg>
  );
};

export const MeshTextureIcon: FC<{
  theme: 'light' | 'dark';
  active?: boolean;
  className?: string;
}> = ({ theme, active = false, className }) => {
  if (active) {
    return (
      <StyledSvg className={className ?? ''}>
        <MeshTextureIconBlue />
      </StyledSvg>
    );
  }
  return theme === 'light' ? (
    <StyledSvg className={className ?? ''}>
      <MeshTextureIconBlack />
    </StyledSvg>
  ) : (
    <StyledSvg className={className ?? ''}>
      <MeshTextureIconWhite />
    </StyledSvg>
  );
};

export const TransformScaleIcon: FC<{
  theme: 'light' | 'dark';
  active?: boolean;
  className?: string;
}> = ({ theme, active = false, className }) => {
  if (active) {
    return (
      <StyledSvg className={className ?? ''}>
        <TransformScaleBlue />
      </StyledSvg>
    );
  }
  return theme === 'light' ? (
    <StyledSvg className={className ?? ''}>
      <TransformScaleBlack />
    </StyledSvg>
  ) : (
    <StyledSvg className={className ?? ''}>
      <TransformScaleWhite />
    </StyledSvg>
  );
};

export const DTaaSLogoIcon: FC<{ className?: string }> = ({ className }) => {
  return (
    <StyledSvg className={className ?? ''}>
      <DTaaSLogoWhite />
    </StyledSvg>
  );
};
