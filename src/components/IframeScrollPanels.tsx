import { FC } from 'react';
import styled from 'styled-components';

type IframeScrollPanelsProps = {
  enabled: boolean;
  className?: string;
  topOffset?: number;
  bottomOffset?: number;
};

export const IframeScrollPanels: FC<IframeScrollPanelsProps> = ({
  enabled,
  className,
  topOffset = 0,
  bottomOffset = 0,
}) => {
  if (!enabled) return null;

  return (
    <Panels className={className} aria-hidden="true">
      <Panel $side="left" $topOffset={topOffset} $bottomOffset={bottomOffset} />
      <Panel $side="right" $topOffset={topOffset} $bottomOffset={bottomOffset} />
    </Panels>
  );
};

const Panels = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
`;

const Panel = styled.div<{ $side: 'left' | 'right'; $topOffset: number; $bottomOffset: number }>`
  position: absolute;
  ${({ $side }) => ($side === 'left' ? 'left: 0;' : 'right: 0;')}
  top: ${({ $topOffset }) => `${$topOffset}px`};
  bottom: ${({ $bottomOffset }) => `${$bottomOffset}px`};
  width: 300px;
  pointer-events: auto;
  background: transparent;
  touch-action: pan-y;
  z-index: 2;
`;
