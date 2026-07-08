import { FC, useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { useTheme } from '../context';
import { BackgroundGradients } from '../components/background-gradients';

const PAGE_SIZE = 6;
const FADE_DURATION = 500;
const PAGE_INTERVAL = 3000;

const Wrapper = styled.div`
  width: 100%;
  height: calc(100dvh - 72px);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  padding-top: 24px;
  box-sizing: border-box;

  @media (max-width: 768px) {
    height: auto;
    min-height: calc(100dvh - 72px);
    align-items: flex-start;
    padding-top: 16px;
    overflow-y: auto;
  }
`;

const Container = styled.div`
  display: flex;
  gap: 8px;
  width: 91.11%;
  height: 88.66%;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;
    height: auto;
    padding: 0 16px 24px;
    box-sizing: border-box;
    gap: 8px;
  }
`;

const Section = styled.div<{ $theme: 'light' | 'dark'; $flex: number; $mobileOrder?: number }>`
  flex: ${(props) => props.$flex};
  height: 100%;
  border-radius: 16px;
  background: ${(props) => (props.$theme === 'light' ? '#ffffff' : '#171717')};
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 768px) {
    flex: none;
    height: auto;
    width: 100%;
    order: ${(props) => props.$mobileOrder ?? 0};
  }
`;

const SectionTitle = styled.h2<{ $theme: 'light' | 'dark' }>`
  margin: 0;
  font-family: 'SB Sans Display', sans-serif;
  font-size: 32px;
  line-height: 36px;
  font-weight: 400;
  color: ${(props) => (props.$theme === 'light' ? 'rgba(8, 8, 8, 1)' : 'rgba(255, 255, 255, 1)')};
  padding: 24px 20px 0;
  text-align: center;
  height: 80px;
  flex-shrink: 0;

  @media (max-width: 768px) {
    font-size: 22px;
    line-height: 28px;
    height: auto;
    padding: 16px 16px 12px;
  }
`;

const CardList = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 8px 20px 20px;

  @media (max-width: 768px) {
    max-height: 240px;
    padding: 8px 16px 16px;
  }
`;

const CardGridWrapper = styled.div<{ $visible: boolean }>`
  flex: 1;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px 24px;
  padding: 32px 32px 20px;
  align-content: flex-start;
  opacity: ${(props) => (props.$visible ? 1 : 0)};
  transition: opacity ${FADE_DURATION}ms ease;

  @media (max-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px 12px;
    padding: 16px 16px 12px;
  }
`;

const GridCard = styled.article`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const GridImg = styled.img`
  width: 143px;
  height: 126px;
  border-radius: 8px;
  object-fit: cover;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 100%;
    height: 80px;
  }
`;

const GridCardText = styled.span<{ $theme: 'light' | 'dark' }>`
  font-family: 'SB Sans Text', sans-serif;
  font-size: 16px;
  line-height: 20px;
  margin-top: 16px;
  color: ${(props) => (props.$theme === 'light' ? '#080808' : '#ffffff')};

  @media (max-width: 768px) {
    font-size: 12px;
    line-height: 16px;
    margin-top: 8px;
    text-align: center;
  }
`;

const StatusBar = styled.div<{ $theme: 'light' | 'dark' }>`
  flex-shrink: 0;
  padding: 16px 32px 24px;
  border-top: 1px solid ${(props) => (props.$theme === 'light' ? 'rgba(8,8,8,0.08)' : 'rgba(255,255,255,0.08)')};

  @media (max-width: 768px) {
    padding: 12px 16px 16px;
  }
`;

const StatusRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 12px;
`;

const StatusLabel = styled.span<{ $theme: 'light' | 'dark' }>`
  font-family: 'SB Sans Text', sans-serif;
  font-size: 20px;
  line-height: 24px;
  font-weight: 500;
  color: ${(props) => (props.$theme === 'light' ? '#080808' : '#ffffff')};

  @media (max-width: 768px) {
    font-size: 14px;
    line-height: 18px;
  }
`;

const StatusTime = styled.span<{ $theme: 'light' | 'dark' }>`
  font-family: 'SB Sans Text', sans-serif;
  font-size: 20px;
  line-height: 24px;
  font-weight: 400;
  color: ${(props) => (props.$theme === 'light' ? 'rgba(8,8,8,0.4)' : 'rgba(255,255,255,0.4)')};

  @media (max-width: 768px) {
    font-size: 14px;
    line-height: 18px;
  }
`;

const progressAnim = keyframes`
  0%   { width: 0% }
  100% { width: 30% }
`;

const ProgressTrack = styled.div<{ $theme: 'light' | 'dark' }>`
  width: 100%;
  height: 4px;
  border-radius: 2px;
  background: ${(props) => (props.$theme === 'light' ? 'rgba(8,8,8,0.08)' : 'rgba(255,255,255,0.08)')};
  overflow: hidden;
`;

const ProgressFill = styled.div`
  height: 100%;
  border-radius: 2px;
  background: linear-gradient(90deg, #3d6aff 0%, #6ea8fe 100%);
  animation: ${progressAnim} 2s ease-out forwards;
`;

const SectionCard = styled.article`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
`;

const StyledImg = styled.img`
  width: 72px;
  height: 72px;
  border-radius: 8px;
  flex-shrink: 0;
  object-fit: cover;
`;

const StyledCardText = styled.span<{ $theme: 'light' | 'dark' }>`
  font-family: 'SB Sans Text', sans-serif;
  font-size: 16px;
  line-height: 20px;
  color: ${(props) => (props.$theme === 'light' ? '#080808' : '#ffffff')};
`;

const PrinterPage: FC = () => {
  const { theme } = useTheme();
  const mockArr = Array.from({ length: 12 }, (_, i) => ({ id: i }));

  const totalPages = Math.ceil(mockArr.length / PAGE_SIZE);
  const [page, setPage] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (mockArr.length <= PAGE_SIZE) return;
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setPage((p) => (p + 1) % totalPages);
        setVisible(true);
      }, FADE_DURATION);
    }, PAGE_INTERVAL);
    return () => clearInterval(interval);
  }, [totalPages, mockArr.length]);

  const visibleItems = mockArr.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  return (
    <Wrapper>
      <BackgroundGradients />
      <Container>
        <Section $theme={theme} $flex={316} $mobileOrder={2}>
          <SectionTitle $theme={theme}>В очереди</SectionTitle>
          <CardList>
            {mockArr.map((item) => (
              <SectionCard key={item.id}>
                <StyledImg src="/img/mock.png" alt="mock" />
                <StyledCardText $theme={theme}>Название модели</StyledCardText>
              </SectionCard>
            ))}
          </CardList>
        </Section>

        <Section $theme={theme} $flex={664} $mobileOrder={1}>
          <CardGridWrapper $visible={visible}>
            {visibleItems.map((item) => (
              <GridCard key={item.id}>
                <GridImg src="/img/mock.png" alt="mock" />
                <GridCardText $theme={theme}>Название модели</GridCardText>
              </GridCard>
            ))}
          </CardGridWrapper>

          <StatusBar $theme={theme}>
            <StatusRow>
              <StatusLabel $theme={theme}>Оставшееся время печати</StatusLabel>
              <StatusTime $theme={theme}>4 мин.</StatusTime>
            </StatusRow>
            <ProgressTrack $theme={theme}>
              <ProgressFill />
            </ProgressTrack>
          </StatusBar>
        </Section>

        <Section $theme={theme} $flex={316} $mobileOrder={3}>
          <SectionTitle $theme={theme}>Готовы</SectionTitle>
          <CardList>
            {mockArr.map((item) => (
              <SectionCard key={item.id}>
                <StyledImg src="/img/mock.png" alt="mock" />
                <StyledCardText $theme={theme}>Название модели</StyledCardText>
              </SectionCard>
            ))}
          </CardList>
        </Section>
      </Container>
    </Wrapper>
  );
};

export default PrinterPage;
