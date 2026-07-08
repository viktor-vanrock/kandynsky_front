import styled from 'styled-components';
import { FC, ReactNode } from 'react';

interface CenteredContainerProps {
  children: ReactNode;
  className?: string;
}

const CenteredContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  padding: 20px;
  overflow: hidden;

  @media (max-width: 959px) {
    padding: 0;
  }
`;

export const CenteredContent: FC<CenteredContainerProps> = ({ children, className }) => {
  return <CenteredContainer className={className ?? ''}>{children}</CenteredContainer>;
};
