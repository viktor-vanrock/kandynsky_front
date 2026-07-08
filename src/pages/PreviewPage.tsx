import { useEffect } from 'react';
import styled from 'styled-components';
import { CenteredContent } from '../components/centered-content';
import { Preview } from '../components/preview';
import styles from './PreviewPage.module.css';
import { BackgroundGradients } from '../components/background-gradients';
import { useInIframe } from '../hooks/useInIframe.ts';
import { postIframeScrollUp } from '../hooks/useIframeAutoResize.ts';

const Container = styled.div`
  position: relative;
  padding: 10px;

  @media (max-width: 560px) {
    margin: 8px;
  }
`;
// TODO новая превьюха @vsgribov

// const OpenModalButton = styled.button`
//   position: fixed;
//   bottom: 24px;
//   right: 24px;
//   padding: 12px 24px;
//   background: #fff;
//   border: 1px solid #d9d9d9;
//   border-radius: 8px;
//   cursor: pointer;
//   font-size: 14px;
//   font-weight: 500;
//   transition: all 0.2s;
//   z-index: 100;

//   &:hover {
//     background: #f5f5f5;
//     border-color: #000;
//   }

//   @media (max-width: 560px) {
//     bottom: 16px;
//     right: 16px;
//   }
// `;

const PreviewPage = () => {
  // TODO: едет верстка. поправить @vsgribov
  // const [isModalVisible, setIsModalVisible] = useState(false);
  const inIframe = useInIframe();

  useEffect(() => {
    if (!inIframe) return;
    postIframeScrollUp('preview');
  }, [inIframe]);

  // const handleOpenModal = () => {
  //   setIsModalVisible(true);
  // };

  // const handleCloseModal = () => {
  //   setIsModalVisible(false);
  // };

  return (
    <>
    <BackgroundGradients mode={'standard'}/>
    <CenteredContent className={styles.content}>
      <Container className={styles.contentContainer}>
        <Preview />
        {/* TODO: за кнопкой новая модалка для превью. нужно доработать @vsgribov
        <OpenModalButton onClick={handleOpenModal}>
          Показать генерацию
        </OpenModalButton>
        <GenerationModal visible={isModalVisible} onClose={handleCloseModal} /> */}
      </Container>
    </CenteredContent>
    </>
  );
};

export default PreviewPage;
