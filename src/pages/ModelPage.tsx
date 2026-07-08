import styled from 'styled-components';
import { CenteredContent } from '../components/centered-content';
import { Preview } from '../components/preview';

const Container = styled.div`
  position: relative;
  display: inline-block;
  padding: 10px;
  max-width: 516px;
  width: 100%;
`;

const ModelPage = () => {
  return (
    <CenteredContent>
      <Container>
        <Preview />
      </Container>
    </CenteredContent>
  );
};

export default ModelPage;
