import { AllReview, CloseIcon, HandIcon } from '../Icons.tsx';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Button } from 'antd';
import { ComponentPropsWithoutRef, FC } from 'react';

import { GetGeneratedPreviewsQuery, MeshRequestEntity } from '../../graphql/graphQlApiHooks.ts';

interface ImageCornerProps extends ComponentPropsWithoutRef<'img'> {
  isLoading: boolean;
}

const ImageCorner = styled.div<ImageCornerProps>`
  position: absolute;
  right: ${({ isLoading }) => (isLoading ? '25px' : 'calc(50% - 50px)')};
  bottom: ${({ isLoading }) => (isLoading ? '25px' : '100px')};
  width: 104px;
  transition: right 1s ease, bottom 1s ease;

  @media (max-width: 959px) {
    display: none;
  }
`;

const CloseButton = styled(Button)`
  position: absolute;
  top: 25px;
  right: 25px;
  border: none;
  cursor: pointer;
`;

const AllPreviewButton = styled(Button)`
  position: absolute;
  top: 25px;
  left: 25px;
  border: none;
  cursor: pointer;
`;

interface ModelViewerToolsProps {
  modelInfo: MeshRequestEntity | null;
  preview: GetGeneratedPreviewsQuery['getGeneratedPreviews']['data'][0] | null;
  isLoading: boolean;
}

export const ModelViewerTools: FC<ModelViewerToolsProps> = ({ isLoading }) => {
  const navigate = useNavigate();

  const goHome = () => {
    navigate('/');
  };

  const goModelPreviews = () => {
    const currentUrl = window.location.href;
    window.location.href = currentUrl.substring(0, currentUrl.lastIndexOf('/'));
  };

  return (
    <>
      <AllPreviewButton ghost icon={<AllReview />} onClick={goModelPreviews} />
      <CloseButton ghost icon={<CloseIcon />} onClick={goHome} />
      <ImageCorner isLoading={isLoading}>
        <HandIcon />
      </ImageCorner>
    </>
  );
};
