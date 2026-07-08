import { FC, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import { BackgroundGradients } from '../components/background-gradients';
import { useTheme } from '../context';
import { PrintOrderModal } from '../components/print-order-modal/PrintOrderModal';

const rotateX = keyframes`
  from { transform: rotateZ(0deg); }
  to   { transform: rotateZ(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

type Theme = 'light' | 'dark';

const Wrapper = styled.div`
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
`;

const Body = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 72px 24px 0;
  gap: 8px;
`;

const ModelArea = styled.div`
  width: 344px;
  height: 344px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CubeWrapper = styled.div`
  animation: ${rotateX} 4s linear infinite;
`;

const ModelImage = styled.img`
  width: 344px;
  height: 344px;
  object-fit: contain;
  animation: ${fadeIn} 0.5s ease;
`;

const CubeIcon = ({ theme }: { theme: Theme }) => (
  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M60 10L105 35V85L60 110L15 85V35L60 10Z"
      stroke={theme === 'dark' ? 'white' : 'rgba(8,8,8,0.8)'}
      strokeWidth="2.5"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M60 10V60M60 60L15 35M60 60L105 35"
      stroke={theme === 'dark' ? 'white' : 'rgba(8,8,8,0.8)'}
      strokeWidth="2.5"
      strokeLinejoin="round"
    />
  </svg>
);

const InfoBlock = styled.div`
  width: 360px;
  height: 174px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-shrink: 0;
`;

const PromptSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const PromptLabel = styled.span<{ $theme: Theme }>`
  font-family: 'SB Sans Text', sans-serif;
  font-size: 15px;
  font-weight: 700;
  line-height: 20px;
  color: ${({ $theme }) => $theme === 'dark' ? 'rgba(255,255,255,0.56)' : 'rgba(8,8,8,0.56)'};
`;

const PromptTextRow = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 6px;
`;

const PromptText = styled.p<{ $theme: Theme }>`
  margin: 0;
  font-family: 'SB Sans Text', sans-serif;
  font-size: 17px;
  line-height: 24px;
  color: ${({ $theme }) => $theme === 'dark' ? 'rgba(255,255,255,0.96)' : 'rgba(8,8,8,0.96)'};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const PromptMore = styled.span<{ $theme: Theme }>`
  font-family: 'SB Sans Text', sans-serif;
  font-size: 15px;
  line-height: 24px;
  color: ${({ $theme }) => $theme === 'dark' ? 'rgba(255,255,255,0.56)' : 'rgba(8,8,8,0.56)'};
  white-space: nowrap;
  flex-shrink: 0;
`;

const PromptMeta = styled.div<{ $theme: Theme }>`
  display: flex;
  align-items: center;
  gap: 12px;
  font-family: 'SB Sans Text', sans-serif;
  font-size: 13px;
  line-height: 18px;
  color: ${({ $theme }) => $theme === 'dark' ? 'rgba(255,255,255,0.40)' : 'rgba(8,8,8,0.40)'};
`;

const PromptMetaPolygons = styled.span<{ $theme: Theme }>`
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${({ $theme }) => $theme === 'dark' ? 'rgba(255,255,255,0.40)' : 'rgba(8,8,8,0.40)'};
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionBtn = styled.button<{ $theme: Theme }>`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  border: none;
  background: ${({ $theme }) => $theme === 'dark' ? 'rgba(255,255,255,0.10)' : 'rgba(8,8,8,0.06)'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s ease;
  flex-shrink: 0;

  &:hover {
    background: ${({ $theme }) => $theme === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(8,8,8,0.12)'};
  }

  path, rect, circle {
    fill: ${({ $theme }) => $theme === 'dark' ? 'white' : 'rgba(8,8,8,0.96)'};
  }
`;

const BottomBar = styled.div<{ $theme: Theme }>`
  width: 360px;
  height: 88px;
  flex-shrink: 0;
  align-self: center;
  display: flex;
  align-items: center;
  padding: 0 16px;
  box-sizing: border-box;
`;

const BottomThumb = styled.div`
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
`;

const BottomThumbImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const BottomThumbLabel = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  font-family: 'SB Sans Text', sans-serif;
  font-size: 9px;
  font-weight: 600;
  color: #fff;
  text-align: center;
  padding: 2px 0;
`;

const BottomTools = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-around;
  margin-left: 64px;
`;

const BottomTool = styled.button<{ $theme: Theme }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ $theme }) => $theme === 'dark' ? 'rgba(255,255,255,0.40)' : 'rgba(8,8,8,0.40)'};
  padding: 4px 8px;

  span {
    font-family: 'SB Sans Text', sans-serif;
    font-size: 11px;
    line-height: 14px;
  }

  path {
    fill: ${({ $theme }) => $theme === 'dark' ? 'white' : 'rgba(8,8,8,0.96)'};
  }

  [stroke] {
    stroke: ${({ $theme }) => $theme === 'dark' ? 'white' : 'rgba(8,8,8,0.96)'};
  }
