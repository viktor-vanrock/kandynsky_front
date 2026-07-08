import { FC, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { BodyS } from '@salutejs/plasma-giga';
import { useTheme } from '../context';

interface ExpandableTextProps {
  text?: string | null;
  maxLength?: number;
  className?: string;
}

const TEXT_COLOR_DARK = 'rgba(255, 255, 255, 0.96)';
const TEXT_COLOR_LIGHT = 'rgba(8, 8, 8, 0.96)';
const LINK_COLOR_DARK = 'rgba(255, 255, 255, 0.56)';
const LINK_COLOR_LIGHT = 'rgba(8, 8, 8, 0.56)';

export const ExpandableText: FC<ExpandableTextProps> = ({
  text,
  maxLength = 140,
  className,
}) => {
  const [expanded, setExpanded] = useState(false);
  const { theme } = useTheme();

  const textColor = theme === 'dark' ? TEXT_COLOR_DARK : TEXT_COLOR_LIGHT;
  const linkColor = theme === 'dark' ? LINK_COLOR_DARK : LINK_COLOR_LIGHT;

  useEffect(() => {
    setExpanded(false);
  }, [text]);

  const { displayText, isLong } = useMemo(() => {
    const safeText = text ?? '';
    const long = safeText.length > maxLength;
    const truncatedText = long ? `${safeText.slice(0, maxLength)}...` : safeText;

    return { displayText: truncatedText, isLong: long };
  }, [text, maxLength]);

  if (!text) {
    return null;
  }

  return (
    <TextWrapper className={className}>
      <TextContainer data-theme={theme}>
        <BodyS color={textColor}>{expanded || !isLong ? text : displayText}</BodyS>
      </TextContainer>
      {!expanded && isLong && (
        <MoreButton type="button" onClick={() => setExpanded(true)}>
          <BodyS color={linkColor}>ещё</BodyS>
        </MoreButton>
      )}
    </TextWrapper>
  );
};

const TextWrapper = styled.span`
  display: inline-flex;
  align-items: baseline;
  gap: 6px;
  flex-wrap: wrap;
`;

const TextContainer = styled.div`
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.843);
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.9);
  }

  &[data-theme='light'] {
    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.843);
    }

    &::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.9);
    }
  }

  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.843) transparent;

  &[data-theme='light'] {
    scrollbar-color: rgba(0, 0, 0, 0.843) transparent;
  }
`;

const MoreButton = styled.button`
  border: none;
  background: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
`;
