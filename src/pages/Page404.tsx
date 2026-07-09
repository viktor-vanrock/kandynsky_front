import styled from 'styled-components';
import styles from './Page404.module.css';
import { useLocale } from '../context';

const Page404Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const NotFoundText = styled.span`
  font-family: 'SB Sans Display', sans-serif;
  font-size: 48px;
  font-weight: 600;
  line-height: 52px;
  text-align: center;
`;

const ErrorCode = styled.span`
font-family: 'SB Sans Display', sans-serif;
  font-size: 128px;
  font-weight: 600;
  line-height: 128px;
  text-align: center;
`;

const Page404 = () => {
  const { t } = useLocale();
  return (
    <Page404Container className={styles.container}>
      <NotFoundText>{t.pageNotFound}</NotFoundText>
      <ErrorCode>404</ErrorCode>
    </Page404Container>
  );
};

export default Page404;
