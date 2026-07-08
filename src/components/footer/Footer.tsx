import { FC, useState } from 'react';
import { useTheme } from '../../context';
import { DTaaSLogoIcon } from '../Icons';
import styles from './Footer.module.css';
import { BodyS, BodyXS, Link, Tooltip } from '@salutejs/plasma-giga';
import { SUPPORT_EMAIL } from '../../utils/const';
import styled from 'styled-components';
import { IconMailOutline } from '@salutejs/plasma-icons'
import { textAccent, textSecondary } from '@salutejs/plasma-themes/tokens';

const TooltipContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 6px;
`;

const TooltipText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 11px 14px;

  > ul {
    padding: 0;
    margin-left: 20px;

    > li {
      padding: 0;
      margin: 0;
    }
  }
`;



export const Footer: FC = () => {
  const { theme } = useTheme();
  const [isCopied, setIsCopied] = useState(false)

   const handleCopyClick = async () => {
    try {
      // Use the Clipboard API to write text
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      setIsCopied(true);
      
      // Reset the "Copied!" message after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2500);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };


  return (
    <div className={styles.footer} data-theme={theme}>
      <div className={styles.footer__link}>
        <Link view='secondary' href="/License_ru.pdf" target="_blank" rel="noopener noreferrer" >
          Публичная лицензия
        </Link>
        <Link view='secondary' href="/Privacy_policy_ru.pdf" target="_blank" rel="noopener noreferrer" >
          Политика приватности
        </Link>
        <Link view='secondary' href="/rules" >
          Политика использования
        </Link>
        <Tooltip 
          maxWidth={269}
          opened={isCopied}
          placement='top' 
          hasArrow={false} 
          offset={[0,150]}
          text={
            <BodyXS>Скопировано в буфер обмена</BodyXS>
            } 
          target={
            <Tooltip 
              animated
              maxWidth={269}
              text={
                <TooltipContainer>
                <TooltipText style={{ maxWidth: 269 }}>
                    <BodyS>Напишите нам</BodyS>
                    <BodyS color={textSecondary}>Электронная почта</BodyS>
                    <BodyS>{SUPPORT_EMAIL}</BodyS>
                    <BodyS color={textSecondary}>Ответим по будням с 9 до 18</BodyS>
                </TooltipText>
                <IconMailOutline color={textAccent}/>
                </TooltipContainer>
                
              } 
              placement='top'
              trigger='click'
              // @ts-expect-error closeOnOverlayClick is presented but not shown
              closeOnOverlayClick
              closeOnEsc
              onClick={handleCopyClick}
              hasArrow
              target={
                <Link view='secondary'>Обратная связь</Link>
          }
        />
        } /> 
        
      </div>
      <div style={{cursor: 'default'}}>
        <DTaaSLogoIcon />
        <BodyXS>Бизнес-партнер</BodyXS>
      </div>
    </div>
  );
};