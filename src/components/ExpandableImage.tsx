import { FC, useState, useCallback } from 'react';
import styled from 'styled-components';

interface ExpandableImageProps {
  src: string;
  alt?: string;
  minSize?: number;
  maxSize?: number;
  className?: string;
}

export const ExpandableImage: FC<ExpandableImageProps> = ({
  src,
  alt = 'Изображение',
  minSize = 64,
  maxSize = 300,
  className,
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleClick = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  const currentSize = expanded ? maxSize : minSize;

  return (
    <ImageContainer
      className={className}
      onClick={handleClick}
      $expanded={expanded}
      title={expanded ? 'Нажмите, чтобы уменьшить' : 'Нажмите, чтобы увеличить'}
    >
      <StyledImage src={src} alt={alt} $size={currentSize} $expanded={expanded} />
    </ImageContainer>
  );
};

const ImageContainer = styled.div<{ $expanded: boolean }>`
  display: inline-block;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: ${({ $expanded }) => ($expanded ? '14px' : '10px')};
  overflow: hidden;
  position: relative;

  &:hover {
    opacity: 0.9;
  }
`;

const StyledImage = styled.img<{ $size: number; $expanded: boolean }>`
  max-width: ${({ $size }) => $size}px;
  max-height: ${({ $size }) => $size}px;
  width: auto;
  height: auto;
  object-fit: contain;
  display: block;
  border-radius: ${({ $expanded }) => ($expanded ? '14px' : '10px')};
  border: 1px solid #ddd;
  box-shadow: ${({ $expanded }) => ($expanded ? '0 4px 20px rgba(0,0,0,0.15)' : '0 2px 8px rgba(0,0,0,0.06)')};
  transition: all 0.3s ease;
`;

export default ExpandableImage;
