import { FC } from 'react';
import styled, { keyframes } from 'styled-components';
import { ModeType } from './types';

interface GradientLayerProps {
  $color1: string;
  $color2: string;
  $isActive: boolean;
}

const gradientShift = keyframes`
  0%, 100% {
    background-position: 0% 50%;
  }
  25% {
    background-position: 50% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  75% {
    background-position: 50% 50%;
  }
`;

const GradientLayer1 = styled.div<GradientLayerProps>`
  display: flex;
  width: 1692px;
  height: 912px;
  justify-content: center;
  align-items: center;
  position: fixed;
  right: -161.5px;
  top: -692px;
  background: linear-gradient(321deg, ${props => props.$color1} 0%, ${props => props.$color1} 35%, ${props => props.$color2} 50%, ${props => props.$color1} 65%, ${props => props.$color1} 100%);
  background-size: 200% 200%;
  filter: blur(90px);
  pointer-events: none;
  animation: ${gradientShift} 15s ease-in-out infinite;
  opacity: ${props => props.$isActive ? 1 : 0};
  transition: opacity 2s ease-in-out;
`;

const GradientLayer2 = styled.div<GradientLayerProps>`
  width: 2333px;
  height: 512px;
  left: 0;
  bottom: -400px;
  position: fixed;
  background: linear-gradient(321deg, ${props => props.$color1} 0%, ${props => props.$color1} 40%, ${props => props.$color2} 50%, ${props => props.$color1} 60%, ${props => props.$color1} 100%);
  background-size: 200% 200%;
  filter: blur(90px);
  pointer-events: none;
  z-index: 0;
  animation: ${gradientShift} 18s ease-in-out infinite reverse;
  opacity: ${props => props.$isActive ? 1 : 0};
  transition: opacity 2s ease-in-out;
`;

const MODE_COLORS: Record<ModeType, { color1: string; color2: string }> = {
  standard: {
    color1: 'rgba(0, 136, 255, 0.15)',    // #0088FF
    color2: 'rgba(217, 0, 255, 0.15)',    // #D900FF
  },
  gamedev: {
    color1: 'rgba(255, 153, 0, 0.15)',    // #FF9900
    color2: 'rgba(217, 0, 255, 0.15)',    // #D900FF
  },
  '3dprint': {
    color1: 'rgba(12, 177, 116, 0.15)',   // #0CB174
    color2: 'rgba(217, 0, 255, 0.15)',    // #D900FF
  },
};

const MODES: ModeType[] = ['standard', 'gamedev', '3dprint'];

interface BackgroundGradientsProps {
  mode?: ModeType;
}

export const BackgroundGradients: FC<BackgroundGradientsProps> = ({ mode = 'standard' }) => {
  return (
    <>
      {MODES.map((m) => {
        const colors = MODE_COLORS[m];
        const isActive = mode === m;
        return (
          <div key={m}>
            <GradientLayer1 $color1={colors.color1} $color2={colors.color2} $isActive={isActive} />
            <GradientLayer2 $color1={colors.color1} $color2={colors.color2} $isActive={isActive} />
          </div>
        );
      })}
    </>
  );
};
