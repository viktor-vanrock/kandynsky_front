import { Badge, BodyS, Button, IconButton, Tooltip } from '@salutejs/plasma-giga';
import {
  backgroundPrimary,
  surfaceTransparentPrimary,
  textSecondary,
} from '@salutejs/plasma-themes/tokens';
import { FC, useState, useEffect } from 'react';
import styled from 'styled-components';
import { MODES } from '../../utils/const';

const ModeBarContainer = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-start;
  width: 648px;

  margin-bottom: 96px;
  position: relative;
  padding: 8px 18px;

  @media (max-width: 768px) {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    margin-bottom: 0;
    background: ${backgroundPrimary};
    padding: 16px 16px calc(16px + env(safe-area-inset-bottom));
    box-sizing: border-box;
    flex-direction: column;
    gap: 4px;
    z-index: 1000;

    &::before {
      display: none;
    }
  }
`;

const ModeSegmentGroup = styled.div<{ $theme: 'light' | 'dark' }>`
  display: flex;
  gap: 4px;
  flex: 1;
  left: -2px;
  top: -2px;

  width: 652px;
  height: 48px;

  border-radius: var(--CornerRadius-Rounded, 1000px);
  background: ${surfaceTransparentPrimary};

  @media (max-width: 768px) {
    width: 100%;
    gap: 0;
    align-items: center;
    justify-content: space-between;
    position: relative;

    &::before {
      content: '';
      position: absolute;
      left: -2px;
      right: -2px;
      height: 52px;
      top: 50%;
      transform: translateY(-50%);
      background: ${surfaceTransparentPrimary};
      border-radius: 1000px;
      z-index: 0;
    }
  }
`;

const ModeLabels = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    width: 100%;
    z-index: 10;
    position: relative;
  }
`;

const ModeLabel = styled.div<{ active?: boolean }>`
  display: none;

  @media (max-width: 768px) {
    display: block;
    flex-shrink: 0;
    width: 60px;
    font-family: 'SB Sans Text', sans-serif;
    font-size: 10px;
    font-weight: 500;
    line-height: 16px;
    letter-spacing: -0.2px;
    text-align: center;
    color: ${(props) => (props.active ? 'rgba(255, 255, 255, 0.96)' : 'rgba(255, 255, 255, 0.56)')};
  }
`;

interface ModeBarProps {
  selectedMode: string;
  onModeChange: (modeId: string) => void;
  theme: 'light' | 'dark';
}

export const ModeBar: FC<ModeBarProps> = ({ selectedMode, onModeChange, theme }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <ModeBarContainer>
      <ModeSegmentGroup $theme={theme}>
        {MODES.map((mode) => {
          const Icon = mode.IconComponent;

          if (isMobile) {
            return (
              <IconButton
                key={mode.id}
                pin='circle-circle'
                view={selectedMode === mode.id ? 'dark' : 'clear'}
                onClick={() => !mode.disabled && onModeChange(mode.id)}
                disabled={mode.disabled}
                contentLeft={<Icon color={selectedMode === mode.id ? '#3f81fd' : textSecondary} />}
              />
            );
          }

          return (
            <Tooltip
              key={mode.id}
              text={
                <BodyS color="textSecondary" style={{ maxWidth: 200 }}>
                  {mode.tooltip}
                </BodyS>
              }
              placement="bottom"
              hasArrow
              trigger='hover'
              mouseEnterDelay={1000}
              maxWidth={220}
              animated
              target={
                <Button
                  stretch
                  view={selectedMode === mode.id ? 'dark' : 'clear'}
                  onClick={() => !mode.disabled &&  onModeChange(mode.id)}
                  contentLeft={<Icon color={selectedMode === mode.id ? mode.iconColor : textSecondary} />}
                  disabled={mode.disabled}
                  // @ts-expect-error Badge не принимает "clear", хотя должен
                  contentRight={mode.badge && <Badge text={mode.badge} size="xs" pilled transparent clear customColor="#3F81FD" />}
                  >
                    <BodyS color="textSecondary" noWrap>
                      {mode.label}
                    </BodyS>
              </Button>
              }
            />
          );
        })}
      </ModeSegmentGroup>
      <ModeLabels>
        {MODES.map((mode) => (
          <ModeLabel
            key={mode.id}
            active={selectedMode === mode.id}
            onClick={() => !mode.disabled && onModeChange(mode.id)}
            style={{ cursor: mode.disabled ? 'default' : 'pointer' }}
          >
            {mode.label}
          </ModeLabel>
        ))}
      </ModeLabels>
    </ModeBarContainer>
  );
};