`;

const iconColor = (theme: Theme) => theme === 'dark' ? 'white' : 'rgba(8,8,8,0.96)';
const iconOpacity = 0.47;

const CreatePrintModelPage: FC = () => {
  const { theme } = useTheme();
  const location = useLocation();
  const prompt: string = location.state?.prompt ?? '';
  const [modelReady, setModelReady] = useState(false);
  const [printModalOpen, setPrintModalOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setModelReady(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  const ic = iconColor(theme);

  return (
    <Wrapper>
      <BackgroundGradients mode="3dprint" />

      <Body>
        <ModelArea>
          {modelReady ? (
            <ModelImage src="/img/printExample.png" alt="3D модель" />
          ) : (
            <CubeWrapper>
              <CubeIcon theme={theme} />
            </CubeWrapper>
          )}
        </ModelArea>

        <InfoBlock>
          {prompt && (
            <PromptSection>
              <PromptLabel $theme={theme}>Промпт:</PromptLabel>
              <PromptTextRow>
                <PromptText $theme={theme}>{prompt}</PromptText>
                <PromptMore $theme={theme}>ещё</PromptMore>
              </PromptTextRow>
              <PromptMeta $theme={theme}>
                <span>Kandinsky 3D • V1-245</span>
                <PromptMetaPolygons $theme={theme}>
                  <svg viewBox="0 0 16 16" fill="none" width="12" height="12">
                    <path d="M8 2L14 6V10L8 14L2 10V6L8 2Z" stroke="currentColor" strokeWidth="1.2" fill="none"/>
                  </svg>
                  27 357
                </PromptMetaPolygons>
              </PromptMeta>
            </PromptSection>
          )}

          <ActionButtons>
            <ActionGroup>
              <ActionBtn $theme={theme} aria-label="Скачать">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9.75 0.75C9.75 0.335786 9.41422 0 9 0C8.58579 0 8.25 0.335786 8.25 0.75V12.4393L5.78033 9.96967C5.48744 9.67678 5.01257 9.67678 4.71967 9.96967C4.42678 10.2626 4.42678 10.7374 4.71967 11.0303L8.46967 14.7803C8.76257 15.0732 9.23744 15.0732 9.53033 14.7803L13.2803 11.0303C13.5732 10.7374 13.5732 10.2626 13.2803 9.96967C12.9874 9.67678 12.5126 9.67678 12.2197 9.96967L9.75 12.4393V0.75Z" fill={ic} fillOpacity="0.96"/>
                  <path d="M1.5 7.75C1.5 7.33579 1.16421 7 0.750001 7C0.335787 7 2.56452e-07 7.33579 2.56452e-07 7.75V13.2814C-8.2075e-06 13.9548 -1.51284e-05 14.5055 0.0365521 14.9531C0.074402 15.4163 0.155137 15.8347 0.35423 16.2255C0.665818 16.837 1.163 17.3342 1.77453 17.6458C2.16527 17.8449 2.58367 17.9256 3.04693 17.9634C3.49448 18 4.04515 18 4.71849 18H13.2814C13.9548 18 14.5055 18 14.9531 17.9634C15.4163 17.9256 15.8347 17.8449 16.2255 17.6458C16.837 17.3342 17.3342 16.837 17.6458 16.2255C17.8449 15.8347 17.9256 15.4163 17.9634 14.9531C18 14.5055 18 13.9548 18 13.2814V7.75C18 7.33579 17.6642 7 17.25 7C16.8358 7 16.5 7.33579 16.5 7.75V13.25C16.5 13.9624 16.4994 14.4517 16.4684 14.8309C16.4382 15.2014 16.3827 15.4004 16.3093 15.5445C16.1415 15.8738 15.8738 16.1415 15.5445 16.3093C15.4004 16.3827 15.2014 16.4382 14.8309 16.4684C14.4517 16.4994 13.9624 16.5 13.25 16.5H4.75C4.03756 16.5 3.54833 16.4994 3.16908 16.4684C2.79858 16.4382 2.59956 16.3827 2.45552 16.3093C2.12623 16.1415 1.85852 15.8738 1.69074 15.5445C1.61735 15.4004 1.56184 15.2014 1.53157 14.8309C1.50058 14.4517 1.5 13.9624 1.5 13.25V7.75Z" fill={ic} fillOpacity="0.96"/>
                </svg>
              </ActionBtn>
              <ActionBtn $theme={theme} aria-label="Печать" onClick={() => setPrintModalOpen(true)}>
                <svg width="20" height="17" viewBox="0 0 20 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M5 3.5V1.5H15V3.5H5ZM3.5 3.5V0.5C3.5 0.223858 3.72386 0 4 0H16C16.2761 0 16.5 0.223858 16.5 0.5V3.5C18.433 3.5 20 5.067 20 7V12.5C20 13.0523 19.5523 13.5 19 13.5H16.5V16.5C16.5 16.7761 16.2761 17 16 17H4C3.72386 17 3.5 16.7761 3.5 16.5V13.5H1C0.447716 13.5 0 13.0523 0 12.5V7C0 5.067 1.567 3.5 3.5 3.5ZM18.5 12H16.5V10.5C16.5 10.2239 16.2761 10 16 10H4C3.72386 10 3.5 10.2239 3.5 10.5V12H1.5V7C1.5 5.89543 2.39543 5 3.5 5H16.5C17.6046 5 18.5 5.89543 18.5 7V12ZM5 15.5H15V11.5H5V15.5ZM15.5 8.5C16.0523 8.5 16.5 8.05229 16.5 7.5C16.5 6.94772 16.0523 6.5 15.5 6.5C14.9477 6.5 14.5 6.94772 14.5 7.5C14.5 8.05229 14.9477 8.5 15.5 8.5Z" fill={ic} fillOpacity="0.96"/>
                </svg>
              </ActionBtn>
              <ActionBtn $theme={theme} aria-label="Поделиться">
                <svg width="20" height="17" viewBox="0 0 20 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12.5001 1.85371C12.5 1.89168 12.5 1.93181 12.5 1.97427V4.41496C12.5 4.89366 12.1177 5.28474 11.6391 5.29561C6.60979 5.40992 2.48329 9.08932 1.65256 13.8859C2.35109 13.0392 3.11777 12.2527 4.08905 11.6071C5.69011 10.5429 7.77851 9.89914 10.9248 9.80494L10.9452 9.80433C11.0638 9.80074 11.1955 9.79676 11.3107 9.80324C11.4441 9.81073 11.6153 9.83396 11.794 9.92037C12.0345 10.0366 12.2353 10.2315 12.3586 10.4683C12.4512 10.6461 12.479 10.8187 12.4903 10.9514C12.5001 11.0673 12.5 11.2007 12.5 11.3224L12.5 13.1115C12.5 13.154 12.5 13.1941 12.5001 13.2321C12.5269 13.2053 12.5553 13.1769 12.5854 13.1469L18.1893 7.5429L12.5854 1.93892C12.5553 1.90889 12.5269 1.88052 12.5001 1.85371ZM11.2995 0.438197C11.5594 0.133935 11.9492 -0.0275338 12.3481 0.00386013C12.6925 0.0309701 12.9495 0.230292 13.0922 0.349781C13.2482 0.480334 13.4289 0.661097 13.6242 0.85648L19.7803 7.01257C20.0732 7.30546 20.0732 7.78034 19.7803 8.07323L13.6242 14.2293C13.4289 14.4247 13.2482 14.6055 13.0922 14.736C12.9495 14.8555 12.6925 15.0548 12.3481 15.0819C11.9492 15.1133 11.5594 14.9519 11.2995 14.6476C11.0751 14.3849 11.0343 14.0622 11.0179 13.8768C11 13.6742 11 13.4186 11 13.1423L11 11.3429C11 11.3291 11 11.316 11 11.3034C10.9902 11.3037 10.9802 11.304 10.9697 11.3043C8.01273 11.3928 6.22162 11.9907 4.9194 12.8563C3.60853 13.7276 2.72439 14.9083 1.62592 16.3752L1.59021 16.4229C1.0814 17.1023 0 16.7432 0 15.8935L0 15.6678C0 9.41769 4.83431 4.27558 11 3.82494L11 1.94347C11 1.66719 11 1.41157 11.0179 1.20899C11.0343 1.02358 11.0751 0.70094 11.2995 0.438197Z" fill={ic} fillOpacity="0.96"/>
                </svg>
              </ActionBtn>
              <ActionBtn $theme={theme} aria-label="Удалить">
                <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 8C6.41421 8 6.75 8.33579 6.75 8.75V14.75C6.75 15.1642 6.41421 15.5 6 15.5C5.58579 15.5 5.25 15.1642 5.25 14.75V8.75C5.25 8.33579 5.58579 8 6 8Z" fill={ic} fillOpacity="0.96"/>
                  <path d="M10.75 8.75C10.75 8.33579 10.4142 8 10 8C9.58579 8 9.25 8.33579 9.25 8.75V14.75C9.25 15.1642 9.58579 15.5 10 15.5C10.4142 15.5 10.75 15.1642 10.75 14.75V8.75Z" fill={ic} fillOpacity="0.96"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M4.25 3C4.25 1.34315 5.59315 0 7.25 0H8.75C10.4069 0 11.75 1.34315 11.75 3V3.75H15.25C15.6642 3.75 16 4.08579 16 4.5C16 4.91421 15.6642 5.25 15.25 5.25H14V14.0805C14 14.6146 14 15.0605 13.9703 15.4247C13.9392 15.8046 13.8721 16.1612 13.7003 16.4985C13.4366 17.0159 13.0159 17.4366 12.4985 17.7003C12.1612 17.8721 11.8046 17.9392 11.4247 17.9703C11.0604 18 10.6146 18 10.0805 18H5.91955C5.3854 18 4.93956 18 4.57533 17.9703C4.19545 17.9392 3.83879 17.8721 3.50153 17.7003C2.98408 17.4366 2.56338 17.0159 2.29973 16.4985C2.12789 16.1612 2.06078 15.8046 2.02974 15.4247C1.99998 15.0604 1.99999 14.6146 2 14.0804L2 5.25H0.75C0.335786 5.25 0 4.91421 0 4.5C0 4.08579 0.335786 3.75 0.75 3.75H4.25V3ZM5.75 3.75H10.25V3C10.25 2.17157 9.57843 1.5 8.75 1.5H7.25C6.42157 1.5 5.75 2.17157 5.75 3V3.75ZM3.5 5.25V14.05C3.5 14.6224 3.50058 15.0066 3.52476 15.3025C3.54822 15.5896 3.5901 15.7269 3.63624 15.8175C3.75608 16.0527 3.94731 16.2439 4.18251 16.3638C4.27307 16.4099 4.41035 16.4518 4.69748 16.4752C4.99336 16.4994 5.37757 16.5 5.95 16.5H10.05C10.6224 16.5 11.0066 16.4994 11.3025 16.4752C11.5896 16.4518 11.7269 16.4099 11.8175 16.3638C12.0527 16.2439 12.2439 16.0527 12.3638 15.8175C12.4099 15.7269 12.4518 15.5896 12.4752 15.3025C12.4994 15.0066 12.5 14.6224 12.5 14.05V5.25H3.5Z" fill={ic} fillOpacity="0.96"/>
                </svg>
              </ActionBtn>
            </ActionGroup>
            <ActionBtn $theme={theme} aria-label="Повторить">
              <svg width="22" height="18" viewBox="0 0 22 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M4.10903 3.41468C2.4377 4.58461 1.5 6.12891 1.5 7.75C1.5 9.37109 2.4377 10.9154 4.10903 12.0853C5.41075 12.9965 7.12409 13.6511 9.06125 13.895L7.67383 12.2301L8.82617 11.2699L11.8063 14.846L8.23014 17.8262L7.26986 16.6738L8.82594 15.3771C6.68812 15.1007 4.75776 14.3704 3.24884 13.3142C1.30087 11.9506 0 9.9949 0 7.75C0 5.5051 1.30087 3.5494 3.24884 2.18583C5.19916 0.820598 7.85357 0 10.75 0C13.6464 0 16.3008 0.820598 18.2512 2.18583C20.1991 3.5494 21.5 5.5051 21.5 7.75C21.5 11.3379 18.2328 14.141 14.1274 15.1127L13.782 13.653C17.5786 12.7544 20 10.3248 20 7.75C20 6.12891 19.0623 4.58461 17.391 3.41468C15.722 2.24641 13.3764 1.5 10.75 1.5C8.12359 1.5 5.77799 2.24641 4.10903 3.41468Z" fill={ic} fillOpacity="0.96"/>
              </svg>
            </ActionBtn>
          </ActionButtons>
        </InfoBlock>
      </Body>

      <PrintOrderModal
        open={printModalOpen}
        onClose={() => setPrintModalOpen(false)}
        theme={theme}
        modelImage={modelReady ? '/img/printExample.png' : undefined}
      />

      <BottomBar $theme={theme}>
        <BottomThumb>
          <BottomThumbImg src="/img/printExample.png" alt="preview" />
          <BottomThumbLabel>Модель</BottomThumbLabel>
        </BottomThumb>
        <BottomTools>
          <BottomTool $theme={theme} aria-label="HDRI карта">
            <svg width="27" height="27" viewBox="0 0 27 27" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.3374 0C13.8897 0 14.3374 0.447715 14.3374 1V3.82843C14.3374 4.38071 13.8897 4.82843 13.3374 4.82843C12.7851 4.82843 12.3374 4.38071 12.3374 3.82843V1C12.3374 0.447715 12.7851 0 13.3374 0Z" fill={ic} fillOpacity={iconOpacity}/>
              <path d="M2.96362 2.96354C3.35415 2.57302 3.98731 2.57302 4.37784 2.96354L6.37784 4.96354C6.76836 5.35407 6.76836 5.98723 6.37784 6.37776C5.98731 6.76828 5.35415 6.76828 4.96362 6.37776L2.96362 4.37776C2.5731 3.98723 2.5731 3.35407 2.96362 2.96354Z" fill={ic} fillOpacity={iconOpacity}/>
              <path fillRule="evenodd" clipRule="evenodd" d="M6.67074 13.3372C6.67074 9.65534 9.6555 6.67057 13.3374 6.67057C17.0193 6.67057 20.0041 9.65534 20.0041 13.3372C20.0041 17.0191 17.0193 20.0039 13.3374 20.0039C9.6555 20.0039 6.67074 17.0191 6.67074 13.3372ZM13.3374 8.67057C10.7601 8.67057 8.67074 10.7599 8.67074 13.3372C8.67074 15.9146 10.7601 18.0039 13.3374 18.0039C15.9147 18.0039 18.0041 15.9146 18.0041 13.3372C18.0041 10.7599 15.9147 8.67057 13.3374 8.67057Z" fill={ic} fillOpacity={iconOpacity}/>
              <path d="M21.7112 20.2969C21.3206 19.9064 20.6875 19.9063 20.297 20.2969C19.9064 20.6874 19.9064 21.3206 20.297 21.7111L22.297 23.7111C22.6875 24.1016 23.3206 24.1016 23.7112 23.7111C24.1017 23.3206 24.1017 22.6874 23.7112 22.2969L21.7112 20.2969Z" fill={ic} fillOpacity={iconOpacity}/>
              <path d="M23.7112 2.96354C24.1017 3.35407 24.1017 3.98723 23.7112 4.37776L21.7112 6.37776C21.3206 6.76828 20.6875 6.76828 20.297 6.37776C19.9064 5.98723 19.9064 5.35407 20.297 4.96354L22.297 2.96354C22.6875 2.57302 23.3206 2.57302 23.7112 2.96354Z" fill={ic} fillOpacity={iconOpacity}/>
              <path d="M6.37784 21.7111C6.76836 21.3206 6.76836 20.6874 6.37784 20.2969C5.98731 19.9064 5.35415 19.9064 4.96362 20.2969L2.96362 22.2969C2.5731 22.6874 2.5731 23.3206 2.96363 23.7111C3.35415 24.1016 3.98732 24.1016 4.37784 23.7111L6.37784 21.7111Z" fill={ic} fillOpacity={iconOpacity}/>
              <path d="M14.3374 22.8464C14.3374 22.2941 13.8897 21.8464 13.3374 21.8464C12.7851 21.8464 12.3374 22.2941 12.3374 22.8464L12.3374 25.6748C12.3374 26.2271 12.7851 26.6748 13.3374 26.6748C13.8897 26.6748 14.3374 26.2271 14.3374 25.6748L14.3374 22.8464Z" fill={ic} fillOpacity={iconOpacity}/>
              <path d="M26.6748 13.3374C26.6748 13.8897 26.2271 14.3374 25.6748 14.3374H22.8464C22.2941 14.3374 21.8464 13.8897 21.8464 13.3374C21.8464 12.7851 22.2941 12.3374 22.8464 12.3374H25.6748C26.2271 12.3374 26.6748 12.7851 26.6748 13.3374Z" fill={ic} fillOpacity={iconOpacity}/>
              <path d="M3.82843 14.3374C4.38071 14.3374 4.82843 13.8897 4.82843 13.3374C4.82843 12.7851 4.38071 12.3374 3.82843 12.3374L0.999999 12.3374C0.447714 12.3374 0 12.7851 0 13.3374C0 13.8897 0.447716 14.3374 1 14.3374L3.82843 14.3374Z" fill={ic} fillOpacity={iconOpacity}/>
            </svg>
            <span>HDRI карта</span>
          </BottomTool>
          <BottomTool $theme={theme} aria-label="Текстуры">
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.4714 0.195262C14.7318 0.455612 14.7318 0.877722 14.4714 1.13807L1.13807 14.4714C0.877722 14.7318 0.455612 14.7318 0.195262 14.4714C-0.0650874 14.2111 -0.0650874 13.7889 0.195262 13.5286L13.5286 0.195262C13.7889 -0.0650874 14.2111 -0.0650874 14.4714 0.195262Z" fill={ic} fillOpacity={iconOpacity}/>
              <path d="M18.7071 1.29289C19.0976 1.68342 19.0976 2.31658 18.7071 2.70711L2.70711 18.7071C2.31658 19.0976 1.68342 19.0976 1.29289 18.7071C0.902369 18.3166 0.902369 17.6834 1.29289 17.2929L17.2929 1.29289C17.6834 0.902369 18.3166 0.902369 18.7071 1.29289Z" fill={ic} fillOpacity={iconOpacity}/>
              <path d="M24.0404 6.62623C24.431 7.01675 24.431 7.64992 24.0404 8.04044L8.04044 24.0404C7.64992 24.431 7.01675 24.431 6.62623 24.0404C6.2357 23.6499 6.2357 23.0168 6.62623 22.6262L22.6262 6.62623C23.0168 6.2357 23.6499 6.2357 24.0404 6.62623Z" fill={ic} fillOpacity={iconOpacity}/>
              <path d="M25.1381 11.8047C25.3984 11.5444 25.3984 11.1223 25.1381 10.8619C24.8777 10.6016 24.4556 10.6016 24.1953 10.8619L10.8619 24.1953C10.6016 24.4556 10.6016 24.8777 10.8619 25.1381C11.1223 25.3984 11.5444 25.3984 11.8047 25.1381L25.1381 11.8047Z" fill={ic} fillOpacity={iconOpacity}/>
              <path d="M22.0404 4.70711C22.431 4.31658 22.431 3.68342 22.0404 3.29289C21.6499 2.90237 21.0168 2.90237 20.6262 3.29289L3.29289 20.6262C2.90237 21.0168 2.90237 21.6499 3.29289 22.0404C3.68342 22.431 4.31658 22.431 4.70711 22.0404L22.0404 4.70711Z" fill={ic} fillOpacity={iconOpacity}/>
              <path d="M23.4714 17.1953C23.7318 17.4556 23.7318 17.8777 23.4714 18.1381L18.1381 23.4714C17.8777 23.7318 17.4556 23.7318 17.1953 23.4714C16.9349 23.2111 16.9349 22.7889 17.1953 22.5286L22.5286 17.1953C22.7889 16.9349 23.2111 16.9349 23.4714 17.1953Z" fill={ic} fillOpacity={iconOpacity}/>
              <path d="M8.13807 2.80474C8.39842 2.54439 8.39842 2.12228 8.13807 1.86193C7.87772 1.60158 7.45561 1.60158 7.19526 1.86193L1.86193 7.19526C1.60158 7.45561 1.60158 7.87772 1.86193 8.13807C2.12228 8.39842 2.54439 8.39842 2.80474 8.13807L8.13807 2.80474Z" fill={ic} fillOpacity={iconOpacity}/>
            </svg>
            <span>Текстуры</span>
          </BottomTool>
          <BottomTool $theme={theme} aria-label="Сетка">
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.66667 0V29.3333M29.3333 8.66667L0 8.66667M20.6667 0V29.3333M29.3333 20.6667L0 20.6667" stroke={ic} strokeOpacity={iconOpacity} strokeWidth="2"/>
            </svg>
            <span>Сетка</span>
          </BottomTool>
        </BottomTools>
      </BottomBar>
    </Wrapper>
  );
};

export default CreatePrintModelPage;
