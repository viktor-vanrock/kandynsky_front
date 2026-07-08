import styled from 'styled-components';
import { CSSProperties, FC, ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  text: string;
  active: boolean;
  onClick: () => void;
  style?: CSSProperties;
  className?: string;
  spanClassName?: string;
}

const ButtonWrapper = styled.button<{ active: boolean }>`
  height: 40px;
  padding: 8px 18px 8px 45px;
  gap: 4px;
  border-radius: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;

  font-size: 18px;
  font-weight: 600;
  line-height: 24px;
  text-align: left;
  color: ${({ active }) => (active ? '#FFFFFFF5' : '#0808088F')};
  background: ${({ active }) => (active ? '#080808' : '#FFFFFF')};
  border: ${({ active }) => (active ? '1px solid #DDDDDD' : '1px solid #DDDDDD')};
  margin-right: 8px;
  -moz-user-select: none;
  -khtml-user-select: none;
  user-select: none;

  &:focus-visible,
  &:focus {
    outline: none !important;
  }
  &:hover {
    background: ${({ active }) =>
      active
        ? 'linear-gradient(0deg, rgba(42, 114, 248, 0.3), rgba(42, 114, 248, 0.3)), linear-gradient(0deg, #080808, #080808)'
        : '#FFFFFF'};
    border: ${({ active }) => (active ? '1px solid #080808F5' : '1px solid #080808')};
    color: ${({ active }) => (active ? '#FFFFFFF5' : '#080808F5')};
  }
`;

const IconWrapper = styled.span`
  position: absolute;
  left: 17px;
  top: 10px;
`;

export const ButtonMenu: FC<ButtonProps> = ({ children, active, text, onClick, style, className, spanClassName }) => {
  return (
    <ButtonWrapper active={active} onClick={onClick} style={style} className={className}>
      <IconWrapper>{children}</IconWrapper>
      <span className={spanClassName}>{text}</span>
    </ButtonWrapper>
  );
};
