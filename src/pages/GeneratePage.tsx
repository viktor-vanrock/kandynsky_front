import styled from 'styled-components';
import { PromptInput } from '../components/prompt-input';
import { CenteredContent } from '../components/centered-content';
import styles from './GeneratePage.module.css';
import { useInIframe } from '../hooks/useInIframe';
import classNames from 'classnames';
import { useLocation } from 'react-router-dom';
import PreviewsPage from './PreviewsPage';
import { useIdleWarning } from '../hooks/useIdleHook';

const Container = styled.div`
  position: relative;
  display: inline-block;
  padding: 10px;
  max-width: 800px;
  width: 100%;

  @media (max-width: 959px) {
    margin: 0 16px;
  }
`;

const GeneratePage = () => {
  const inIframe = useInIframe();
  const location = useLocation();
  const isMainPage = location.pathname === '/';
  const maxIdleTime = 2 * 60 * 60 * 1000; // 2 часа = максимальное время бездействия
  const isIdle = useIdleWarning(maxIdleTime);

  return (
    <>
      <CenteredContent className={classNames(styles.searchWrapper, inIframe && styles.iframe)}>
        <Container>
          {/* Показываем предупреждение только на главной в iframe и только если простаивает 2 часа */}
          {inIframe && isMainPage && isIdle && (
            <div
              style={{
                background: '#fff4e0',
                border: '1px solid #ffe58f',
                borderRadius: 12,
                padding: '18px 24px',
                color: '#a87400',
                marginBottom: 20,
                textAlign: 'center',
                fontSize: 18,
                fontWeight: 500,
              }}
            >
              Ваша сессия была неактивна более 2 часов.
              <br />
              Для корректной работы, пожалуйста, обновите страницу.
            </div>
          )}
          <PromptInput />
        </Container>
      </CenteredContent>
      <PreviewsPage onMain={true} />
    </>
  );
};

export default GeneratePage;
