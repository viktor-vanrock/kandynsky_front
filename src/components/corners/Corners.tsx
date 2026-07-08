import styled from 'styled-components';
import { useTheme } from '../../context';
import { FC } from 'react';

const CornerDecoration = styled.div<{ theme: 'light' | 'dark' }>`
  position: absolute;
  box-sizing: border-box;
  width: 20px;
  height: 20px;
  border: ${({ theme }) => (theme === 'dark' ? '2px solid  #FFFFFF80' : '2px solid  #00000080')};
  transition: 0.3s;
`;

const TopLeftCorner = styled(CornerDecoration)<{ greed: boolean; hover: boolean }>`
  top: ${({ greed }) => (greed ? '-8px' : '0')};
  left: 0;
  border-right: none;
  border-bottom: none;
  border-top-left-radius: 5px;
  border-color: ${({ hover }) => (hover ? '#000000' : '#00000080')};
`;

const TopRightCorner = styled(CornerDecoration)<{ greed: boolean; hover: boolean }>`
  top: ${({ greed }) => (greed ? '-8px' : '0')};
  right: 0;
  border-left: none;
  border-bottom: none;
  border-top-right-radius: 5px;
  border-color: ${({ hover }) => (hover ? '#000000' : '#00000080')};
`;

const BottomRightCorner = styled(CornerDecoration)<{ greed: boolean; hover: boolean }>`
  bottom: ${({ greed }) => (greed ? '-8px' : '0')};
  right: 0;
  border-top: none;
  border-left: none;
  border-bottom-right-radius: 5px;
  border-color: ${({ hover }) => (hover ? '#000000' : '#00000080')};
`;

const BottomLeftCorner = styled(CornerDecoration)<{ greed: boolean; hover: boolean }>`
  bottom: ${({ greed }) => (greed ? '-8px' : '0')};
  left: 0;
  border-top: none;
  border-right: none;
  border-bottom-left-radius: 5px;
  border-color: ${({ hover }) => (hover ? '#000000' : '#00000080')};
`;

const Container = styled.div<{ show: boolean }>`
  // @media (max-width: 960px) {
  display: ${({ show }) => (show ? 'block' : 'none')};
  // }
`;

export const Corners: FC<{ show?: boolean; greed?: boolean; hover?: boolean }> = ({
  show = true,
  greed = false,
  hover = false,
}) => {
  const { theme } = useTheme();

  return (
    <Container show={show}>
      <TopLeftCorner theme={theme} greed={greed} hover={hover} />
      <TopRightCorner theme={theme} greed={greed} hover={hover} />
      <BottomRightCorner theme={theme} greed={greed} hover={hover} />
      <BottomLeftCorner theme={theme} greed={greed} hover={hover} />
    </Container>
  );
};
