import { createGlobalStyle } from 'styled-components';

const DocumentStyle = createGlobalStyle`
  @font-face {
    font-family: 'SB Sans Text';
    src: url('../../assets/fonts/SBSansText-Regular.woff') format('woff2'),
    url('../../assets/fonts/SBSansText-Regular.woff2') format('woff');
    font-weight: normal;
    font-style: normal;
  }

  html:root {
    font-family: 'SB Sans Text', sans-serif;
  }
`;
export const GlobalStyle = () => (
  <>
    <DocumentStyle />
  </>
);
